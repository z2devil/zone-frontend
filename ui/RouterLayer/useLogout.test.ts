import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useLogout from './useLogout';

const mocks = vi.hoisted(() => ({
  logout: vi.fn(),
  setUserInfo: vi.fn(),
  setToken: vi.fn(),
  clearNotes: vi.fn(),
}));

vi.mock('@/lib/hooks/useRequest', () => ({
  default: () => [{}],
}));

vi.mock('@/lib/api/auth', () => ({
  logoutAPI: () => mocks.logout,
}));

vi.mock('@/lib/stores', () => ({
  useAuthStore: () => ({
    setUserInfo: mocks.setUserInfo,
    setToken: mocks.setToken,
  }),
  useNotesStore: (selector: (state: { clear: () => void }) => unknown) =>
    selector({ clear: mocks.clearNotes }),
}));

describe('useLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('notifies the backend before clearing the local session and drafts', () => {
    const order: string[] = [];
    mocks.logout.mockImplementation(() => {
      order.push('logout');
      return Promise.resolve();
    });
    mocks.setToken.mockImplementation(() => order.push('setToken'));
    localStorage.setItem('note-draft:note-1', '[]');
    localStorage.setItem('note-draft:new', '[]');

    const { result } = renderHook(() => useLogout());
    act(() => result.current());

    expect(order).toEqual(['logout', 'setToken']);
    expect(mocks.setToken).toHaveBeenCalledWith(null);
    expect(mocks.setUserInfo).toHaveBeenCalledWith(null);
    expect(mocks.clearNotes).toHaveBeenCalled();
    expect(localStorage.getItem('note-draft:note-1')).toBeNull();
    expect(localStorage.getItem('note-draft:new')).toBeNull();
  });

  it('still logs out locally when the backend request fails', async () => {
    mocks.logout.mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useLogout());
    await act(async () => {
      result.current();
    });

    expect(mocks.setToken).toHaveBeenCalledWith(null);
    expect(mocks.clearNotes).toHaveBeenCalled();
  });
});
