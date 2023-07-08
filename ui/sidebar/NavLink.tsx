import { IRoute } from '@/lib/route';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';

interface NavLinkProps {
  route: IRoute;
  active?: boolean;
}

const NavLink = (props: NavLinkProps) => {
  const { route, active = false } = props;
  return (
    <Link
      className='flex items-center justify-center gap-2.5 rounded-3xl px-5 py-2.5 hover:bg-[rgba(0,0,0,0.05)]'
      href={route.routePath}>
      <Image
        className=' h-[1.75rem] w-[1.75rem]'
        src={route.iconSrc}
        alt='icon'
        width={60}
        height={60}
      />
      <span
        className={clsx(
          active ?? 'text-[#0A59F7]',
          'text-[1.0625rem] font-normal leading-[1.75rem] text-black text-opacity-60'
        )}>
        {route.text}
      </span>
    </Link>
  );
};

export default NavLink;
