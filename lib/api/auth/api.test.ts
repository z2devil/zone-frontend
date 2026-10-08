import type { IRequest } from '@/lib/hooks/useRequest';
import { describe, expect, it, vi } from 'vitest';
import { logoutAPI } from './api';

describe('auth API', () => {
  it('posts to the logout endpoint', async () => {
    const post = vi.fn().mockResolvedValue(null);
    const request = { post } as unknown as IRequest;

    await logoutAPI(request)();

    // token 已失效时服务端返回 401，退出流程不应再跳转登录页
    expect(post).toHaveBeenCalledWith('/auth/logout', {
      skipAuthRedirect: true,
    });
  });
});
