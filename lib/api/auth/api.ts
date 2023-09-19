import request from '@/lib/utils/request';
import { GetVerificationCodeParams, SignParams } from './types';
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
  return request.post('/auth/sign', {
    body: JSON.stringify(params),
  });
};
