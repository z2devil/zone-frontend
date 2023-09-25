'use client';

import clsx from 'clsx';
import { useCallback, useState } from 'react';
import NavLayer from '../NavLayer';
import SearchLayer from '../SearchLayer';

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

  const handleMenuClick = useCallback((key: MenuKey) => {
    const actions = {
      [MenuKey.SEARCH]: () => {
        console.log('search');
        setShowLayer(MenuKey.SEARCH);
      },
      [MenuKey.MORE]: () => {
        console.log('more');
        setShowLayer(MenuKey.MORE);
      },
    };

    actions[key]();
  }, []);

  return (
    <>
      <div className='sticky top-0 z-30 flex h-[3.625rem] w-full items-center justify-between border-b border-gray-300 bg-gray-50 bg-opacity-90 px-5 backdrop-blur-xl'>
        <i className='iconfont icon-logo text-black-900 text-[2rem]'></i>
        <div className='flex items-center gap-[0.63rem]'>
          {MENU.map(item => {
            return (
              <button key={item.key} onClick={() => handleMenuClick(item.key)}>
                <i
                  className={clsx(
                    'iconfont text-black-900 p-[0.5rem] text-2xl',
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
