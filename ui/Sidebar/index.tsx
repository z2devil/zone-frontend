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
    <div className='h-full p-5 max-md:hidden'>
      <div className='flex h-full flex-shrink-0 flex-col items-start justify-between rounded-xl border border-gray-300 bg-gray-100'>
        <div className='flex items-start justify-start gap-2.5 p-12'>
          <LogoNav />
        </div>
        <div className='mx-auto flex flex-col gap-2.5'>
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
        <div className='mx-auto mb-14 flex gap-2.5'>
          {userInfo ? <User user={userInfo} /> : null}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
