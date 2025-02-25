'use client';

import { getRandomRgbDataURL } from '@/lib/utils/rgbDataURL';
import {
  disableScrollbar,
  enableScrollbar,
  isDisabledScrollbar,
} from '@/lib/utils/scrollbarTrigger';
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
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/ui/components/ui/carousel';

export interface ImagePreviewProps {
  visible: boolean;
  images: ImageBlockElement[];
  index: number;
  onClose: () => void;
}

const ImagePreview = (props: ImagePreviewProps) => {
  const { visible, images, index, onClose } = props;

  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const [current, setCurrent] = useState(0);

  const loadedImages = useMemo(
    () => images.map(img => img.url || ''),
    [images]
  );

  const blurDataURL = useMemo(() => getRandomRgbDataURL(), []);

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

  const handlePageChange = useCallback(
    (event: MouseEvent, type: 'pre' | 'next') => {
      event.stopPropagation();
      if (!api) {
        return;
      }
      if (type === 'pre') {
        api.scrollPrev();
      } else {
        api.scrollNext();
      }
    },
    [api]
  );

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
          <Carousel
            className='relative h-full w-full'
            opts={{
              startIndex: index,
            }}
            setApi={setApi}>
            <CarouselContent className='relative ml-0 flex h-svh w-full'>
              {loadedImages.map((img, i) => (
                <CarouselItem
                  className='relative h-full w-full overflow-hidden'
                  key={i}>
                  <Image
                    fill
                    priority
                    alt='preview'
                    blurDataURL={blurDataURL}
                    className='max-h-full max-w-full object-scale-down'
                    loader={imageLoader}
                    placeholder='blur'
                    sizes='100vw'
                    src={img}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div
              className='duration-400 fixed top-0 flex h-full w-1/6 cursor-pointer items-center justify-center opacity-0 transition-opacity hover:opacity-100'
              onClick={e => handlePageChange(e, 'pre')}>
              <span className='iconfont icon-angle-left !text-5xl text-white drop-shadow-md' />
            </div>
            <div
              className='duration-400 fixed right-0 top-0 flex h-full w-1/6 cursor-pointer items-center justify-center opacity-0 transition-opacity hover:opacity-100'
              onClick={e => handlePageChange(e, 'next')}>
              <span className='iconfont icon-angle-right !text-5xl text-white drop-shadow-md' />
            </div>
            <div className='absolute bottom-0 left-0 right-0 flex items-center justify-center py-6'>
              <span className='text-xl text-white drop-shadow-md'>
                {current} / {loadedImages.length}
              </span>
            </div>
          </Carousel>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default ImagePreview;
