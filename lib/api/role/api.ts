import { IRequest } from '@/lib/hooks/useRequest';
import {
  CreateRoleParams,
  GetRoleListParams,
  GetRoleListResponse,
  PutRoleParams,
} from './types';

/**
 * 创建权限信息
 */
export const createRoleAPI =
  (request: IRequest) => (params: CreateRoleParams) => {
    return request.post('/role', {
      body: JSON.stringify(params),
    });
  };

/**
 * 删除权限信息
 */
export const removeRoleAPI = (request: IRequest) => (_id: string) => {
  return request.delete(`/role`, {
    body: JSON.stringify({ _id }),
  });
};

/**
 * 修改角色
 */
export const putRoleInfoAPI =
  (request: IRequest) => (params: PutRoleParams) => {
    return request.put('/role', {
      body: JSON.stringify(params),
    });
  };

/**
 * 获取角色列表
 */
export const getRoleListAPI =
  (request: IRequest) => (params: GetRoleListParams) => {
    return request.get<GetRoleListResponse>('/role', {
      ...params,
    });
  };

/**
 * 获取角色权限
 */
export const getRolePermissionListAPI =
  (request: IRequest) => (roleId: string) => {
    return request.get(`/role/${roleId}/permission`);
  };

/**
 * 批量更新角色权限
 */
export const setRolePermissionAPI =
  (request: IRequest) =>
  (params: { roleId: string; permissionIds: string[] }) => {
    return request.put(`/role/${params.roleId}/permission`, {
      body: JSON.stringify(params),
    });
  };
