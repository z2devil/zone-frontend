import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { IUserInfo, UserRole } from '../api/auth';

interface AuthState {
  userInfo: IUserInfo | null;
  token: string | null;
}

interface AuthAction {
  setUserInfo: (userInfo: IUserInfo | null) => void;
  setToken: (token: string | null) => void;
  clear: () => void;
}

export const useAuthStore = create(
  persist(
    immer<AuthState & AuthAction>(set => ({
      userInfo: null,
      token: null,
      setUserInfo: userInfo => {
        set(state => {
          state.userInfo = userInfo;
        });
      },
      setToken: token => {
        set(state => {
          state.token = token;
        });
      },
      clear: () => {
        set(state => {
          state.userInfo = null;
          state.token = null;
        });
      },
    })),
    {
      name: 'auth-storage',
    }
  )
);

/************************************************
 * ✨ 用户角色
 ************************************************/

const UNKNOW_USER_ROLE = '未知';

const USER_ROLE = {
  [UserRole.UNLOGIN]: '未登录',
  [UserRole.LOGIN]: '普通用户',
  [UserRole.ADMIN]: '管理员',
  [UserRole.MANAGER]: '超级管理员',
};

export const userRoleNameSelector = (store: typeof useAuthStore) => {
  const userInfo = store(state => state.userInfo);
  if (!userInfo) return UNKNOW_USER_ROLE;
  const roleName = USER_ROLE[userInfo.lv];
  return roleName ? roleName : UNKNOW_USER_ROLE;
};
