import { useReadOnly, useSelected } from 'slate-react';
import { VideoBlockElement } from 'types/slate';
import VideoPreview from './components/Preview';
import VideoEdit from './components/Edit';
import clsx from 'clsx';

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
        className={clsx(
          'border-1 mb-2 flex overflow-hidden rounded-lg border bg-gray-50',
          !readOnly
            ? selected
              ? 'border-primary-50'
              : 'border-transparent'
            : ''
        )}
        contentEditable={false}>
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
