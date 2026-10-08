import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { upload } from './api';

vi.mock('@/lib/constants', () => ({
  configs: {
    oss: { root: 'zone', bucket: 'bucket', endpoint: 'oss-cn.aliyuncs.com' },
  },
}));

const policy = { policy: 'p', signature: 's', accessKeyId: 'ak' };
const file = new File(['hello'], 'photo.PNG', { type: 'image/png' });

describe('oss upload', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      '00000000-0000-4000-8000-000000000000'
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    fetchMock.mockReset();
  });

  it('posts the file to the OSS host with a key matching the returned file name', async () => {
    const fetcher = vi.fn().mockResolvedValue(policy);
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    const fileName = await upload(fetcher)({ file, fileType: 'image' });

    expect(fileName).toBe('00000000-0000-4000-8000-000000000000.PNG');
    expect(fetcher).toHaveBeenCalledWith('/oss/policy', { method: 'GET' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [host, init] = fetchMock.mock.calls[0];
    expect(host).toBe('https://bucket.oss-cn.aliyuncs.com');
    expect(init.method).toBe('POST');
    const body = init.body as FormData;
    expect(body.get('key')).toBe(`zone/image/${fileName}`);
    expect(body.get('policy')).toBe('p');
    expect(body.get('Signature')).toBe('s');
    expect(body.get('OSSAccessKeyId')).toBe('ak');
    expect(body.get('success_action_status')).toBe('200');
    expect(body.get('file')).toBeInstanceOf(File);
  });

  it('throws without contacting OSS when the policy request fails', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('无权限'));

    await expect(upload(fetcher)({ file, fileType: 'image' })).rejects.toThrow(
      '无权限'
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws when the policy response is incomplete', async () => {
    const fetcher = vi.fn().mockResolvedValue({ policy: 'p' });

    await expect(upload(fetcher)({ file, fileType: 'image' })).rejects.toThrow(
      '获取上传凭证失败'
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws when OSS responds with a non-2xx status', async () => {
    const fetcher = vi.fn().mockResolvedValue(policy);
    fetchMock.mockResolvedValue(new Response('denied', { status: 403 }));

    await expect(upload(fetcher)({ file, fileType: 'image' })).rejects.toThrow(
      'HTTP 403'
    );
  });
});
