import { forwardRef } from 'react';

interface SearchBannerProps {
  content: string;
  total: number;
  onCancelSearch: () => void;
  onSearchAgain: () => void;
}

const SearchBanner = forwardRef<any, SearchBannerProps>((props, ref) => {
  const { content, total, onCancelSearch, onSearchAgain } = props;

  return (
    <div ref={ref} className=' mb-8 mt-10 flex w-full max-w-3xl'>
      <div className=' mx-auto flex flex-col gap-5'>
        <span className=' text-3xl font-semibold text-black-900'>
          已找到与<span className=' text-primary-50'> “{content}” </span>
          相关的
          <span className=' text-primary-50'>
            {` ${total === Infinity ? '...' : total} `}
          </span>
          条记录
        </span>
        <div className='flex gap-2'>
          <button
            className=' group flex h-10 w-10 items-center justify-center gap-1 rounded-xl border border-black-80 px-3 transition-colors duration-100 hover:border-primary-50'
            title='取消搜索'
            onClick={onCancelSearch}>
            <i className='iconfont icon-error block h-5 w-5 text-[1.25rem] leading-5 text-black-250 transition-colors duration-100 group-hover:text-primary-50' />
          </button>
          <button
            className=' group flex h-10 w-10 items-center justify-center gap-1 rounded-xl border border-black-80 px-3 transition-colors duration-100 hover:border-primary-50'
            title='重新搜索'
            onClick={onSearchAgain}>
            <i className='iconfont icon-search block h-5 w-5 text-[1.25rem] leading-5 text-black-250 transition-colors duration-100 group-hover:text-primary-50' />
          </button>
        </div>
      </div>
    </div>
  );
});

SearchBanner.displayName = 'SearchBanner';

export default SearchBanner;
