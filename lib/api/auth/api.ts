import { IRequest } from '@/lib/hooks/useRequest';

/**
 * 退出登录，使当前 token 在服务端失效
 */
export const logoutAPI = (request: IRequest) => () => {
  return request.post<null>('/auth/logout');
};
