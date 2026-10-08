const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

// 与浏览器 URL 解析一致：去掉首尾空白与控制字符，删除中间的制表符和换行
// eslint-disable-next-line no-control-regex
const EDGE_CONTROL = /^[\u0000-\u0020]+|[\u0000-\u0020]+$/g;
const normalize = (raw: string) =>
  raw.replace(EDGE_CONTROL, '').replace(/[\t\n\r]/g, '');

const SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i;

/**
 * 返回可安全用作 href 的链接，不安全时返回 undefined。
 * 只允许 http/https/mailto 和站内路径（/path、#hash）。
 */
export const getSafeLinkHref = (raw: string | undefined) => {
  if (!raw) return undefined;
  const url = normalize(raw);

  if (url.startsWith('#')) return url;
  // 排除 //host 与 /\host，浏览器会把它们当作跨站地址
  if (url.startsWith('/') && url[1] !== '/' && url[1] !== '\\') return url;

  if (!SCHEME_PATTERN.test(url)) return undefined;
  try {
    return ALLOWED_PROTOCOLS.has(new URL(url).protocol) ? url : undefined;
  } catch {
    return undefined;
  }
};

/**
 * 编辑时是否允许保存：输入过程中的半截地址可以保存（渲染时会被判定为不可点击），
 * 但已经写出危险协议（javascript:、data: 等）的值不保存。
 */
export const isLinkInputAllowed = (raw: string) => {
  const match = normalize(raw).match(SCHEME_PATTERN);
  if (!match) return true;
  return ALLOWED_PROTOCOLS.has(match[0].toLowerCase());
};
