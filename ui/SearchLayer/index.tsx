import clsx from 'clsx';
import style from './style.module.scss';
import { useCallback, useEffect, useRef } from 'react';
import { useNotesStore } from '@/lib/stores/notes';

interface SearchLayerProps {
  show: boolean;
  onHide: () => void;
}

const SearchLayer = (props: SearchLayerProps) => {
  const { show, onHide } = props;

  const { filter, setFilterContent } = useNotesStore();

  const handleBack = () => {
    onHide();
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!show) return;
    const inputDOM = inputRef.current;
    if (!inputDOM) return;
    inputDOM.focus();
    inputDOM.value = filter.content || '';
  }, [filter.content, show]);

  const handleSearch = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') return;
      const value = (e.target as HTMLInputElement).value;
      if (!value) return;
      setFilterContent(value);
      onHide();
      const inputDOM = inputRef.current;
      if (!inputDOM) return;
      inputDOM.value = '';
    },
    [onHide, setFilterContent]
  );

  return (
    <div
      className={clsx(' fixed left-0 top-0 z-30 flex h-full w-full flex-col', {
        'pointer-events-none': !show,
      })}>
      {/* mask */}
      <div
        className={clsx(
          ' absolute left-0 top-0 h-full w-full bg-black-100 duration-500 max-sm:bg-white max-sm:bg-opacity-20 max-sm:backdrop-blur-3xl',
          show ? '' : 'pointer-events-none opacity-0 delay-200'
        )}
        onClick={handleBack}></div>
      {/* modal */}
      <div
        className={clsx(
          ' absolute left-0 right-0 top-1/2 flex w-full flex-col items-center justify-between overflow-hidden transition-all duration-300 sm:mx-auto sm:w-[480px] sm:rounded-2xl sm:bg-gray-100 sm:shadow-2xl',
          show ? 'delay-200' : 'pointer-events-none opacity-0',
          show ? style.modalShow : style.modalHide
        )}>
        <div className='flex w-full items-center justify-between gap-4 p-6 sm:border-b sm:border-black-80 sm:bg-white'>
          <div className='flex flex-1 gap-[0.63rem]'>
            <i className=' iconfont icon-search text-2xl text-black-600'></i>
            <input
              ref={inputRef}
              className=' flex-1 text-lg text-black-900 outline-none placeholder:text-black-250'
              placeholder='找你想要的'
              onKeyDown={handleSearch}
            />
          </div>
          <button className=' group p-2'>
            <span
              className=' text-lg font-medium text-black-600 transition-colors duration-100 group-hover:text-black-900'
              onClick={handleBack}>
              取消
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchLayer;
