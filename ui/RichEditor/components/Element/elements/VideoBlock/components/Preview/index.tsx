import { getRandomRgbDataURL } from '@/lib/utils/rgbDataURL';
import clsx from 'clsx';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VideoBlockElement } from 'types/slate';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

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
