import Image from 'next/image';
import { useMemo } from 'react';
import { LayoutBlockElement } from 'types/slate';
import { useSlate } from 'slate-react';
import defaultImg from 'public/tip/default-img.png';

interface LayoutPreviewProps {
  element: LayoutBlockElement;
}

const VideoPreview = (props: LayoutPreviewProps) => {
  const { element } = props;

  const editor = useSlate();

  const isSummary = useMemo(() => {
    return editor.isSummary;
  }, [editor.isSummary]);

  const url = useMemo(() => element.url, [element.url]);

  return (
    <>
      {isSummary ? (
        <Image
          alt='placeholder'
          className='aspect-video w-full object-contain'
          src={defaultImg}
        />
      ) : (
        <iframe className='aspect-video h-full w-full' src={url}></iframe>
      )}
    </>
  );
};

export default VideoPreview;
