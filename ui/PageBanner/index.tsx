import { forwardRef, useCallback, useMemo, useState } from 'react';
import dayjs from '@/lib/utils/dayjs';
import Statistics from './components/Statistics';
import { AnimatePresence, motion } from 'motion/react';

interface PageBannerProps {
  containerWidth: number;
  title: string;
  lastUpdated?: string;
  canSearch?: boolean;
  onSearchClick?: () => void;
  onChartClick: () => void;
}

const DEFAULT_LAST_UPDATED = '很久很久以前';

const PageBanner = forwardRef<any, PageBannerProps>((props, ref) => {
  const { containerWidth, title, lastUpdated, canSearch, onSearchClick } =
    props;

  const lastUpdatedTime = useMemo(() => {
    if (!lastUpdated) return DEFAULT_LAST_UPDATED;
    return dayjs(lastUpdated).fromNow();
  }, [lastUpdated]);

  const [isStatisticsVisible, setIsStatisticsVisible] = useState(false);

  const style = useMemo(() => {
    if (!containerWidth) return {};
    return {
      width: containerWidth + 'px',
    };
  }, [containerWidth]);

  const handleChartClick = useCallback(() => {
    setIsStatisticsVisible(true);
  }, []);

  return (
    <motion.div
      className='z-[1] mb-8 mt-10 flex w-full max-w-3xl flex-col items-start justify-start'
      ref={ref}
      style={style}>
      <AnimatePresence>
        {!isStatisticsVisible ? (
          <motion.div
            animate={{ opacity: 1 }}
            className='w-full'
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ type: 'tween' }}>
            <div className='text-[4rem] font-semibold text-black-900'>
              {title}
            </div>
            <div className='flex w-full items-center justify-between'>
              <div className='text-[1.125rem] text-black-250'>
                <span>最近更新：</span>
                <span>{lastUpdatedTime}</span>
              </div>
              <div className='flex items-start justify-start gap-2.5'>
                {canSearch ? (
                  <button
                    className='flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black-600 ring-1 ring-black-50 transition-all duration-100 hover:text-primary-50 hover:ring-primary-50'
                    onClick={onSearchClick}>
                    <i className='iconfont icon-search block h-5 w-5 text-[1.25rem] leading-5'></i>
                  </button>
                ) : null}
                <button
                  className='flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black-600 ring-1 ring-black-50 transition-all duration-100 hover:text-primary-50 hover:ring-primary-50'
                  onClick={handleChartClick}>
                  <i className='iconfont icon-chart block h-5 w-5 text-[1.25rem] leading-5' />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <Statistics
            containerWidth={containerWidth}
            onClose={() => setIsStatisticsVisible(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
});

PageBanner.displayName = 'PageBanner';

export default PageBanner;
