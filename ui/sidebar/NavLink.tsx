import { IRoute } from '@/lib/route';
import clsx from 'clsx';
import Link from 'next/link';

interface NavLinkProps {
  route: IRoute;
  active?: boolean;
}

const NavLink = (props: NavLinkProps) => {
  const { route, active = false } = props;
  return (
    <Link
      className='flex items-center justify-center gap-2 rounded-3xl px-5 py-2.5 hover:bg-[rgba(0,0,0,0.05)]'
      href={route.routePath}>
      <i
        className={clsx(
          active ? 'text-[#0A59F7]' : 'text-black-600',
          `iconfont ${route.iconClass} text-[1.75rem] leading-[1.75rem]`
        )}
      />
      <span
        className={clsx(
          active ? 'text-[#0A59F7]' : 'text-black-600',
          'text-[1.0625rem] font-normal leading-[1.75rem]'
        )}>
        {route.text}
      </span>
    </Link>
  );
};

export default NavLink;
