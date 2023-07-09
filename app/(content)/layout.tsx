'use client';

import PageBanner from '@/ui/page-banner/PageBanner';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

interface ContentLayoutProps {
  children: React.ReactNode;
}

const ContentLayout = (props: ContentLayoutProps) => {
  const { children } = props;

  const pathname = usePathname();

  const title = useMemo(() => {
    if (pathname === '/note') {
      return '笔记';
    }
    if (pathname === '/works') {
      return '作品';
    }
    return 'ZONE';
  }, [pathname]);

  return (
    <div className='flex flex-1 flex-col gap-12 '>
      <PageBanner
        title={title}
        lastUpdated='Sun Jul 09 2023 15:04:58 GMT+0800 (中国标准时间)'
      />
      <div className='flex flex-1 flex-col'>{children}</div>
    </div>
  );
};

export default ContentLayout;
