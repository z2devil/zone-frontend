import { IUserInfo } from '../api/auth';
import { UserRole } from '../api/auth/types';

const USER_ROLE = {
  [UserRole.UNLOGIN]: '未登录',
  [UserRole.LOGIN]: '普通用户',
  [UserRole.ADMIN]: '管理员',
  [UserRole.MANAGER]: '超级管理员',
};

export const getUserRoleName = (lv: UserRole) => {
  return USER_ROLE[lv];
};

const auth = {
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },
  getToken: () => {
    return localStorage.getItem('token') ?? '';
  },
  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },
  removeToken: () => {
    localStorage.removeItem('token');
  },
  hasUserInfo: () => {
    return localStorage.getItem('userInfo') !== null;
  },
  getUserInfo: () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? (JSON.parse(userInfo) as IUserInfo) : null;
  },
  setUserInfo: (userInfo: IUserInfo) => {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  },
};

export default auth;
