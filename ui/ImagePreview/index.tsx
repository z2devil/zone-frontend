'use client'

import { getRandomRgbDataURL } from '@/lib/utils/rgbDataURL';
import clsx from 'clsx';
import imageLoader from 'config/image/loader';
import Image from 'next/image';
import { MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { ImageBlockElement } from 'types/slate';

interface ImagePreviewProps {
  images: ImageBlockElement[];
  index: number;
  onClose: () => void;
}

const CACHE_SIZE = 3;

const ImagePreview = (props: ImagePreviewProps) => {
  const { images, index, onClose } = props;

  const [current, setCurrent] = useState(index);

  const [loadedImages, setLoadedImages] = useState<string[]>([]);

  useEffect(() => {
    setLoadedImages(() => {
      const res: string[] = [];
      for (let i = 0; i < images.length; i++) {
        if (i >= current - CACHE_SIZE && i <= current + CACHE_SIZE) {
          res.push(images[i].url || '');
        }
      }
      return res;
    });
  }, [current, images]);

  const blurDataURL = useMemo(() => getRandomRgbDataURL(), []);

  const handlePageChange = useCallback(
    (event: MouseEvent, type: 'pre' | 'next') => {
      event.stopPropagation();
      setCurrent(prev => {
        const newIndex = type === 'pre' ? prev - 1 : prev + 1;
        return Math.max(0, Math.min(newIndex, images.length - 1));
      });
    },
    [images]
  );

  return (
    <div
      className='bg-black fixed inset-0 z-30 flex select-none items-center justify-center bg-black-300'
      onClick={onClose}>
      <div className='relative h-full w-full'>
        <div className='absolute inset-0 flex items-center justify-center'>
          {loadedImages.map((img, i) => (
            <Image
              priority
              alt='preview'
              blurDataURL={blurDataURL}
              className={clsx('max-h-full max-w-full object-scale-down', {
                hidden: img !== images[current].url,
              })}
              key={i}
              layout='fill'
              loader={imageLoader}
              placeholder='blur'
              src={img}
            />
          ))}
        </div>
        <div
          className='duration-400 fixed top-0 flex h-full cursor-pointer items-center justify-center px-8 opacity-0 transition-opacity hover:opacity-100'
          onClick={e => handlePageChange(e, 'pre')}>
          <span className='iconfont icon-angle-left !text-5xl text-black-600' />
        </div>
        <div
          className='duration-400 fixed right-0 top-0 flex h-full cursor-pointer items-center justify-center px-8 opacity-0 transition-opacity hover:opacity-100'
          onClick={e => handlePageChange(e, 'next')}>
          <span className='iconfont icon-angle-right !text-5xl text-black-600' />
        </div>
        <div className='absolute bottom-0 left-0 right-0 flex items-center justify-center py-6'>
          <span className='text-xl text-white drop-shadow-md'>
            {current + 1} / {images.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
