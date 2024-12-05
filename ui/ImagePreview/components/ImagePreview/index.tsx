'use client';

import { getRandomRgbDataURL } from '@/lib/utils/rgbDataURL';
import {
  disableScrollbar,
  enableScrollbar,
  isDisabledScrollbar,
} from '@/lib/utils/scrollbarTrigger';
import clsx from 'clsx';
import imageLoader from 'config/image/loader';
import Image from 'next/image';
import {
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ImageBlockElement } from 'types/slate';
import { AnimatePresence, motion } from 'motion/react';

export interface ImagePreviewProps {
  visible: boolean;
  images: ImageBlockElement[];
  index: number;
  onClose: () => void;
}

const CACHE_SIZE = 3;

const ImagePreview = (props: ImagePreviewProps) => {
  const { visible, images, index, onClose } = props;

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

  const latestDisabledScrollbar = useRef(false);

  useEffect(() => {
    if (visible) {
      latestDisabledScrollbar.current = isDisabledScrollbar();
      disableScrollbar();
    } else {
      if (!latestDisabledScrollbar.current) {
        enableScrollbar();
      }
    }
  }, [visible]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          animate={{ opacity: 1 }}
          className='bg-black fixed inset-0 z-30 flex select-none items-center justify-center bg-black-300'
          exit={{
            opacity: 0,
          }}
          initial={{ opacity: 0 }}
          style={{
            marginTop: '3.625rem',
            minHeight: 'calc(100vh - 3.625rem)',
          }}
          transition={{ type: 'tween' }}
          onClick={onClose}>
          <div className='relative h-full w-full'>
            <div className='absolute inset-0 flex items-center justify-center'>
              {loadedImages.map((img, i) => (
                <Image
                  fill
                  priority
                  alt='preview'
                  blurDataURL={blurDataURL}
                  className={clsx('max-h-full max-w-full object-scale-down', {
                    hidden: img !== images[current].url,
                  })}
                  key={i}
                  loader={imageLoader}
                  placeholder='blur'
                  sizes='100vw'
                  src={img}
                />
              ))}
            </div>
            <div
              className='duration-400 fixed top-0 flex h-full cursor-pointer items-center justify-center px-8 opacity-0 transition-opacity hover:opacity-100'
              onClick={e => handlePageChange(e, 'pre')}>
              <span className='iconfont icon-angle-left !text-5xl text-white drop-shadow-md' />
            </div>
            <div
              className='duration-400 fixed right-0 top-0 flex h-full cursor-pointer items-center justify-center px-8 opacity-0 transition-opacity hover:opacity-100'
              onClick={e => handlePageChange(e, 'next')}>
              <span className='iconfont icon-angle-right !text-5xl text-white drop-shadow-md' />
            </div>
            <div className='absolute bottom-0 left-0 right-0 flex items-center justify-center py-6'>
              <span className='text-xl text-white drop-shadow-md'>
                {current + 1} / {images.length}
              </span>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default ImagePreview;
