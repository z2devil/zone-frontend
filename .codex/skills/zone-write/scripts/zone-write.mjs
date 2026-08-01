#!/usr/bin/env node

import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import { parseArgs } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse as parseDotenv } from 'dotenv';
import { unified } from 'unified';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';

const DEFAULT_API_BASE = 'https://z2devil.cn/api';
const DEFAULT_SITE_BASE = 'https://z2devil.cn';
const KEYCHAIN_SERVICE = 'zone-write';
const VALID_KINDS = new Set(['note', 'article']);
const VALID_VISIBILITIES = new Set(['public', 'private']);
const SCRIPT_PATH = fileURLToPath(import.meta.url);
const KEYCHAIN_HELPER_PATH = path.join(
  path.dirname(SCRIPT_PATH),
  'zone-keychain.swift'
);
const REPOSITORY_ROOT = path.resolve(path.dirname(SCRIPT_PATH), '../../../..');
const LOCAL_ASSET_PATTERN = /^(?![a-z][a-z\d+.-]*:|\/\/|#)/i;
const IMAGE_MIME_TYPES = new Map([
  ['.avif', 'image/avif'],
  ['.gif', 'image/gif'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
]);

export function normalizeMarkdownSource(markdown) {
  let source = String(markdown || '').trim();
  if (!source.startsWith('---\n') && !source.startsWith('---\r\n')) {
    return source;
  }
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (match && /^[A-Za-z][\w-]*\s*:/m.test(match[1])) {
    source = source.slice(match[0].length).trim();
  }
  return source;
}

function marked(children, mark) {
  return children.map(child => {
    if (child && typeof child === 'object' && Array.isArray(child.children)) {
      return { ...child, children: marked(child.children, mark) };
    }
    return { ...child, [mark]: true };
  });
}

function inlineChildren(node) {
  return (node.children || []).flatMap(child => {
    switch (child.type) {
      case 'text':
        return [{ text: child.value || '' }];
      case 'strong':
        return marked(inlineChildren(child), 'bold');
      case 'emphasis':
        return marked(inlineChildren(child), 'italic');
      case 'delete':
        return marked(inlineChildren(child), 'strikethrough');
      case 'inlineCode':
        return [{ type: 'code-span', children: [{ text: child.value || '' }] }];
      case 'link':
        return [
          {
            type: 'link',
            url: child.url || '',
            children: inlineChildren(child),
          },
        ];
      case 'break':
        return [{ text: '\n' }];
      case 'image':
        return [{ text: child.alt ? `[图片：${child.alt}]` : '[图片]' }];
      default:
        if (Array.isArray(child.children)) return inlineChildren(child);
        return [{ text: child.value || '' }];
    }
  });
}

function paragraphBlocks(node) {
  const blocks = [];
  let inlineBuffer = [];

  const flush = () => {
    if (inlineBuffer.length > 0) {
      blocks.push({ type: 'paragraph', children: inlineBuffer });
      inlineBuffer = [];
    }
  };

  for (const child of node.children || []) {
    if (child.type === 'image') {
      flush();
      blocks.push({
        type: 'image',
        url: child.url || '',
        alt: child.alt || '',
        children: [{ text: '' }],
      });
    } else {
      inlineBuffer.push(...inlineChildren({ children: [child] }));
    }
  }
  flush();
  return blocks.length > 0
    ? blocks
    : [{ type: 'paragraph', children: [{ text: '' }] }];
}

function listItem(node) {
  const children = (node.children || []).flatMap(child => {
    if (child.type === 'paragraph') return inlineChildren(child);
    return blockToSlate(child);
  });
  return {
    type: 'list-item',
    children: children.length > 0 ? children : [{ text: '' }],
  };
}

function blockToSlate(node) {
  switch (node.type) {
    case 'paragraph':
      return paragraphBlocks(node);
    case 'heading':
      return [
        {
          type: `heading-${Math.min(Math.max(node.depth || 1, 1), 6)}`,
          children: inlineChildren(node),
        },
      ];
    case 'list':
      return [
        {
          type: node.ordered ? 'ol-list' : 'ul-list',
          children: (node.children || []).map(listItem),
        },
      ];
    case 'blockquote':
      return [
        {
          type: 'block-quote',
          children: (node.children || []).flatMap(blockToSlate),
        },
      ];
    case 'code': {
      const lines = String(node.value || '').split(/\r?\n/);
      return [
        {
          type: 'code-block',
          language: node.lang || 'plaintext',
          children: lines.map(line => ({
            type: 'code-line-block',
            children: [{ text: line }],
          })),
        },
      ];
    }
    case 'image':
      return [
        {
          type: 'image',
          url: node.url || '',
          alt: node.alt || '',
          children: [{ text: '' }],
        },
      ];
    case 'thematicBreak':
      return [{ type: 'paragraph', children: [{ text: '---' }] }];
    case 'html':
      return [{ type: 'paragraph', children: [{ text: node.value || '' }] }];
    case 'table': {
      const rows = node.children || [];
      if (rows.length === 0) return [];
      const headers = (rows[0].children || []).map(cell =>
        inlineChildren(cell)
          .map(child => child.text || '')
          .join('')
          .trim()
      );
      return rows.slice(1).map(row => ({
        type: 'paragraph',
        children: (row.children || []).flatMap((cell, columnIndex) => {
          const prefix = headers[columnIndex]
            ? `${headers[columnIndex]}：`
            : `第 ${columnIndex + 1} 列：`;
          const suffix = columnIndex < row.children.length - 1 ? '；' : '';
          return [
            { text: prefix, bold: true },
            ...inlineChildren(cell),
            { text: suffix },
          ];
        }),
      }));
    }
    default:
      if (Array.isArray(node.children))
        return node.children.flatMap(blockToSlate);
      return [];
  }
}

function nodeText(node) {
  if (!node || typeof node !== 'object') return '';
  if (typeof node.text === 'string') return node.text;
  return (node.children || []).map(nodeText).join('');
}

function normalizeComparableTitle(value) {
  return String(value || '')
    .replace(/[`*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function markdownToSlate(markdown, { title } = {}) {
  const source = normalizeMarkdownSource(markdown);
  if (!source) throw new Error('正文不能为空');
  const tree = unified().use(remarkParse).use(remarkGfm).parse(source);
  const blocks = tree.children.flatMap(blockToSlate);
  if (
    title &&
    blocks[0]?.type === 'heading-1' &&
    normalizeComparableTitle(nodeText(blocks[0])) ===
      normalizeComparableTitle(title)
  ) {
    blocks.shift();
  }
  return blocks.length > 0
    ? blocks
    : [{ type: 'paragraph', children: [{ text: source }] }];
}

function normalizeTags(tags = []) {
  const normalized = [...new Set(tags.map(tag => tag.trim()).filter(Boolean))];
  if (normalized.length > 5) throw new Error('标签最多 5 个');
  return normalized;
}

export function prepareContent({
  markdown,
  title,
  kind = 'note',
  visibility = 'private',
  tags = [],
  bannerPath,
  includeVisibility = true,
  includeTags = true,
}) {
  const normalizedTitle = String(title || '').trim();
  if (!normalizedTitle) throw new Error('标题不能为空');
  if (normalizedTitle.length > 150) throw new Error('标题最多 150 个字符');
  if (!VALID_KINDS.has(kind)) throw new Error('kind 必须是 note 或 article');
  if (includeVisibility && !VALID_VISIBILITIES.has(visibility)) {
    throw new Error('visibility 必须是 public 或 private');
  }

  const normalizedMarkdown = normalizeMarkdownSource(markdown);
  const slate = markdownToSlate(normalizedMarkdown, { title: normalizedTitle });
  const tagLabels = normalizeTags(tags);
  const payload = {
    title: normalizedTitle,
    content: JSON.stringify(slate),
  };
  if (includeVisibility) payload.visibility = visibility;
  if (includeTags) payload.tags = tagLabels;
  if (bannerPath !== undefined) payload.bannerPath = bannerPath;

  const warnings = [];
  const characters = normalizedMarkdown.length;
  const localAssets = collectLocalAssetUrls(slate).length;
  if (kind === 'article' && characters < 300) {
    warnings.push('文章正文少于 300 字，确认它是否更适合作为随手笔记');
  }
  if (
    visibility === 'public' &&
    /(?:token|password|secret|验证码)/i.test(markdown)
  ) {
    warnings.push('公开正文可能包含敏感信息关键词，请人工复核');
  }
  if (localAssets > 0) {
    warnings.push(`发布时将自动上传 ${localAssets} 个本地图片资源`);
  }

  return {
    schema_version: 1,
    kind,
    title: normalizedTitle,
    visibility: includeVisibility ? visibility : 'preserve',
    tag_labels: includeTags ? tagLabels : 'preserve',
    payload,
    preview: { blocks: slate.length, characters, localAssets },
    warnings,
  };
}

async function readMarkdown(input = '-') {
  if (input !== '-') return fs.readFile(input, 'utf8');
  if (process.stdin.isTTY)
    throw new Error('请通过 --input 指定 Markdown 文件，或从 stdin 传入正文');
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

export function validateApiBase(value) {
  const url = new URL(value);
  const isLocal = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(isLocal && url.protocol === 'http:')) {
    throw new Error('ZONE_API_BASE_URL 必须使用 HTTPS，本机调试除外');
  }
  if (url.username || url.password) throw new Error('API 地址不得包含凭据');
  return url.toString().replace(/\/+$/, '');
}

function apiBase() {
  return validateApiBase(process.env.ZONE_API_BASE_URL || DEFAULT_API_BASE);
}

export function isLocalAssetUrl(value) {
  const url = String(value || '').trim();
  return (
    Boolean(url) &&
    LOCAL_ASSET_PATTERN.test(url) &&
    !/^zone\/(?:image|audio|video)\//i.test(url)
  );
}

function collectLocalAssetUrls(nodes) {
  const urls = [];
  for (const node of nodes || []) {
    if (node?.type === 'image' && isLocalAssetUrl(node.url)) {
      urls.push(node.url);
    }
    if (Array.isArray(node?.children)) {
      urls.push(...collectLocalAssetUrls(node.children));
    }
  }
  return urls;
}

async function readZoneOssConfig({ env = process.env } = {}) {
  let fileConfig = {};
  try {
    fileConfig = parseDotenv(
      await fs.readFile(path.join(REPOSITORY_ROOT, '.env.production'))
    );
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  const bucket = env.ZONE_OSS_BUCKET || fileConfig.OSS_BUCKET;
  const endpoint = env.ZONE_OSS_ENDPOINT || fileConfig.OSS_ENDPOINT;
  const root = env.ZONE_OSS_ROOT || fileConfig.OSS_ROOT;
  if (!bucket || !endpoint || !root) {
    throw new Error(
      '本地图片上传缺少 OSS 配置：请设置 ZONE_OSS_BUCKET、ZONE_OSS_ENDPOINT、ZONE_OSS_ROOT'
    );
  }
  if (!/^[a-z\d][a-z\d.-]*$/i.test(bucket)) {
    throw new Error('ZONE_OSS_BUCKET 格式不正确');
  }
  if (!/^[a-z\d][a-z\d.-]*$/i.test(endpoint)) {
    throw new Error('ZONE_OSS_ENDPOINT 格式不正确');
  }
  const normalizedRoot = String(root).replace(/^\/+|\/+$/g, '');
  if (!normalizedRoot || normalizedRoot.includes('..')) {
    throw new Error('ZONE_OSS_ROOT 格式不正确');
  }
  return {
    uploadUrl: `https://${bucket}.${endpoint}`,
    root: normalizedRoot,
  };
}

function resolveLocalAssetPath(assetUrl, input) {
  if (input === '-' || !input) {
    throw new Error(
      '从 stdin 发布本地图片时，必须改用 --input 指定 Markdown 文件'
    );
  }
  const cleanUrl = decodeURIComponent(String(assetUrl).split(/[?#]/, 1)[0]);
  return path.isAbsolute(cleanUrl)
    ? cleanUrl
    : path.resolve(path.dirname(path.resolve(input)), cleanUrl);
}

export async function uploadZoneImage({
  filePath,
  token,
  request = apiRequest,
  fetcher = fetch,
  ossConfig,
}) {
  const extension = path.extname(filePath).toLowerCase();
  const mimeType = IMAGE_MIME_TYPES.get(extension);
  if (!mimeType) {
    throw new Error(`不支持的图片格式：${extension || '无扩展名'}`);
  }
  const content = await fs.readFile(filePath);
  if (content.length > 25 * 1024 * 1024) {
    throw new Error(`图片超过 25MB：${path.basename(filePath)}`);
  }

  const config = ossConfig || (await readZoneOssConfig());
  const credentials = await request('/oss/policy', { token });
  const { policy, signature, accessKeyId } = credentials || {};
  if (!policy || !signature || !accessKeyId) {
    throw new Error('Zone OSS 上传凭证响应不完整');
  }

  const digest = createHash('sha256')
    .update(content)
    .digest('hex')
    .slice(0, 20);
  const fileName = `${digest}${extension}`;
  const storagePath = `${config.root}/image/${fileName}`;
  const form = new FormData();
  form.append('policy', policy);
  form.append('Signature', signature);
  form.append('OSSAccessKeyId', accessKeyId);
  form.append('key', storagePath);
  form.append('success_action_status', '200');
  form.append('file', new Blob([content], { type: mimeType }), fileName);

  const response = await fetcher(config.uploadUrl, {
    method: 'POST',
    body: form,
    redirect: 'error',
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) {
    throw new Error(`Zone OSS 上传失败（HTTP ${response.status}）`);
  }
  return storagePath;
}

export async function materializeLocalAssets({
  prepared,
  input,
  bannerFile,
  token,
  upload = uploadZoneImage,
}) {
  const cache = new Map();
  const uploadLocal = async assetUrl => {
    const filePath = resolveLocalAssetPath(assetUrl, input);
    if (!cache.has(filePath)) {
      cache.set(filePath, await upload({ filePath, token }));
    }
    return cache.get(filePath);
  };
  const visit = async node => {
    const next = { ...node };
    if (next.type === 'image' && isLocalAssetUrl(next.url)) {
      next.url = await uploadLocal(next.url);
    }
    if (Array.isArray(next.children)) {
      next.children = await Promise.all(next.children.map(visit));
    }
    return next;
  };

  const slate = JSON.parse(prepared.payload.content);
  const materialized = await Promise.all(slate.map(visit));
  prepared.payload.content = JSON.stringify(materialized);
  if (bannerFile) {
    prepared.payload.bannerPath = await uploadLocal(bannerFile);
  }
  return { prepared, uploaded: cache.size };
}

function runProcess(command, args, { input } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const stdout = [];
    const stderr = [];
    child.stdout.on('data', chunk => stdout.push(chunk));
    child.stderr.on('data', chunk => stderr.push(chunk));
    child.on('error', reject);
    child.on('close', status => {
      resolve({
        status,
        stdout: Buffer.concat(stdout).toString('utf8'),
        stderr: Buffer.concat(stderr).toString('utf8'),
      });
    });
    child.stdin.end(input);
  });
}

function keychainUnavailable(platform) {
  return new Error(
    `当前系统（${platform}）不支持 macOS Keychain，请改用 ZONE_AUTH_TOKEN`
  );
}

export function createKeychainCredentialStore({
  platform = process.platform,
  run: execute = runProcess,
  service = KEYCHAIN_SERVICE,
  helperPath = KEYCHAIN_HELPER_PATH,
} = {}) {
  const ensureSupported = () => {
    if (platform !== 'darwin') throw keychainUnavailable(platform);
  };
  const argsFor = (action, baseUrl) => [
    'swift',
    helperPath,
    action,
    service,
    validateApiBase(baseUrl),
  ];

  return {
    assertAvailable: ensureSupported,
    async get(baseUrl) {
      ensureSupported();
      const result = await execute('xcrun', argsFor('get', baseUrl));
      if (result.status === 44) return undefined;
      if (result.status !== 0) {
        throw new Error('无法读取 Zone 登录凭证，请检查 macOS Keychain');
      }
      return result.stdout.trim() || undefined;
    },
    async set(baseUrl, token) {
      ensureSupported();
      const secret = String(token || '').trim();
      if (!secret) throw new Error('登录响应缺少 Token');
      const result = await execute('xcrun', argsFor('set', baseUrl), {
        input: secret,
      });
      if (result.status !== 0) {
        throw new Error('无法保存 Zone 登录凭证到 macOS Keychain');
      }
    },
    async delete(baseUrl) {
      ensureSupported();
      const result = await execute('xcrun', argsFor('delete', baseUrl));
      if (result.status === 44) return false;
      if (result.status !== 0) {
        throw new Error('无法从 macOS Keychain 删除 Zone 登录凭证');
      }
      return true;
    },
  };
}

const keychainCredentialStore = createKeychainCredentialStore();

export function normalizeLoginEmail(value) {
  const email = String(value || '')
    .trim()
    .toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('邮箱格式不正确');
  }
  return email;
}

export function validateVerificationCode(value) {
  const code = String(value || '').trim();
  if (!/^\d{4}$/.test(code)) throw new Error('请输入 4 位数字验证码');
  return code;
}

export async function resolveAuthToken({
  required = false,
  env = process.env,
  baseUrl = apiBase(),
  credentialStore = keychainCredentialStore,
} = {}) {
  const environmentToken = env.ZONE_AUTH_TOKEN?.trim();
  if (environmentToken) return environmentToken;

  let storedToken;
  try {
    storedToken = (await credentialStore.get(baseUrl))?.trim();
  } catch (error) {
    if (required) throw error;
  }
  if (storedToken) return storedToken;
  if (required) {
    throw new Error(
      '尚未登录。请先运行 node .codex/skills/zone-write/scripts/zone-write.mjs login --email <邮箱>'
    );
  }
  return undefined;
}

async function promptVerificationCode() {
  if (!process.stdin.isTTY || !process.stderr.isTTY) {
    throw new Error('登录需要交互式终端，以安全输入邮箱验证码');
  }

  let muted = false;
  const silentOutput = new Writable({
    write(chunk, encoding, callback) {
      if (!muted) process.stderr.write(chunk, encoding);
      callback();
    },
  });
  const readline = createInterface({
    input: process.stdin,
    output: silentOutput,
    terminal: true,
  });
  try {
    const answer = readline.question('请输入邮件中的 4 位验证码：');
    muted = true;
    return await answer;
  } finally {
    muted = false;
    process.stderr.write('\n');
    readline.close();
  }
}

function safeAuthUser(info) {
  const level = Number(info?.lv ?? info?.level);
  return {
    _id: info?._id ?? info?.id,
    nickname: info?.nickname ?? info?.name,
    lv: Number.isFinite(level) ? level : undefined,
  };
}

export function authUserFromResponse(data, { requireId = true } = {}) {
  const info =
    [data?.info, data?.user, data?.profile, data].find(
      value => value && typeof value === 'object'
    ) || {};
  const user = safeAuthUser(info);
  if (requireId && !user._id) {
    throw new Error('登录凭证验证响应缺少用户 ID');
  }
  return user;
}

function mergeAuthUsers(...users) {
  return users.reduce(
    (result, user) => ({
      _id: user?._id ?? result._id,
      nickname: user?.nickname ?? result.nickname,
      lv: user?.lv ?? result.lv,
    }),
    {}
  );
}

function maskEmail(email) {
  const [local, domain] = email.split('@');
  return `${local.slice(0, 1)}***@${domain}`;
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", `'"'"'`)}'`;
}

function appleScriptString(value) {
  return `"${String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}

export function buildVisibleLoginAppleScript({
  email,
  scriptPath = SCRIPT_PATH,
  nodePath = process.execPath,
  workdir = REPOSITORY_ROOT,
  baseUrl = process.env.ZONE_API_BASE_URL,
}) {
  const normalizedEmail = normalizeLoginEmail(email);
  const environment = baseUrl
    ? `env ZONE_API_BASE_URL=${shellQuote(validateApiBase(baseUrl))} `
    : '';
  const command = [
    `cd ${shellQuote(workdir)}`,
    `${environment}${shellQuote(nodePath)} ${shellQuote(scriptPath)} login --email ${shellQuote(normalizedEmail)}`,
  ].join(' && ');
  return [
    'tell application "Terminal"',
    'activate',
    `set loginTab to do script ${appleScriptString(command)}`,
    'delay 1',
    'repeat while busy of loginTab',
    'delay 0.5',
    'end repeat',
    'end tell',
  ].join('\n');
}

export async function loginInVisibleTerminal({
  email,
  execute = runProcess,
  credentialStore = keychainCredentialStore,
  request = apiRequest,
  platform = process.platform,
}) {
  if (platform !== 'darwin') {
    throw new Error('当前环境没有可见交互终端，请在本机终端运行 login 命令');
  }
  const script = buildVisibleLoginAppleScript({ email });
  const result = await execute('osascript', ['-e', script]);
  if (result.status !== 0) {
    throw new Error('无法打开可见的 macOS Terminal 登录窗口');
  }
  const token = (await credentialStore.get(apiBase()))?.trim();
  if (!token) throw new Error('登录窗口已关闭，但没有发现新的 Zone 登录凭证');
  const verified = await request('/auth/info', { token });
  const user = authUserFromResponse(verified, { requireId: false });
  return {
    authenticated: true,
    credentialSource: 'keychain',
    user,
    canPublish: Number(user.lv) >= 2,
  };
}

export async function loginWithEmail({
  email,
  baseUrl = apiBase(),
  request = apiRequest,
  readCode = promptVerificationCode,
  credentialStore = keychainCredentialStore,
  notify = message => process.stderr.write(`${message}\n`),
}) {
  credentialStore.assertAvailable?.();
  const normalizedEmail = normalizeLoginEmail(email);
  const query = new URLSearchParams({ email: normalizedEmail });
  await request(`/auth/code?${query}`);
  notify(`验证码已发送至 ${maskEmail(normalizedEmail)}`);

  const code = validateVerificationCode(await readCode());
  const signed = await request('/auth/sign', {
    method: 'POST',
    body: { email: normalizedEmail, code },
  });
  const token = signed?.token?.trim();
  if (!token) throw new Error('登录响应缺少 Token');

  const verified = await request('/auth/info', { token });
  const user = mergeAuthUsers(
    authUserFromResponse(signed, { requireId: false }),
    authUserFromResponse(verified, { requireId: false })
  );
  await credentialStore.set(baseUrl, token);

  return {
    authenticated: true,
    credentialSource: 'keychain',
    user,
    canPublish: Number(user.lv) >= 2,
  };
}

function errorMessage(message) {
  if (Array.isArray(message)) return message[0]?.message || 'Zone API 请求失败';
  if (typeof message === 'string') return message;
  return 'Zone API 请求失败';
}

async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json; charset=utf-8' };
  if (token) headers.Authorization = token;
  const response = await fetch(`${apiBase()}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'error',
    signal: AbortSignal.timeout(30_000),
  });
  const envelope = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`Zone API HTTP ${response.status}`);
  if (!envelope || envelope.code !== 200) {
    throw new Error(errorMessage(envelope?.message));
  }
  return envelope.data;
}

async function resolveTagIds(labels) {
  if (labels.length === 0) return [];
  const data = await apiRequest('/tag?current=1&size=50');
  const tags = Array.isArray(data?.list) ? data.list : [];
  const byLabel = new Map(tags.map(tag => [tag.label, tag._id]));
  const missing = labels.filter(label => !byLabel.has(label));
  if (missing.length > 0) {
    throw new Error(
      `以下标签不存在：${missing.join('、')}。请先在 Zone 中创建标签`
    );
  }
  return labels.map(label => byLabel.get(label));
}

function safeNote(note, includeContent = false) {
  const result = {
    _id: note?._id,
    title: note?.title,
    visibility: note?.visibility || 'public',
    createdAt: note?.createdAt,
    updatedAt: note?.updatedAt,
    tags: (note?.tags || []).map(tag =>
      typeof tag === 'string' ? tag : tag.label
    ),
    url: note?._id ? `${DEFAULT_SITE_BASE}/note/${note._id}` : undefined,
  };
  if (includeContent) {
    try {
      result.content = JSON.parse(note.content);
    } catch {
      result.content = note?.content;
    }
  }
  return result;
}

export function verifySavedNote(note, expected) {
  if (!note?._id) throw new Error('发布回查缺少笔记 ID');
  if (expected.title !== undefined && note.title !== expected.title) {
    throw new Error('发布回查失败：线上标题与本次提交不一致');
  }
  if (
    expected.visibility !== undefined &&
    note.visibility !== expected.visibility
  ) {
    throw new Error('发布回查失败：线上可见性与本次提交不一致');
  }
  return note;
}

export async function redactUnverifiedPrivateNote({
  noteId,
  token,
  request = apiRequest,
}) {
  const placeholder = [
    {
      type: 'paragraph',
      children: [{ text: '该文章暂未公开。' }],
    },
  ];
  await request('/note', {
    method: 'PUT',
    token,
    body: {
      _id: noteId,
      title: '私密草稿（暂未公开）',
      content: JSON.stringify(placeholder),
      bannerPath: '',
      tags: [],
    },
  });
}

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function requireConfirm(values, action) {
  if (!values.confirm)
    throw new Error(`${action}属于写操作，必须显式添加 --confirm`);
}

function contentOptions(values, markdown, { update = false } = {}) {
  return prepareContent({
    markdown,
    title: values.title,
    kind: values.kind || 'note',
    visibility: values.visibility || 'private',
    tags: values.tag || [],
    bannerPath: values.banner,
    includeVisibility: !update || values.visibility !== undefined,
    includeTags: !update || values.tag !== undefined,
  });
}

async function run(values, command) {
  if (command === 'prepare') {
    const markdown = await readMarkdown(values.input);
    const prepared = contentOptions(values, markdown);
    if (values.output) {
      await fs.writeFile(
        values.output,
        `${JSON.stringify(prepared, null, 2)}\n`,
        {
          flag: values.force ? 'w' : 'wx',
        }
      );
      print({
        saved: values.output,
        ...prepared.preview,
        warnings: prepared.warnings,
      });
    } else {
      print(prepared);
    }
    return;
  }

  if (command === 'publish') {
    requireConfirm(values, '发布');
    if (values.banner && values['banner-file']) {
      throw new Error('--banner 与 --banner-file 不能同时使用');
    }
    const token = await resolveAuthToken({ required: true });
    const markdown = await readMarkdown(values.input);
    const prepared = contentOptions(values, markdown);
    const assets = await materializeLocalAssets({
      prepared,
      input: values.input,
      bannerFile: values['banner-file'],
      token,
    });
    prepared.payload.tags = await resolveTagIds(prepared.tag_labels);
    const created = await apiRequest('/note', {
      method: 'POST',
      body: prepared.payload,
      token,
    });
    let note;
    try {
      note = verifySavedNote(
        await apiRequest(`/note/${encodeURIComponent(created._id)}`, { token }),
        {
          title: prepared.payload.title,
          visibility: prepared.payload.visibility,
        }
      );
    } catch (error) {
      if (prepared.payload.visibility !== 'private') throw error;
      try {
        await redactUnverifiedPrivateNote({
          noteId: created._id,
          token,
        });
      } catch {
        throw new Error(
          `私密发布回查失败，且自动撤回正文失败；请立即处理笔记 ${created._id}`
        );
      }
      throw new Error(
        `线上未落实 private，可见正文已自动撤回；占位笔记 ID：${created._id}`
      );
    }
    print({
      published: true,
      verified: true,
      uploadedAssets: assets.uploaded,
      warnings: prepared.warnings,
      note: safeNote(note),
    });
    return;
  }

  if (command === 'update') {
    requireConfirm(values, '更新');
    if (!values.id) throw new Error('更新必须提供 --id');
    if (values.banner && values['banner-file']) {
      throw new Error('--banner 与 --banner-file 不能同时使用');
    }
    const token = await resolveAuthToken({ required: true });
    const markdown = await readMarkdown(values.input);
    const prepared = contentOptions(values, markdown, { update: true });
    const assets = await materializeLocalAssets({
      prepared,
      input: values.input,
      bannerFile: values['banner-file'],
      token,
    });
    if (prepared.tag_labels !== 'preserve') {
      prepared.payload.tags = await resolveTagIds(prepared.tag_labels);
    }
    await apiRequest('/note', {
      method: 'PUT',
      body: { _id: values.id, ...prepared.payload },
      token,
    });
    const note = verifySavedNote(
      await apiRequest(`/note/${encodeURIComponent(values.id)}`, { token }),
      {
        title: prepared.payload.title,
        visibility: prepared.payload.visibility,
      }
    );
    print({
      updated: true,
      verified: true,
      uploadedAssets: assets.uploaded,
      warnings: prepared.warnings,
      note: safeNote(note),
    });
    return;
  }

  if (command === 'check-auth') {
    const token = await resolveAuthToken({ required: true });
    const data = await apiRequest('/auth/info', { token });
    const user = authUserFromResponse(data, { requireId: false });
    print({
      authenticated: true,
      credentialSource: process.env.ZONE_AUTH_TOKEN?.trim()
        ? 'environment'
        : 'keychain',
      user,
      canPublish: Number(user.lv) >= 2,
    });
    return;
  }

  if (command === 'login') {
    if (process.env.ZONE_AUTH_TOKEN?.trim()) {
      throw new Error(
        '当前存在 ZONE_AUTH_TOKEN 覆盖；请先取消该环境变量，再登录到 Keychain'
      );
    }
    if (!process.stdin.isTTY || !process.stderr.isTTY) {
      print(await loginInVisibleTerminal({ email: values.email }));
    } else {
      print(await loginWithEmail({ email: values.email }));
    }
    return;
  }

  if (command === 'doctor') {
    const issues = [];
    let auth = { authenticated: false, canPublish: false };
    let token;
    try {
      token = await resolveAuthToken();
      if (token) {
        const data = await apiRequest('/auth/info', { token });
        const user = authUserFromResponse(data, { requireId: false });
        auth = {
          authenticated: true,
          canPublish: Number(user.lv) >= 2,
          user,
        };
        if (!auth.canPublish) issues.push('当前账号没有发布权限');
      } else {
        issues.push('尚未登录；运行 login 后会自动打开可见 Terminal');
      }
    } catch (error) {
      issues.push(`认证检查失败：${error.message}`);
    }
    let assets = { configured: false };
    try {
      await readZoneOssConfig();
      assets = { configured: true };
    } catch (error) {
      issues.push(`图片上传检查失败：${error.message}`);
    }
    print({
      ready: auth.authenticated && auth.canPublish && assets.configured,
      api: { reachable: Boolean(token), baseUrl: apiBase() },
      auth,
      assets,
      issues,
    });
    return;
  }

  if (command === 'logout') {
    requireConfirm(values, '退出登录');
    const removed = await keychainCredentialStore.delete(apiBase());
    const environmentOverride = Boolean(process.env.ZONE_AUTH_TOKEN?.trim());
    print({
      authenticated: environmentOverride,
      keychainCredentialRemoved: removed,
      environmentOverride,
    });
    return;
  }

  if (command === 'tags') {
    const data = await apiRequest('/tag?current=1&size=50');
    print({ total: data?.total || 0, tags: data?.list || [] });
    return;
  }

  if (command === 'list') {
    const current = Number.parseInt(values.current || '1', 10);
    const size = Number.parseInt(values.size || '20', 10);
    if (current < 1 || size < 1 || size > 50)
      throw new Error('current >= 1，size 必须为 1-50');
    const query = new URLSearchParams({
      current: String(current),
      size: String(size),
    });
    if (values.search) query.set('search', values.search);
    const data = await apiRequest(`/note?${query}`, {
      token: await resolveAuthToken(),
    });
    print({
      total: data?.total || 0,
      notes: (data?.list || []).map(note => safeNote(note)),
    });
    return;
  }

  if (command === 'inspect') {
    if (!values.id) throw new Error('查询必须提供 --id');
    const note = await apiRequest(`/note/${encodeURIComponent(values.id)}`, {
      token: await resolveAuthToken(),
    });
    print({ note: safeNote(note, values['include-content']) });
    return;
  }

  throw new Error(
    '未知命令。使用 doctor、prepare、login、logout、check-auth、publish、update、list、inspect 或 tags'
  );
}

function cliArgs() {
  return parseArgs({
    options: {
      input: { type: 'string', short: 'i', default: '-' },
      output: { type: 'string', short: 'o' },
      title: { type: 'string' },
      kind: { type: 'string' },
      visibility: { type: 'string' },
      tag: { type: 'string', multiple: true },
      banner: { type: 'string' },
      'banner-file': { type: 'string' },
      id: { type: 'string' },
      current: { type: 'string' },
      size: { type: 'string' },
      search: { type: 'string' },
      email: { type: 'string' },
      confirm: { type: 'boolean', default: false },
      force: { type: 'boolean', default: false },
      'include-content': { type: 'boolean', default: false },
    },
    allowPositionals: true,
    strict: true,
  });
}

export async function main() {
  try {
    const { values, positionals } = cliArgs();
    await run(values, positionals[0]);
  } catch (error) {
    process.stderr.write(`${JSON.stringify({ error: error.message })}\n`);
    process.exitCode = 1;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
