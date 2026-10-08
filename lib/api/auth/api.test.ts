import type { IRequest } from '@/lib/hooks/useRequest';
import { describe, expect, it, vi } from 'vitest';
import { logoutAPI } from './api';

describe('auth API', () => {
  it('posts to the logout endpoint', async () => {
    const post = vi.fn().mockResolvedValue(null);
    const request = { post } as unknown as IRequest;

    await logoutAPI(request)();

    expect(post).toHaveBeenCalledWith('/auth/logout');
  });
});
