'use client';

import clsx from 'clsx';
import { useCallback, useState } from 'react';
import NavLayer from '../NavLayer';
import SearchLayer from '../SearchLayer';
import { NotificationType } from '../Notification/components/Notification';
import { useNotificationUtilsStore } from '@/lib/stores';

const enum MenuKey {
  SEARCH,
  MORE,
}

const MENU = [
  {
    key: MenuKey.SEARCH,
    name: '搜索',
    icon: 'icon-search',
  },
  {
    key: MenuKey.MORE,
    name: '更多',
    icon: 'icon-bars',
  },
];

const RootHeader = () => {
  const [showLayer, setShowLayer] = useState<MenuKey | null>(null);

  const notificationUtils = useNotificationUtilsStore(state => state.utils);

  const handleMenuClick = useCallback(
    (key: MenuKey) => {
      const actions = {
        [MenuKey.SEARCH]: () => {
          // console.log('search');
          notificationUtils?.open({
            type: NotificationType.WARNING,
            content: '暂未开放',
            duration: 3,
          });
          // setShowLayer(MenuKey.SEARCH);
        },
        [MenuKey.MORE]: () => {
          // console.log('more');
          setShowLayer(MenuKey.MORE);
        },
      };

      actions[key]();
    },
    [notificationUtils]
  );

  return (
    <>
      <div className='sticky top-0 z-30 flex h-[3.625rem] w-full items-center justify-between border-b border-black-80 bg-gray-50 bg-opacity-90 px-5 backdrop-blur-xl'>
        <i className='iconfont icon-logo text-[2rem] text-black-900'></i>
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
      <SearchLayer
        show={showLayer === MenuKey.SEARCH}
        onHide={() => setShowLayer(null)}
      />
      <NavLayer
        show={showLayer === MenuKey.MORE}
        onHide={() => setShowLayer(null)}
      />
    </>
  );
};

export default RootHeader;
