'use client';

import RootHeader from '@/ui/RootHeader';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

interface ContentLayoutProps {
  modal: React.ReactNode;
  children: React.ReactNode;
}

const RootRoutesLayout = (props: ContentLayoutProps) => {
  const { modal, children } = props;

  const pathname = usePathname();

  const showModal = useMemo(() => {
    return pathname.startsWith('/note/') || pathname.startsWith('/write/');
  }, [pathname]);

  return (
    <>
      <RootHeader />
      {showModal && modal}
      {children}
    </>
  );
};

export default RootRoutesLayout;
