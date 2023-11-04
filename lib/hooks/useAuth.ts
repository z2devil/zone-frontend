import { useEffect, useState } from 'react';
import { IUserInfo } from '../api/auth';

interface IAuthUtils {
  isAuthenticated: () => boolean;
  getToken: () => string;
  setToken: (token: string) => void;
  removeToken: () => void;
  hasUserInfo: () => boolean;
  getUserInfo: () => IUserInfo | null;
  setUserInfo: (userInfo: IUserInfo) => void;
  logout: () => void;
}

const useAuth = () => {
  const [utils, setUtils] = useState<IAuthUtils | null>(null);

  useEffect(() => {
    setUtils({
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
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
      },
    });
  }, []);

  return utils;
};

export default useAuth;
