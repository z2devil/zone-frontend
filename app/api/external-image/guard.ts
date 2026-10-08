import { lookup as dnsLookup } from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import { isIPv4, isIPv6 } from 'node:net';

export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
export const FETCH_TIMEOUT_MS = 10_000;
export const MAX_REDIRECTS = 3;

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

/**
 * 代理拒绝请求时抛出，status 直接作为接口响应码。
 * 注意不能使用 401/403/429，前端 useRequest 会把它们当成登录失效或限流处理。
 */
export class ExternalImageError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}

export interface UpstreamResponse {
  status: number;
  location?: string;
  contentType?: string;
  body: AsyncIterable<Uint8Array>;
  /** 提前终止时释放连接 */
  cancel: () => void;
}

export interface UpstreamRequest {
  url: URL;
  /** 已校验过的目标 IP，连接必须固定到该地址，防止 DNS 重绑定 */
  address: string;
  signal: AbortSignal;
}

export interface FetchExternalImageDeps {
  resolveHost: (hostname: string) => Promise<string[]>;
  request: (req: UpstreamRequest) => Promise<UpstreamResponse>;
  maxBytes: number;
  timeoutMs: number;
  maxRedirects: number;
}

const parseIPv4 = (ip: string): number[] => ip.split('.').map(Number);

const isPublicIPv4 = (ip: string): boolean => {
  const [a, b, c] = parseIPv4(ip);
  if (a === 0) return false; // 0.0.0.0/8 本网络
  if (a === 10) return false; // 10/8 私有
  if (a === 100 && b >= 64 && b <= 127) return false; // 100.64/10 CGNAT
  if (a === 127) return false; // 回环
  if (a === 169 && b === 254) return false; // 链路本地，含云元数据 169.254.169.254
  if (a === 172 && b >= 16 && b <= 31) return false; // 172.16/12 私有
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return false; // IETF 保留、TEST-NET-1
  if (a === 192 && b === 88 && c === 99) return false; // 6to4 中继
  if (a === 192 && b === 168) return false; // 192.168/16 私有
  if (a === 198 && (b === 18 || b === 19)) return false; // 基准测试
  if (a === 198 && b === 51 && c === 100) return false; // TEST-NET-2
  if (a === 203 && b === 0 && c === 113) return false; // TEST-NET-3
  if (a >= 224) return false; // 组播与 240/4 保留、广播
  return true;
};

