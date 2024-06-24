'use client';

import { UserRole } from '@/lib/api/user';
import usePermission from '@/lib/hooks/usePermission';
import Button from '@/ui/Button';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface ContentLayoutProps {
  children: React.ReactNode;
}

const ContentLayout = (props: ContentLayoutProps) => {
  const { children } = props;

  const pathname = usePathname();

  const isNotePage = useMemo(() => pathname === '/note', [pathname]);

  const isAdmin = usePermission([UserRole.ADMIN, UserRole.MANAGER]);

  return (
    <>
      {children}
      {isNotePage && isAdmin ? (
        <Link href='/write/new' scroll={false}>
          <Button className='group fixed bottom-20 left-1/2 h-14 w-14 -translate-x-1/2 rounded-full bg-white shadow-main hover:bg-primary-50'>
            <i className='iconfont icon-plus text-2xl text-primary-50 transition-colors duration-100 group-hover:text-white'></i>
          </Button>
        </Link>
      ) : null}
    </>
  );
};

export default ContentLayout;
