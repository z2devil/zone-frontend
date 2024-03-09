import { useReadOnly, useSelected } from 'slate-react';
import { VideoBlockElement } from 'types/slate';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import VideoPreview from './components/Preview';
import VideoEdit from './components/Edit';
import clsx from 'clsx';

dayjs.extend(duration);

interface VideoBlockProps {
  attributes: any;
  children: any;
  element: VideoBlockElement;
}

const VideoBlock = ({ attributes, children, element }: VideoBlockProps) => {
  const readOnly = useReadOnly();

  const selected = useSelected();

  return (
    <div {...attributes}>
      <div
        contentEditable={false}
        className={clsx(
          ' border-1 mb-2 flex overflow-hidden rounded-lg border bg-gray-50',
          !readOnly
            ? selected
              ? 'border-primary-50'
              : 'border-transparent'
            : ''
        )}>
        {readOnly ? (
          <VideoPreview element={element} />
        ) : (
          <VideoEdit element={element} />
        )}
      </div>
      <div
        style={{
          fontSize: '0',
        }}>
        {children}
      </div>
    </div>
  );
};

export default VideoBlock;
