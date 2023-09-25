import { forwardRef } from 'react';
import dayjs from '@/lib/utils/dayjs';

interface PageBannerProps {
  title: string;
  lastUpdated: string;
}

const PageBanner = forwardRef<any, PageBannerProps>((props, ref) => {
  const { title, lastUpdated } = props;

  return (
    <div
      ref={ref}
      className='flex w-full max-w-3xl flex-col items-start justify-start pb-12 pt-5'>
      <div className='text-black-900 text-[4rem] font-semibold'>{title}</div>
      <div className='flex w-full items-center justify-between'>
        <div className='text-black-250 text-[1.125rem]'>
          <span>最近更新：</span>
          <span>{dayjs(lastUpdated).fromNow()}</span>
        </div>
        <div className='flex items-start justify-start gap-2.5'>
          <button className=' flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-100 hover:border-gray-300 hover:bg-gray-100'>
            <i className='iconfont icon-search text-black-600 block h-5 w-5 text-[1.25rem] leading-5' />
          </button>
          <button className=' flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-100 hover:border-gray-300 hover:bg-gray-100'>
            <i className='iconfont icon-chart text-black-600 block h-5 w-5 text-[1.25rem] leading-5' />
          </button>
        </div>
      </div>
    </div>
  );
});

PageBanner.displayName = 'PageBanner';

export default PageBanner;
