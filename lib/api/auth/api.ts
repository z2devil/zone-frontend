import { IRequest } from '@/lib/hooks/useRequest';

/**
 * 退出登录，使当前 token 在服务端失效。
 * token 已过期时服务端返回 401，此时不应再触发跳转登录页
 */
export const logoutAPI = (request: IRequest) => () => {
  return request.post<null>('/auth/logout', { skipAuthRedirect: true });
};
