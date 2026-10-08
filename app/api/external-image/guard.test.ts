// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  ExternalImageError,
  fetchExternalImage,
  isPublicAddress,
  UpstreamRequest,
  UpstreamResponse,
} from './guard';

const PUBLIC_IP = '93.184.216.34';

const bodyOf = (...chunks: string[]): AsyncIterable<Uint8Array> => ({
  async *[Symbol.asyncIterator]() {
    for (const chunk of chunks) yield new TextEncoder().encode(chunk);
  },
});

const respond = (partial: Partial<UpstreamResponse>): UpstreamResponse => ({
  status: 200,
  body: bodyOf(),
  cancel: () => undefined,
  ...partial,
});

const hosts: Record<string, string[]> = {
  'img.example.com': [PUBLIC_IP],
  'evil.example.com': ['10.0.0.8'],
  'mixed.example.com': [PUBLIC_IP, '127.0.0.1'],
};

const resolveHost = async (hostname: string) => {
  if (hosts[hostname]) return hosts[hostname];
  // IP 字面量原样返回，与 dns.lookup 行为一致
  return [hostname];
};

const expectStatus = async (promise: Promise<unknown>, status: number) => {
  const error = await promise.catch(e => e);
  expect(error).toBeInstanceOf(ExternalImageError);
  expect((error as ExternalImageError).status).toBe(status);
};

describe('isPublicAddress', () => {
  it.each([
    '127.0.0.1',
    '0.0.0.0',
    '10.1.2.3',
    '172.16.0.1',
    '172.31.255.255',
    '192.168.1.1',
    '169.254.169.254',
    '100.64.0.1',
    '224.0.0.1',
    '255.255.255.255',
    '::',
    '::1',
    'fe80::1',
    'fe80::1%en0',
    'fc00::1',
    'fd12:3456::1',
    'ff02::1',
    '::ffff:127.0.0.1',
    '::ffff:a9fe:a9fe',
    '::ffff:10.0.0.1',
    '64:ff9b::7f00:1',
    '2002:7f00:1::1',
    '2001:db8::1',
    'not-an-ip',
  ])('拒绝 %s', ip => {
    expect(isPublicAddress(ip)).toBe(false);
  });

  it.each([
    PUBLIC_IP,
    '8.8.8.8',
    '172.32.0.1',
    '2606:4700:4700::1111',
    '::ffff:8.8.8.8',
  ])('放行 %s', ip => {
    expect(isPublicAddress(ip)).toBe(true);
  });
});

describe('fetchExternalImage', () => {
  it('返回公网图片并固定连接到已校验 IP', async () => {
    const calls: UpstreamRequest[] = [];
    const result = await fetchExternalImage('https://img.example.com/a.png', {
      resolveHost,
      request: async req => {
        calls.push(req);
        return respond({
          contentType: 'image/png; charset=binary',
          body: bodyOf('PNG', 'DATA'),
        });
      },
    });
    expect(result.contentType).toBe('image/png');
    expect(Buffer.from(result.body).toString()).toBe('PNGDATA');
    expect(calls[0].address).toBe(PUBLIC_IP);
  });

  it.each(['javascript:alert(1)', 'file:///etc/passwd', 'ftp://a/b', '::'])(
    '拒绝非法地址 %s',
    async url => {
      await expectStatus(
        fetchExternalImage(url, {
          resolveHost,
          request: async () => respond({}),
        }),
        400
      );
    }
  );

  it.each([
    'http://127.0.0.1/',
    'http://169.254.169.254/latest/meta-data/',
    'http://[::1]/',
    'http://[::ffff:127.0.0.1]/',
    'http://2130706433/',
    'http://evil.example.com/a.png',
    'http://mixed.example.com/a.png',
  ])('拒绝内网目标 %s 且不发起请求', async url => {
    let requested = false;
    await expectStatus(
      fetchExternalImage(url, {
        resolveHost,
        request: async () => {
          requested = true;
          return respond({ contentType: 'image/png' });
        },
      }),
      400
    );
    expect(requested).toBe(false);
  });

  it.each(['text/html', 'image/svg+xml', 'application/octet-stream', ''])(
    '拒绝非图片类型 %s',
    async contentType => {
      await expectStatus(
        fetchExternalImage('https://img.example.com/a', {
          resolveHost,
          request: async () =>
            respond({ contentType, body: bodyOf('<script>') }),
        }),
        415
      );
    }
  );

  it('拒绝重定向到内网地址', async () => {
    const requested: string[] = [];
    await expectStatus(
      fetchExternalImage('https://img.example.com/a.png', {
        resolveHost,
        request: async ({ url }) => {
          requested.push(url.href);
          return respond({
            status: 302,
            location: 'http://169.254.169.254/latest/meta-data/',
          });
        },
      }),
      400
    );
    expect(requested).toEqual(['https://img.example.com/a.png']);
  });

  it('跟随合法的相对重定向', async () => {
    const result = await fetchExternalImage('https://img.example.com/a', {
      resolveHost,
      request: async ({ url }) =>
        url.pathname === '/a'
          ? respond({ status: 301, location: '/b.jpg' })
          : respond({ contentType: 'image/jpeg', body: bodyOf('JPG') }),
    });
    expect(Buffer.from(result.body).toString()).toBe('JPG');
  });

  it('超过重定向上限时拒绝', async () => {
    await expectStatus(
      fetchExternalImage('https://img.example.com/a', {
        resolveHost,
        maxRedirects: 2,
        request: async () => respond({ status: 302, location: '/loop' }),
      }),
      502
    );
  });

  it('超过大小上限时拒绝并释放连接', async () => {
    let cancelled = false;
    await expectStatus(
      fetchExternalImage('https://img.example.com/a.png', {
        resolveHost,
        maxBytes: 4,
        request: async () =>
          respond({
            contentType: 'image/png',
            body: bodyOf('abc', 'def'),
            cancel: () => {
              cancelled = true;
            },
          }),
      }),
      413
    );
    expect(cancelled).toBe(true);
  });

  it('超时返回 504', async () => {
    await expectStatus(
      fetchExternalImage('https://img.example.com/a.png', {
        resolveHost,
        timeoutMs: 10,
        request: ({ signal }) =>
          new Promise((_, reject) => {
            signal.addEventListener('abort', () =>
              reject(new Error('aborted'))
            );
          }),
      }),
      504
    );
  });

  it('上游非 2xx 返回 502', async () => {
    await expectStatus(
      fetchExternalImage('https://img.example.com/a.png', {
        resolveHost,
        request: async () => respond({ status: 404 }),
      }),
      502
    );
  });
});