/** 展开为 8 个 16 位分组；支持 :: 压缩、末尾点分 IPv4 和 zone id */
const expandIPv6 = (input: string): number[] => {
  let ip = input.split('%')[0].toLowerCase();
  const tail = ip.match(/(\d+\.\d+\.\d+\.\d+)$/);
  if (tail) {
    const [a, b, c, d] = parseIPv4(tail[1]);
    ip =
      ip.slice(0, -tail[1].length) +
      `${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }
  const [head, rest] = ip.split('::');
  const headGroups = head ? head.split(':') : [];
  const restGroups = rest ? rest.split(':') : [];
  const missing = 8 - headGroups.length - restGroups.length;
  const groups =
    rest === undefined
      ? headGroups
      : [...headGroups, ...Array(missing).fill('0'), ...restGroups];
  return groups.map(g => parseInt(g, 16));
};

const isPublicIPv6 = (ip: string): boolean => {
  const g = expandIPv6(ip);
  // IPv4-mapped ::ffff:a.b.c.d 与 IPv4-compatible ::a.b.c.d 按内嵌 IPv4 判断
  if (g.slice(0, 5).every(x => x === 0) && (g[5] === 0xffff || g[5] === 0)) {
    if (g[5] === 0 && g[6] === 0) return false; // :: 与 ::1
    const v4 = `${g[6] >> 8}.${g[6] & 0xff}.${g[7] >> 8}.${g[7] & 0xff}`;
    return isPublicIPv4(v4);
  }
  // 只放行全球单播 2000::/3，其余（ULA、链路本地、组播、NAT64 等）一律拒绝
  if ((g[0] & 0xe000) !== 0x2000) return false;
  if (g[0] === 0x2001 && g[1] < 0x0200) return false; // 2001::/23 IETF 协议（含 Teredo）
  if (g[0] === 0x2001 && g[1] === 0x0db8) return false; // 文档地址
  if (g[0] === 0x2002) return false; // 6to4，可内嵌任意 IPv4
  return true;
};

export const isPublicAddress = (ip: string): boolean => {
  if (isIPv4(ip)) return isPublicIPv4(ip);
  if (isIPv6(ip.split('%')[0])) return isPublicIPv6(ip);
  return false;
};

const parseTarget = (raw: string, base?: URL): URL => {
  let url: URL;
  try {
    url = new URL(raw, base);
  } catch {
    throw new ExternalImageError(400, 'Invalid url');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new ExternalImageError(400, 'Unsupported protocol');
  }
  return url;
};

const resolvePublicAddress = async (
  url: URL,
  resolveHost: FetchExternalImageDeps['resolveHost']
): Promise<string> => {
  // URL 中 IPv6 主机名带方括号
  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  let addresses: string[];
  try {
    addresses = await resolveHost(hostname);
  } catch {
    throw new ExternalImageError(502, 'Failed to resolve host');
  }
  // 任一解析结果是内网地址就拒绝，避免多记录混入内网地址
  if (addresses.length === 0 || !addresses.every(isPublicAddress)) {
    throw new ExternalImageError(400, 'Address not allowed');
  }
  return addresses[0];
};

const defaultResolveHost = async (hostname: string) => {
  const records = await dnsLookup(hostname, { all: true, verbatim: true });
  return records.map(record => record.address);
};

const defaultRequest = ({ url, address, signal }: UpstreamRequest) =>
  new Promise<UpstreamResponse>((resolve, reject) => {
    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(
      url,
      {
        method: 'GET',
        signal,
        headers: { Accept: 'image/*', 'User-Agent': 'zone-image-proxy' },
        // 固定连接到已校验的 IP；https 仍用 hostname 做 SNI 与证书校验
        lookup: (_hostname, options, callback) => {
          const family = isIPv6(address) ? 6 : 4;
          if (options.all) {
            (callback as any)(null, [{ address, family }]);
          } else {
            callback(null, address, family);
          }
        },
      },
      res => {
        const location = res.headers.location;
        resolve({
          status: res.statusCode ?? 0,
          location: Array.isArray(location) ? location[0] : location,
          contentType: res.headers['content-type'],
          body: res,
          cancel: () => res.destroy(),
        });
      }
    );
    req.on('error', reject);
    req.end();
  });

export const defaultDeps: FetchExternalImageDeps = {
  resolveHost: defaultResolveHost,
  request: defaultRequest,
  maxBytes: MAX_IMAGE_BYTES,
  timeoutMs: FETCH_TIMEOUT_MS,
  maxRedirects: MAX_REDIRECTS,
};

const readBody = async (
  response: UpstreamResponse,
  maxBytes: number
): Promise<ArrayBuffer> => {
  const chunks: Uint8Array[] = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.byteLength;
    if (size > maxBytes) {
      response.cancel();
      throw new ExternalImageError(413, 'Image too large');
    }
    chunks.push(chunk);
  }
  const out = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out.buffer;
};

/**
 * 下载外链图片：只允许 http/https、公网地址，手动跟随有限次重定向并逐跳校验，
 * 只接受非 SVG 的 image/* 响应，并限制大小与总耗时。
 */
export const fetchExternalImage = async (
  rawUrl: string,
  overrides: Partial<FetchExternalImageDeps> = {}
): Promise<{ contentType: string; body: ArrayBuffer }> => {
  const deps = { ...defaultDeps, ...overrides };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), deps.timeoutMs);

  try {
    let url = parseTarget(rawUrl);
    for (let hop = 0; ; hop++) {
      const address = await resolvePublicAddress(url, deps.resolveHost);
      const response = await deps.request({
        url,
        address,
        signal: controller.signal,
      });

      if (REDIRECT_STATUSES.has(response.status)) {
        response.cancel();
        if (hop >= deps.maxRedirects || !response.location) {
          throw new ExternalImageError(502, 'Too many redirects');
        }
        url = parseTarget(response.location, url);
        continue;
      }

      if (response.status < 200 || response.status >= 300) {
        response.cancel();
        throw new ExternalImageError(502, 'Failed to fetch image');
      }

      const contentType = (response.contentType || '')
        .split(';')[0]
        .trim()
        .toLowerCase();
      // SVG 可携带脚本，直接拒绝
      if (
        !contentType.startsWith('image/') ||
        contentType === 'image/svg+xml'
      ) {
        response.cancel();
        throw new ExternalImageError(415, 'Unsupported content type');
      }

      const body = await readBody(response, deps.maxBytes);
      return { contentType, body };
    }
  } catch (error) {
    if (error instanceof ExternalImageError) throw error;
    if (controller.signal.aborted) {
      throw new ExternalImageError(504, 'Upstream timeout');
    }
    throw new ExternalImageError(502, 'Failed to fetch image');
  } finally {
    clearTimeout(timer);
  }
};
