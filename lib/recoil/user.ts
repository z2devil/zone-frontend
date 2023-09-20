import { atom, selector } from 'recoil';
import { UserInfo, UserRole } from '../api/auth';

export const userState = atom<UserInfo>({
  key: 'userState',
  default: {
    nickname: '',
    email: '',
    avatarPath: '',
    lv: 0,
  },
});

export const userRoleState = selector({
  key: 'userRoleState',
  get: ({ get }) => {
    const user = get(userState);

    return UserRole[user.lv];
  },
});
