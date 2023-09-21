import request from '@/lib/api/request';
import {
  GetInfoResponse,
  GetVerificationCodeParams,
  SignParams,
  SignResponse,
} from './types';
import { cache } from 'react';

/**
 * 发送邮箱验证码
 */
export const getVerificationCodeAPI = cache(
  (params: GetVerificationCodeParams) => {
    return request.get('/auth/code', params);
  }
);

/**
 * 登录/注册
 */
export const signAPI = (params: SignParams) => {
  return request.post<SignResponse>('/auth/sign', {
    body: JSON.stringify(params),
  });
};

/**
 * 获取用户信息
 */
export const getUserInfoAPI = () => {
  return request.get<GetInfoResponse>('/auth/info');
};
