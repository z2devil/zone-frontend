import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NoteInfo } from '../api/notes';
import type { UserInfo } from '../api/user';
import { useAuthStore } from '../stores';
import { useNotesStore } from '../stores/notes';
import useRequest from './useRequest';

const mocks = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
  usePathname: () => '/note/note-1',
}));

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const mockFetch = (response: Response) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
};

describe('useRequest auth error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    useAuthStore.setState({
      token: 'token-1',
      userInfo: { _id: 'user-1' } as UserInfo,
    });
    useNotesStore.setState({ notes: [{ _id: 'note-1' } as NoteInfo] });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('logs out and redirects to login on business code 401', async () => {
    mockFetch(jsonResponse({ code: 401, message: 'unauthorized' }));
    const { result } = renderHook(() => useRequest());

    await expect(result.current[0].get('/note/note-1')).rejects.toThrow(
      '您的登录状态已过期，请重新登录'
    );
    expect(useAuthStore.getState().token).toBeNull();
    expect(useNotesStore.getState().notes).toEqual([]);
    expect(mocks.push).toHaveBeenCalledWith('/login');
  });

  it('clears local note drafts on 401 so private content does not remain', async () => {
    localStorage.setItem('note-draft:note-1', '[]');
    localStorage.setItem('other-key', 'keep');
    mockFetch(jsonResponse({}, 401));
    const { result } = renderHook(() => useRequest());

    await expect(result.current[0].get('/note/note-1')).rejects.toThrow();
    expect(localStorage.getItem('note-draft:note-1')).toBeNull();
    expect(localStorage.getItem('other-key')).toBe('keep');
  });

  it('does not redirect to login on 401 when skipAuthRedirect is set', async () => {
    mockFetch(jsonResponse({}, 401));
    const { result } = renderHook(() => useRequest());

    await expect(
      result.current[0].post('/auth/logout', { skipAuthRedirect: true })
    ).rejects.toThrow();
    expect(mocks.push).not.toHaveBeenCalled();
    expect(vi.mocked(fetch).mock.calls[0][1]).not.toHaveProperty(
      'skipAuthRedirect'
    );
  });

  it('keeps the session on business code 403 and throws a permission error', async () => {
    mockFetch(jsonResponse({ code: 403, message: 'forbidden' }));
    const { result } = renderHook(() => useRequest());

    await expect(result.current[0].delete('/note')).rejects.toThrow('无权限');
    expect(useAuthStore.getState().token).toBe('token-1');
    expect(useNotesStore.getState().notes).toHaveLength(1);
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('keeps the session on HTTP 403', async () => {
    mockFetch(jsonResponse({}, 403));
    const { result } = renderHook(() => useRequest());

    await expect(result.current[0].get('/note')).rejects.toThrow('无权限');
    expect(useAuthStore.getState().token).toBe('token-1');
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('reads the envelope message from a non-2xx business error', async () => {
    mockFetch(
      jsonResponse(
        { code: 404, data: null, message: [{ message: '笔记不存在' }] },
        404
      )
    );
    const { result } = renderHook(() => useRequest());

    await expect(result.current[0].get('/note/x')).rejects.toThrow(
      '笔记不存在'
    );
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('logs out on HTTP 401 with a 401 envelope', async () => {
    mockFetch(jsonResponse({ code: 401, data: null, message: 'x' }, 401));
    const { result } = renderHook(() => useRequest());

    await expect(result.current[0].get('/user/info')).rejects.toThrow(
      '您的登录状态已过期，请重新登录'
    );
    expect(useAuthStore.getState().token).toBeNull();
    expect(mocks.push).toHaveBeenCalledWith('/login');
  });

  it('redirects on HTTP 429 with a 429 envelope', async () => {
    mockFetch(jsonResponse({ code: 429, data: null, message: 'slow' }, 429));
    const { result } = renderHook(() => useRequest());

    await expect(result.current[0].get('/note')).rejects.toThrow(
      '您的请求过于频繁，请稍后再试'
    );
    expect(mocks.push).toHaveBeenCalledWith('/too-many-requests');
  });

  it('throws a generic error when a gateway returns non-JSON', async () => {
    mockFetch(
      new Response('<html>502 Bad Gateway</html>', {
        status: 502,
        headers: { 'Content-Type': 'text/html' },
      })
    );
    const { result } = renderHook(() => useRequest());

    await expect(result.current[0].get('/note')).rejects.toThrow(
      '请求失败（HTTP 502）'
    );
    expect(useAuthStore.getState().token).toBe('token-1');
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('surfaces local Next API errors without auth handling', async () => {
    mockFetch(jsonResponse({ error: 'Address not allowed' }, 400));
    const { result } = renderHook(() => useRequest());

    await expect(
      result.current[1]('/api/external-image?url=x', { isLocal: true })
    ).rejects.toThrow('Address not allowed');
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe('/api/external-image?url=x');
    expect(useAuthStore.getState().token).toBe('token-1');
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('returns blobs from local Next API on success', async () => {
    mockFetch(
      new Response(new Uint8Array([1, 2]), {
        status: 200,
        headers: { 'Content-Type': 'image/png' },
      })
    );
    const { result } = renderHook(() => useRequest());

    const blob = await result.current[1]<Blob>('/api/external-image?url=x', {
      isLocal: true,
    });
    expect(blob.size).toBe(2);
  });
});
