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
        ' group flex h-12 items-center justify-center gap-[0.62rem] rounded-full px-5 hover:border hover:border-gray-300 hover:bg-gray-200',
        active ? 'text-primary-50' : 'text-black-600'
      )}
      href={path}>
      <i className={clsx('iconfont text-[1.75rem]', icon)}></i>
      <span className=' font-medium'>{name}</span>
    </Link>
  );
};

export default NavLink;
