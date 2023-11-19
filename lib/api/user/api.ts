import { IRequest } from '@/lib/hooks/useRequest';
import {
  GetInfoResponse,
  GetVerificationCodeParams,
  PutInfoParams,
  PutInfoResponse,
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
