import { CSSProperties, useMemo } from 'react';
import NextImage from 'next/image';
import { ImageBlockElement } from 'types/slate';
import { getRandomRgbDataURL } from '@/lib/utils/rgbDataURL';
import imageLoader from 'config/image/loader';

interface ImagePreviewProps {
  element: ImageBlockElement;
}

const ImagePreview = (props: ImagePreviewProps) => {
  const { element } = props;

  const styles = useMemo(() => {
    const res: CSSProperties = {};
    if (element.width) res.width = `${element.width}%`;
    if (element.originHeight && element.originWidth) {
      res.aspectRatio = element.originWidth / element.originHeight;
    }
    return res;
  }, [element.originHeight, element.originWidth, element.width]);

  const isLegalImageUrl = useMemo(() => {
    return (
      element.url &&
      (element.url.startsWith(`https://${process.env.OSS_BUCKET}`) ||
        element.url.startsWith('zone/image/'))
    );
  }, [element.url]);

  const blurDataURL = useMemo(() => getRandomRgbDataURL(), []);

  return (
    <div
      className='relative flex h-full min-h-32 w-full min-w-16 max-w-full cursor-pointer select-none overflow-hidden rounded-lg'
      style={styles}>
      {isLegalImageUrl ? (
        <NextImage
          alt='图片'
          blurDataURL={blurDataURL}
          className='block object-cover'
          fill={true}
          loader={imageLoader}
          placeholder='blur'
          src={element.url || ''}
        />
      ) : null}
    </div>
  );
};

export default ImagePreview;
