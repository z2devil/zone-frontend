// @vitest-environment node
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { GET } from './route';

const call = (url?: string) => {
  const target = new URL('http://localhost/api/external-image');
  if (url !== undefined) target.searchParams.set('url', url);
  return GET(new NextRequest(target));
};

describe('GET /api/external-image', () => {
  it('拒绝回环地址', async () => {
    const res = await call('http://127.0.0.1/secret');
    expect(res.status).toBe(400);
  });

  it('拒绝云元数据地址', async () => {
    const res = await call('http://169.254.169.254/latest/meta-data/');
    expect(res.status).toBe(400);
  });

  it('拒绝非 http(s) 协议', async () => {
    const res = await call('file:///etc/passwd');
    expect(res.status).toBe(400);
  });

  it('缺少参数返回 400', async () => {
    const res = await call();
    expect(res.status).toBe(400);
  });

  it('响应带 nosniff 与沙箱 CSP', async () => {
    const res = await call('http://[::1]/');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('Content-Security-Policy')).toBe(
      "default-src 'none'; sandbox"
    );
  });
});
