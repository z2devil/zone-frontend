import { IRequest } from '@/lib/hooks/useRequest';
import {
  CreatePermissionParams,
  GetPermissionListParams,
  GetPermissionListResponse,
  PutPermissionParams,
} from './types';

/**
 * 创建权限信息
 */
export const createPermissionAPI =
  (request: IRequest) => (params: CreatePermissionParams) => {
    return request.post('/permission', {
      body: JSON.stringify(params),
    });
  };

/**
 * 删除权限信息
 */
export const removePermissionAPI = (request: IRequest) => (_id: string) => {
  return request.delete(`/permission`, {
    body: JSON.stringify({ _id }),
  });
};

/**
 * 修改权限信息
 */
export const putPermissionInfoAPI =
  (request: IRequest) => (params: PutPermissionParams) => {
    return request.put('/permission', {
      body: JSON.stringify(params),
    });
  };

/**
 * 获取权限列表
 */
export const getPermissionListAPI =
  (request: IRequest) => (params: GetPermissionListParams) => {
    return request.get<GetPermissionListResponse>('/permission', {
      ...params,
    });
  };
