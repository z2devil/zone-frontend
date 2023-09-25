import clsx from 'clsx';
import Link from 'next/link';

interface NavLinkProps {
  name: string;
  path: string;
  icon: string;
  active?: boolean;
}

const NavLink = (props: NavLinkProps) => {
  const { name, path, icon, active } = props;

  return (
    <Link
      className={clsx(
        ' group flex h-12 w-full items-center justify-between gap-[0.62rem] pl-8 pr-7 transition-colors duration-100 hover:bg-gray-200',
        active ? 'text-primary-50' : 'text-black-600'
      )}
      href={path}>
      <div className=' flex items-center gap-2'>
        <i className={clsx('iconfont text-2xl', icon)}></i>
        <span className=' font-medium'>{name}</span>
      </div>
      <i
        className={clsx(
          'iconfont icon-angle-right text-lg transition-colors duration-100',
          active ? 'text-primary-50' : 'text-black-600'
        )}></i>
    </Link>
  );
};

export default NavLink;
