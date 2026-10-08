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
});
