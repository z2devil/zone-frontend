'use client';

import clsx from 'clsx';
import { useCallback, useState } from 'react';
import NavLayer from '../RouterLayer';
import { useNotificationUtilsStore } from '@/lib/stores';
import { ROUTER } from '@/lib/constants/router';
import { usePathname } from 'next/navigation';
import RouterLink from './components/RouterLink';

const enum MenuKey {
  MORE,
}

const MENU = [
  {
    key: MenuKey.MORE,
    name: '更多',
    icon: 'icon-bars',
  },
];

const RootHeader = () => {
  const pathname = usePathname();

  const [showLayer, setShowLayer] = useState<MenuKey | null>(null);

  const { utils: notificationUtils } = useNotificationUtilsStore();

  const handleMenuClick = useCallback((key: MenuKey) => {
    const actions = {
      [MenuKey.MORE]: () => {
        // console.log('more');
        setShowLayer(MenuKey.MORE);
      },
    };

    actions[key]();
  }, []);

  return (
    <>
      <div className='sticky top-0 z-30 flex h-[3.625rem] w-full items-center justify-between border-b border-black-80 bg-gray-50 bg-opacity-90 px-5 backdrop-blur-xl'>
        {/* logo */}
        <div>
          <i className='iconfont icon-logo text-[2rem] text-black-900'></i>
        </div>
        {/* 导航 */}
        <div className='pointer-events-none absolute left-0 top-0 flex h-full w-full justify-center px-28 max-sm:hidden'>
          <div className='pointer-events-auto flex h-full max-w-lg flex-1 items-center justify-between'>
            {ROUTER.map(item => {
              return (
                <RouterLink
                  key={item.path}
                  {...item}
                  active={pathname === item.path}
                />
              );
            })}
          </div>
        </div>
        {/* 菜单 */}
        <div className='flex items-center gap-[0.63rem]'>
          {MENU.map(item => {
            return (
              <button key={item.key} onClick={() => handleMenuClick(item.key)}>
                <i
                  className={clsx(
                    'iconfont p-[0.5rem] text-2xl text-black-900',
                    item.icon
                  )}></i>
              </button>
            );
          })}
        </div>
      </div>
      <NavLayer
        show={showLayer === MenuKey.MORE}
        onHide={() => setShowLayer(null)}
      />
    </>
  );
};

export default RootHeader;
