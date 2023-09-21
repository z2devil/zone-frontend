export interface UserInfo {
  nickname: string;
  email: string;
  avatarPath: string;
  lv: UserRole;
}

export enum UserRole {
  UNLOGIN = 0,
  LOGIN,
  ADMIN,
  MANAGER,
}

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
