import clsx from 'clsx';
import { useSlate } from 'slate-react';
import { twMerge } from 'tailwind-merge';
import options from './options';

interface ToolbarProps {
  className?: string;
  RightSlot?: JSX.Element;
}

const Toolbar = (props: ToolbarProps) => {
  const { className, RightSlot } = props;

  const editor = useSlate();

  return (
    <div
      className={clsx(
        twMerge(
          'sticky top-0 flex h-12 flex-shrink-0 bg-white px-5 text-black-600 shadow-main',
          className
        )
      )}>
      <div className='flex h-full w-full flex-grow items-center gap-2 overflow-auto'>
        {options.map((option, index) => {
          if (option === 'separator') {
            return (
              <div className='mx-1 h-1/3 w-[1px] bg-gray-50' key={index}></div>
            );
          }

          const active =
            typeof option.active === 'function'
              ? option.active(editor)
              : option.active;
          const disabled =
            typeof option.disabled === 'function'
              ? option.disabled(editor)
              : option.disabled;

          return (
            <button
              className={clsx(
                'flex aspect-square flex-shrink-0 items-center overflow-hidden rounded p-1 transition-colors duration-100 hover:bg-gray-50',
                disabled
                  ? 'cursor-not-allowed text-black-400 hover:text-black-600'
                  : 'hover:bg-gray-50 hover:text-black-900',
                {
                  'text-primary-50': active,
                }
              )}
              disabled={disabled}
              key={index}
              onMouseDown={event => {
                event.preventDefault();
                option.onClick(event, editor);
              }}>
              <i className={clsx('iconfont text-xl', option.icon)}></i>
            </button>
          );
        })}
      </div>
      {/* 右侧插槽 */}
      {RightSlot}
    </div>
  );
};

export default Toolbar;
