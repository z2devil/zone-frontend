'use client';

import { IUserInfo, getUserInfoAPI } from '@/lib/api/auth';
import auth, { getUserRoleName } from '@/lib/utils/auth';
import NavLink from '@/ui/NavLink';
import UserInfo from '@/ui/UserInfo';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import style from './style.module.scss';

const NAV_LINKS = [
  {
    name: '笔记',
    path: '/note',
    icon: 'icon-note',
  },
  {
    name: '文章',
    path: '/article',
    icon: 'icon-works',
  },
  {
    name: '关于',
    path: '/about',
    icon: 'icon-about',
  },
];

interface NavLayerProps {
  show: boolean;
  onHide: () => void;
}

const NavLayer = (props: NavLayerProps) => {
  const { show, onHide } = props;

  const pathname = usePathname();

  const handleBack = () => {
    onHide();
  };

  /************************************************
   * ✨ 用户信息
   ************************************************/

  const [userInfo, setUserInfo] = useState<IUserInfo | null>(null);

  const calcUserInfo = useMemo(() => {
    if (userInfo) {
      return {
        avatarPath: userInfo.avatarPath,
        nickname: userInfo.nickname,
        roleName: getUserRoleName(userInfo.lv),
      };
    }
    return void 0;
  }, [userInfo]);

  const init = useCallback(async () => {
    const storageUserInfo = auth.getUserInfo();
    if (storageUserInfo) {
      setUserInfo(storageUserInfo);
    } else {
      try {
        const { info: requestUserInfo } = await getUserInfoAPI();
        setUserInfo(requestUserInfo);
        auth.setUserInfo(requestUserInfo);
      } catch (error) {
        console.log(error);
      }
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div
      className={clsx(' fixed left-0 top-0 z-30 flex h-full w-full flex-col', {
        'pointer-events-none': !show,
      })}>
      {/* mask */}
      <div
        className={clsx(
          ' absolute left-0 top-0 h-full w-full bg-black-100 duration-500 max-sm:bg-white max-sm:bg-opacity-20 max-sm:backdrop-blur-3xl',
          show ? '' : 'pointer-events-none opacity-0 delay-200'
        )}
        onClick={handleBack}></div>
      {/* modal */}
      <div
        className={clsx(
          ' absolute left-0 right-0 top-1/2 flex w-full flex-col items-center justify-between transition-all duration-300 sm:mx-auto sm:w-[480px] sm:rounded-2xl sm:bg-gray-100 sm:shadow-2xl',
          show ? 'delay-200' : 'pointer-events-none opacity-0',
          show ? style.modalShow : style.modalHide
        )}>
        <div className='flex w-full items-center justify-between p-6 sm:rounded-t-2xl sm:border-b sm:border-gray-300 sm:bg-white'>
          <UserInfo info={calcUserInfo} />
          <button className=' group p-2'>
            <i className='iconfont icon-setting-filled text-2xl text-black-600 transition-colors duration-100 group-hover:text-black-900'></i>
          </button>
        </div>
        <div className=' flex w-full flex-col gap-7 py-6'>
          {NAV_LINKS.map(item => {
            return (
              <NavLink
                key={item.path}
                {...item}
                active={pathname === item.path}
              />
            );
          })}
        </div>
        <div className='absolute bottom-0 left-0 right-0 flex w-full translate-y-[100%] items-center justify-center p-10 pb-14'>
          <div
            className=' group flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-white px-5 transition-colors duration-100 hover:bg-primary-50 sm:shadow-2xl'
            onClick={handleBack}>
            <i className=' iconfont icon-error text-2xl text-black-600 transition-colors duration-100 group-hover:text-white'></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavLayer;
