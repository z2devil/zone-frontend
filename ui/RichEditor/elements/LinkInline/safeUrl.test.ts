import { describe, expect, it } from 'vitest';
import { getSafeLinkHref, isLinkInputAllowed } from './safeUrl';

describe('getSafeLinkHref', () => {
  it.each([
    ['https://example.com/a?b=1', 'https://example.com/a?b=1'],
    ['http://example.com', 'http://example.com'],
    ['  HTTPS://example.com  ', 'HTTPS://example.com'],
    ['mailto:me@example.com', 'mailto:me@example.com'],
    ['/note/123', '/note/123'],
    ['#section', '#section'],
  ])('放行 %s', (input, expected) => {
    expect(getSafeLinkHref(input)).toBe(expected);
  });

  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    ' javascript:alert(1)',
    'java\tscript:alert(1)',
    '\u0001javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
    '//evil.example.com',
    '/\\evil.example.com',
    'example.com',
    '',
    undefined,
  ])('拒绝 %s', input => {
    expect(getSafeLinkHref(input)).toBeUndefined();
  });
});

describe('isLinkInputAllowed', () => {
  it.each([
    '',
    'h',
    'https:',
    'https://exa',
    'example.com',
    '/note',
    'mailto:',
  ])('编辑中间态 %s 可保存', input => {
    expect(isLinkInputAllowed(input)).toBe(true);
  });

  it.each([
    'javascript:',
    'javascript:alert(1)',
    'data:text/html,x',
    ' vbscript:x',
  ])('危险协议 %s 不可保存', input => {
    expect(isLinkInputAllowed(input)).toBe(false);
  });
});
