import clsx from 'clsx';

interface FullScreenButtonProps {
  fullScreen: boolean;
  onChangeFullScreen: (fullScreen: boolean) => void;
}

const FullScreenButton = (props: FullScreenButtonProps) => {
  const { fullScreen, onChangeFullScreen } = props;

  return (
    <div className='flex h-full flex-shrink-0 items-center gap-2 border-l border-gray-50 pl-2'>
      <button
        onMouseDown={event => {
          event.preventDefault();
          onChangeFullScreen(!fullScreen);
        }}>
        <i
          className={clsx(
            'iconfont rounded p-1 text-lg transition-colors duration-100 hover:bg-gray-50 hover:text-black-900',
            fullScreen ? 'icon-compress-alt' : 'icon-expand-alt'
          )}></i>
      </button>
    </div>
  );
};

export default FullScreenButton;
