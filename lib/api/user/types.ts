import { CommonInfo } from '../types';

/************************************************
 * ✨ 实体
 ************************************************/

/**
 * 用户角色枚举
 */
export enum UserRole {
  UNLOGIN = 0,
  LOGIN,
  ADMIN,
  MANAGER,
}

/**
 * 用户实体
 */
export interface UserEntity extends CommonInfo {
  nickname: string;
  email: string;
  avatarPath: string;
  lv: UserRole;
}

/**
 * 用户信息
 */
export type UserInfo = Pick<
  UserEntity,
  '_id' | 'nickname' | 'email' | 'avatarPath' | 'lv'
>;

/************************************************
 * ✨ API
 ************************************************/

export interface GetVerificationCodeParams {
  email: string;
}

export interface SignParams {
  email: string;
  code: string;
}

export interface SignResponse {
  token: string;
  info: UserInfo;
}

export interface GetInfoResponse {
  token: string;
  info: UserInfo;
}

export interface PutInfoParams {
  nickname: string;
  avatarPath: string;
}

export interface PutInfoResponse {
  token: string;
  info: UserInfo;
}
