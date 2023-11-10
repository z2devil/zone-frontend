import { atom, selector } from 'recoil';
import { IUserInfo } from '../api/auth';
import authUtils from '../utils/auth';

export interface AuthState {
  userInfo: IUserInfo | null;
  token: string | null;
}

const authState = atom<AuthState>({
  key: 'authState',
  default: {
    userInfo: null,
    token: null,
  },
});

export const userInfoState = selector<IUserInfo | null>({
  key: 'userInfoState',
  get: ({ get }) => {
    const userInfo = authUtils.getUserInfo();
    const result = userInfo ? userInfo : get(authState)?.userInfo;
    return result ? result : null;
  },
  set: ({ set, get }, newValue) => {
    const auth = get(authState);
    if (!auth) return;
    authUtils.setUserInfo(newValue as IUserInfo);
    const nextAuth = { ...auth };
    nextAuth.userInfo = newValue as IUserInfo;
    console.log('[ nextAuth ]', nextAuth);
    set(authState, nextAuth);
  },
});

export const tokenState = selector<string | null>({
  key: 'tokenState',
  get: ({ get }) => {
    const token = authUtils.getToken();
    const result = token ? token : get(authState)?.token;
    return result ? result : null;
  },
  set: ({ set, get }, newValue) => {
    const auth = get(authState);
    if (!auth) return;
    authUtils.setToken(newValue as string);
    const nextAuth = { ...auth };
    nextAuth.token = newValue as string;
    console.log('[ nextAuth ]', nextAuth);
    set(authState, nextAuth);
  },
});
