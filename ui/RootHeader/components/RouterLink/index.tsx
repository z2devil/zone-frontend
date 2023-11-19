import clsx from 'clsx';
import Link from 'next/link';

interface RouterLinkProps {
  name: string;
  path: string;
  icon: string;
  active: boolean;
}

const RouterLink = (props: RouterLinkProps) => {
  const { name, path, icon, active } = props;

  return (
    <Link
      className={clsx(
        ' group flex h-12 items-center justify-between gap-[0.62rem] rounded-full px-3 transition-colors duration-100 hover:bg-gray-200',
        active ? 'text-primary-50' : 'text-black-600 hover:text-black-900'
      )}
      href={path}>
      <div className=' flex w-full items-center gap-2'>
        <i className={clsx('iconfont flex-shrink-0 text-2xl', icon)}></i>
        <span className=' flex-1 truncate font-medium'>{name}</span>
      </div>
    </Link>
  );
};

export default RouterLink;
