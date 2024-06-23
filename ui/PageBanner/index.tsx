import { forwardRef, useMemo } from 'react';
import dayjs from '@/lib/utils/dayjs';

interface PageBannerProps {
  title: string;
  lastUpdated?: string;
  canSearch?: boolean;
  onSearchClick?: () => void;
  onChartClick: () => void;
}

const DEFAULT_LAST_UPDATED = '很久很久以前';

const PageBanner = forwardRef<any, PageBannerProps>((props, ref) => {
  const { title, lastUpdated, canSearch, onSearchClick, onChartClick } = props;

  const lastUpdatedTime = useMemo(() => {
    if (!lastUpdated) return DEFAULT_LAST_UPDATED;
    return dayjs(lastUpdated).fromNow();
  }, [lastUpdated]);

  return (
    <div
      ref={ref}
      className=' mb-8 mt-10 flex w-full max-w-3xl flex-col items-start justify-start'>
      <div className='text-[4rem] font-semibold text-black-900'>{title}</div>
      <div className='flex w-full items-center justify-between'>
        <div className='text-[1.125rem] text-black-250'>
          <span>最近更新：</span>
          <span>{lastUpdatedTime}</span>
        </div>
        <div className='flex items-start justify-start gap-2.5'>
          {canSearch ? (
            <button
              className=' flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-100 hover:border-black-80 hover:bg-gray-100'
              onClick={onSearchClick}>
              <i className='iconfont icon-search block h-5 w-5 text-[1.25rem] leading-5 text-black-600'></i>
            </button>
          ) : null}
          <button
            className=' flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-100 hover:border-black-80 hover:bg-gray-100'
            onClick={onChartClick}>
            <i className='iconfont icon-chart block h-5 w-5 text-[1.25rem] leading-5 text-black-600' />
          </button>
        </div>
      </div>
    </div>
  );
});

PageBanner.displayName = 'PageBanner';

export default PageBanner;
