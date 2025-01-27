import { IRequest } from '@/lib/hooks/useRequest';
import {
  CreateUserParams,
  GetInfoResponse,
  GetUserListParams,
  GetUserListResponse,
  GetVerificationCodeParams,
  PutInfoParams,
  PutInfoResponse,
  PutUserParams,
  SignParams,
  SignResponse,
} from './types';
import { cache } from 'react';

/**
 * 发送邮箱验证码
 */
export const getVerificationCodeAPI = (request: IRequest) =>
  cache((params: GetVerificationCodeParams) => {
    return request.get('/auth/code', params);
  });

/**
 * 登录/注册
 */
export const signAPI = (request: IRequest) => (params: SignParams) => {
  return request.post<SignResponse>('/auth/sign', {
    body: JSON.stringify(params),
  });
};

/**
 * 获取用户信息
 */
export const getUserInfoAPI = (request: IRequest) =>
  cache(() => {
    return request.get<GetInfoResponse>('/auth/info');
  });

/**
 * 修改用户信息
 */
export const putUserInfoAPI =
  (request: IRequest) => (params: PutInfoParams) => {
    return request.put<PutInfoResponse>('/user', {
      body: JSON.stringify(params),
    });
  };

/**
 * 获取用户列表
 */
export const getUserListAPI =
  (request: IRequest) => (params: GetUserListParams) => {
    return request.get<GetUserListResponse>('/user/list', {
      ...params,
    });
  };

/**
 * 创建权限信息
 */
export const createUserAPI =
  (request: IRequest) => (params: CreateUserParams) => {
    return request.post('/user', {
      body: JSON.stringify(params),
    });
  };

/**
 * 删除权限信息
 */
export const removeUserAPI = (request: IRequest) => (_id: string) => {
  return request.delete(`/user`, {
    body: JSON.stringify({ _id }),
  });
};

/**
 * 更新用户信息
 */
export const updateUserAPI = (request: IRequest) => (params: PutUserParams) => {
  return request.put('/user', {
    body: JSON.stringify(params),
  });
};
