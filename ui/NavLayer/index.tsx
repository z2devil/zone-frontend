'use client';

import {
  disableScrollbar,
  enableScrollbar,
} from '@/lib/utils/scrollbarTrigger';
import NavLink from '@/ui/NavLink';
import UserInfo from '@/ui/UserInfo';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';

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

  console.log(pathname);

  const handleBackgroundClick = () => {
    onHide();
  };

  // useEffect(() => {
  //   if (show) {
  //     disableScrollbar();
  //   } else {
  //     enableScrollbar();
  //   }
  // }, [show]);

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
        onClick={handleBackgroundClick}></div>
      {/* modal */}
      <div
        className={clsx(
          ' absolute left-0 right-0 top-1/2 flex w-full flex-col items-center justify-between overflow-hidden transition-all duration-300 sm:mx-auto sm:w-[480px] sm:rounded-2xl sm:bg-gray-100 sm:shadow-2xl',
          show
            ? 'translate-y-[-50%] delay-200'
            : 'pointer-events-none translate-y-[-47%] opacity-0'
        )}>
        <div className='flex w-full items-center justify-between p-6 sm:border-b sm:border-gray-300 sm:bg-white'>
          <UserInfo />
          <button className=' group p-2'>
            <i className='iconfont icon-setting-filled text-2xl text-black-600 transition-colors duration-100 group-hover:text-black-900'></i>
          </button>
        </div>
        <div className=' mt-10 flex flex-col gap-7 p-6'>
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
        <div className='flex w-full items-center justify-center p-10 pb-14'>
          <div
            className=' group flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white px-5 transition-colors duration-100 hover:border-primary-50'
            onClick={handleBackgroundClick}>
            <i className=' iconfont icon-error text-2xl text-black-600 transition-colors duration-100 group-hover:text-primary-50'></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavLayer;
