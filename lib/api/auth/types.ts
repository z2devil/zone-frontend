export interface UserInfo {
  nickname: string;
  email: string;
  avatarPath: string;
  lv: number;
}

export enum UserRole {
  LOGIN = 1,
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
