import clsx from 'clsx';
import { useSlate } from 'slate-react';
import { useCallback } from 'react';
import { twMerge } from 'tailwind-merge';
import options from './options';

interface ToolbarProps {
  className?: string;
  fullScreen?: boolean;
  onChangeFullScreen?: (fullScreen: boolean) => void;
}

const Toolbar = (props: ToolbarProps) => {
  const { className, fullScreen, onChangeFullScreen } = props;

  const editor = useSlate();

  const handleFullScreen = useCallback(() => {
    onChangeFullScreen?.(!fullScreen);
  }, [fullScreen, onChangeFullScreen]);

  return (
    <div
      className={clsx(
        twMerge(
          'sticky top-0 flex h-12 flex-shrink-0 px-5 text-black-600 shadow-main',
          className
        )
      )}>
      <div className='flex h-full w-full flex-grow items-center gap-2 overflow-auto'>
        
        {
          options.map((option, index) => {
            if (option === 'separator') {
              return  <div className='mx-1 h-1/3 w-[1px] bg-gray-50' key={index}></div>;
            }

            const active = typeof option.active === 'function' ? option.active(editor) : option.active;
            const disabled = typeof option.disabled === 'function' ? option.disabled(editor) : option.disabled;

            return (
              <button
                className={clsx(
                  'rounded aspect-square overflow-hidden flex p-1 transition-colors duration-100 hover:bg-gray-50 items-center',
                  disabled ? 'cursor-not-allowed text-black-400 hover:text-black-600' : 'hover:bg-gray-50 hover:text-black-900',
                  {
                    'text-primary-50' : active,
                  }
                )}
                disabled={disabled}
                key={index}
                onMouseDown={event => {
                  event.preventDefault();
                  option.onClick(event, editor);
                }}>
                <i className={clsx('text-xl iconfont', option.icon)}></i>
              </button>
            );
          })
        }
      </div>
      {/* 全屏 */}
      <div className='flex h-full flex-shrink-0 items-center gap-2 border-l border-gray-50 pl-2'>
        <button
          onMouseDown={event => {
            event.preventDefault();
            handleFullScreen();
          }}>
          <i
            className={clsx(
              'iconfont rounded p-1 text-lg transition-colors duration-100 hover:bg-gray-50 hover:text-black-900',
              fullScreen ? 'icon-compress-alt' : 'icon-expand-alt'
            )}></i>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
