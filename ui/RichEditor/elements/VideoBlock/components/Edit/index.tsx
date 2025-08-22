import { useCallback, useMemo } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { VideoBlockElement } from 'types/slate';
import { Transforms } from 'slate';
import clsx from 'clsx';

interface VideoEditProps {
  element: VideoBlockElement;
}

const VideoEdit = (props: VideoEditProps) => {
  const { element } = props;

  const editor = useSlate();

  const url = useMemo(() => element.url, [element.url]);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value;
      Transforms.setNodes(
        editor,
        { url },
        { at: ReactEditor.findPath(editor, element) }
      );
    },
    [editor, element]
  );

  return (
    <div className='group flex w-full flex-col gap-4'>
      <div
        className={clsx(
          'absolute inset-0 flex flex-col items-center justify-center gap-2',
          url &&
            'bg-white bg-opacity-50 opacity-0 transition-all duration-100 group-hover:opacity-100'
        )}>
        <div className='flex w-1/2 flex-col items-center justify-center rounded-lg bg-white p-2 ring-1 ring-black-50'>
          <i className='iconfont icon-film text-xl text-black-600'></i>
          <span className='text-17 font-bold text-black-600'>输入视频链接</span>
          <input
            className='mt-2 w-full border-black-50 text-xs font-bold text-black-250'
            defaultValue={url}
            onInput={handleInput}></input>
        </div>
      </div>
      <iframe className='aspect-video h-full w-full' src={url}></iframe>
    </div>
  );
};

export default VideoEdit;
