// @vitest-environment node
import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

const call = (appId?: string) => {
  const target = new URL('http://localhost/api/steam-video');
  if (appId !== undefined) target.searchParams.set('appId', appId);
  return GET(new NextRequest(target));
};

describe('GET /api/steam-video', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('缺少 appId 返回 400', async () => {
    const res = await call();
    expect(res.status).toBe(400);
  });

  it.each(['abc', '123&filters=basic', '12 3', '-1', '1.5'])(
    '非纯数字 appId（%s）返回 400 且不请求 Steam',
    async appId => {
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      const res = await call(appId);

      expect(res.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it('纯数字 appId 正常请求 Steam 并返回视频信息', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        '730': {
          success: true,
          data: {
            movies: [
              {
                name: 'Trailer',
                thumbnail: 'https://cdn/thumb.jpg',
                mp4: { max: 'https://cdn/max.mp4' },
              },
            ],
          },
        },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const res = await call('730');

    expect(res.status).toBe(200);
    const requestUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(requestUrl.origin + requestUrl.pathname).toBe(
      'https://store.steampowered.com/api/appdetails'
    );
    expect(requestUrl.searchParams.get('appids')).toBe('730');
    expect(requestUrl.searchParams.get('filters')).toBe('movies');
    expect(await res.json()).toEqual({
      hlsUrl: 'https://cdn/max.mp4',
      thumbnailUrl: 'https://cdn/thumb.jpg',
      title: 'Trailer',
    });
  });
});
