import { getRandomRgbDataURL } from '@/lib/utils/rgbDataURL';
import clsx from 'clsx';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MusicBlockElement } from 'types/slate';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { usePathname } from 'next/navigation';

dayjs.extend(duration);

interface MusicPreviewProps {
  element: MusicBlockElement;
}

const MusicPreview = (props: MusicPreviewProps) => {
  const { element } = props;

  const pathname = usePathname();

  const audioRef = useRef<HTMLAudioElement>(null);

  const url = useMemo(() => {
    console.log(pathname);
    if (pathname === '/note' || !pathname.includes('/note/')) {
      return '';
    }
    return element.url;
  }, [element.url, pathname]);

  /************************************************
   * ✨ 封面
   ************************************************/

  const coverUrl = useMemo(() => {
    return getRandomRgbDataURL();
  }, []);

  /************************************************
   * ✨ 音量
   ************************************************/

  const [volume, setVolume] = useState(0.1);

  const isMute = useMemo(() => {
    return volume === 0;
  }, [volume]);

  const handleVolumeChange = useCallback(() => {
    if (volume === 0) {
      setVolume(0.1);
    } else {
      setVolume(0);
    }
  }, [volume]);

  useEffect(() => {
    const audioDOM = audioRef.current;
    if (!audioDOM) return;
    audioDOM.volume = volume;
  }, [volume]);

  /************************************************
   * ✨ 时间
   ************************************************/

  const [duration, setDuration] = useState(0);

  const [currentTime, setCurrentTime] = useState(0);

  const currentTimeStr = useMemo(() => {
    return dayjs.duration(currentTime, 'second').format('mm:ss');
  }, [currentTime]);

  const durationStr = useMemo(() => {
    return dayjs.duration(duration, 'second').format('mm:ss');
  }, [duration]);

  const handleLoadedMetadata = useCallback(() => {
    const audioDOM = audioRef.current;
    if (!audioDOM) return;
    audioDOM.volume = 0.1;
    setDuration(audioDOM.duration);
  }, []);

  useEffect(() => {
    const audioDOM = audioRef.current;
    if (!audioDOM) return;
    audioDOM.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audioDOM.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [handleLoadedMetadata]);

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (currentTime === duration) {
      setIsPlaying(false);
    }
  }, [currentTime, duration]);

  const handleTimeUpdate = useCallback(() => {
    const audioDOM = audioRef.current;
    if (!audioDOM) return;
    setCurrentTime(audioDOM.currentTime);
  }, []);

  const handlePlayPause = useCallback(() => {
    const audioDOM = audioRef.current;
    if (!audioDOM) return;
    setIsPlaying(!isPlaying);
    if (isPlaying) {
      audioDOM.pause();
    } else {
      audioDOM.play();
    }
  }, [isPlaying]);

  const sliderBarRef = useRef<HTMLDivElement>(null);

  const sliderRef = useRef<HTMLDivElement>(null);

  const [isMouseDown, setIsMouseDown] = useState(false);

  const [mouseLeft, setMouseLeft] = useState(0);

  const sliderLeft = useMemo(() => {
    const defaultLeft = currentTime / duration;
    if (isMouseDown) {
      const sliderBarDOM = sliderBarRef.current;
      if (!sliderBarDOM) return defaultLeft;
      const { left, width } = sliderBarDOM.getBoundingClientRect();
      const nextLeft = (mouseLeft - left) / width;
      return nextLeft < 0 ? 0 : nextLeft > 1 ? 1 : nextLeft;
    }
    return defaultLeft;
  }, [currentTime, duration, isMouseDown, mouseLeft]);

  const sliderLeftStr = useMemo(() => {
    return `${sliderLeft * 100}%`;
  }, [sliderLeft]);

  const handleSliderMouseDown = useCallback(() => {
    setIsMouseDown(true);
  }, []);

  const handleSliderMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isMouseDown) return;
      requestAnimationFrame(() => {
        setMouseLeft(e.clientX);
      });
    },
    [isMouseDown]
  );

  const handleSliderMouseUp = useCallback(() => {
    if (!isMouseDown) return;
    setIsMouseDown(false);
    const audioDOM = audioRef.current;
    if (!audioDOM) return;
    setIsPlaying(true);
    audioDOM.play();
    setCurrentTime(sliderLeft * duration);
    audioDOM.currentTime = sliderLeft * duration;
  }, [duration, isMouseDown, sliderLeft]);

  useEffect(() => {
    const sliderDOM = sliderRef.current;
    if (!sliderDOM) return;
    window.addEventListener('mousemove', handleSliderMouseMove);
    window.addEventListener('mouseup', handleSliderMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleSliderMouseMove);
      window.removeEventListener('mouseup', handleSliderMouseUp);
    };
  }, [handleSliderMouseDown, handleSliderMouseMove, handleSliderMouseUp]);

  return (
    <>
      {/* 左侧 */}
      <div className=' relative flex h-16 w-16 flex-shrink-0 items-center justify-center'>
        <button className=' z-10' onClick={handlePlayPause}>
          <span
            className={clsx(
              'iconfont text-white shadow-sm',
              isPlaying ? 'icon-pause-filled' : 'icon-play-filled'
            )}></span>
        </button>
        <Image
          className=' absolute inset-0'
          src={coverUrl}
          width={64}
          height={64}
          alt='音乐封面'
        />
      </div>
      {/* 右侧 */}
      <div className='flex flex-1 flex-col gap-2 overflow-hidden p-2'>
        <audio
          ref={audioRef}
          controls={false}
          autoPlay={false}
          onTimeUpdate={handleTimeUpdate}
          src={url}></audio>
        <div className='flex flex-col gap-1'>
          {/* info */}
          <div className='flex w-full items-center justify-between gap-4'>
            <span className=' truncate text-13 font-semibold text-black-500'>
              {element.title}
            </span>
            <button className=' flex-shrink-0' onClick={handleVolumeChange}>
              <span
                className={clsx(
                  'iconfont text-black-250',
                  isMute ? 'icon-volume-silent-filled' : 'icon-volume-filled'
                )}></span>
            </button>
          </div>
          {/* progress */}
          <div className='flex w-full items-center gap-2 text-xs text-black-250'>
            <span>{currentTimeStr}</span>
            <div className='relative flex-1'>
              <div
                ref={sliderBarRef}
                className=' h-[2px] flex-1 rounded-sm bg-black-50'></div>
              <div
                ref={sliderRef}
                className=' absolute top-[1px] h-2 w-2 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-primary-50 hover:h-3 hover:w-3'
                style={{
                  left: sliderLeftStr,
                }}
                onMouseDown={handleSliderMouseDown}></div>
            </div>
            <span>{durationStr}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default MusicPreview;
