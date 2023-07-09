'use client';

import { usePathname } from 'next/navigation';
import User from './User';
import { IUser, getUserInfo } from '@/lib/user';
import { useEffect, useState } from 'react';
import LogoNav from './LogoNav';
import { IRoute, getRoutes } from '@/lib/route';
import NavLink from './NavLink';

const Sidebar = () => {
  const pathname = usePathname();

  const [userInfo, setUserInfo] = useState<IUser | null>(null);

  const [routes, setRoutes] = useState<IRoute[]>([]);

  useEffect(() => {
    getUserInfo().then(res => {
      setUserInfo(res);
    });
    getRoutes().then(res => {
      setRoutes(res);
    });
  }, []);

  return (
    <div className='h-full p-5'>
      <div className='flex h-full flex-shrink-0 flex-col items-start justify-between rounded-xl border border-gray-200 bg-stone-50'>
        <div className='flex items-start justify-start gap-2.5 self-stretch p-12'>
          <LogoNav />
        </div>
        <div className='flex h-[312px] flex-col items-start justify-start gap-2.5 self-stretch pl-[65px]'>
          <div className='flex flex-col items-start justify-start gap-10'>
            {routes.map(route => {
              const isActive = pathname.startsWith(route.routePath);
              return (
                <NavLink
                  key={route.routePath}
                  route={route}
                  active={isActive}
                />
              );
            })}
          </div>
        </div>
        <div className='flex h-[174px] flex-col items-start justify-start gap-2.5 self-stretch px-[50px] py-[55px]'>
          {userInfo ? <User user={userInfo} /> : null}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
