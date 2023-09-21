'use client';

import NavLink from '@/ui/NavLink';
import UserInfo from '@/ui/UserInfo';
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
  onClose: () => void;
}

const NavLayer = (props: NavLayerProps) => {
  const { onClose } = props;

  const pathname = usePathname();

  console.log(pathname);

  const handleBackgroundClick = () => {
    onClose();
  };

  return (
    <div
      className='fixed left-0 top-0 z-30 flex h-full w-full flex-col items-center justify-center gap-36 bg-white bg-opacity-20 backdrop-blur-xl'
      onClick={handleBackgroundClick}>
      <div className='flex w-1/3 min-w-[375px] items-center justify-between px-5'>
        <UserInfo />
        <button className=' group p-2'>
          <i className='iconfont icon-setting-filled text-2xl text-black-600 group-hover:text-black-900'></i>
        </button>
      </div>
      <div className=' flex flex-col gap-7'>
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
    </div>
  );
};

export default NavLayer;
