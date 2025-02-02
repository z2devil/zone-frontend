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
    <div {...attributes} contentEditable={false}>
      <div
        className={clsx(
          'mb-2 flex min-h-6 gap-2 overflow-hidden rounded-lg bg-gray-50 p-2',
          {
            border: !readOnly,
            'border-primary-50': !readOnly && selected,
            'border-transparent': readOnly || (!readOnly && !selected),
            'hover:border-gray-300': !readOnly && !selected,
          }
        )}>
        {readOnly ? (
          <VideoPreview element={element} />
        ) : (
          <VideoEdit element={element} />
        )}
      </div>
      {children}
    </div>
  );
};

export default VideoBlock;
