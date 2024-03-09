import { useMemo } from 'react';
import { VideoBlockElement } from 'types/slate';

interface VideoPreviewProps {
  element: VideoBlockElement;
}

const VideoPreview = (props: VideoPreviewProps) => {
  const { element } = props;

  const url = useMemo(() => element.url, [element.url]);

  return (
    <>
      <iframe className='aspect-video h-full w-full' src={url}></iframe>
    </>
  );
};

export default VideoPreview;
