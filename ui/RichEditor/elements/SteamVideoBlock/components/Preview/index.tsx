import Image from 'next/image';
import { useEffect, useMemo, useRef } from 'react';
import { SteamVideoBlockElement } from 'types/slate';
import { useSlate } from 'slate-react';

interface SteamVideoPreviewProps {
  element: SteamVideoBlockElement;
}

const SteamVideoPreview = (props: SteamVideoPreviewProps) => {
  const { element } = props;

  const editor = useSlate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);

  const isSummary = useMemo(() => {
    return editor.isSummary;
  }, [editor.isSummary]);

  const hlsUrl = useMemo(() => element.hlsUrl, [element.hlsUrl]);
  const thumbnailUrl = useMemo(
    () => element.thumbnailUrl,
    [element.thumbnailUrl]
  );
  const title = useMemo(() => element.title, [element.title]);

  useEffect(() => {
    if (!hlsUrl || !videoRef.current || isSummary) return;

    const video = videoRef.current;

    const loadVideo = async () => {
      // Check if browser supports HLS natively (Safari)
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
      } else {
        // Use hls.js for other browsers
        const Hls = (await import('hls.js')).default;

        if (Hls.isSupported()) {
          const hls = new Hls();
          hlsRef.current = hls;
          hls.loadSource(hlsUrl);
          hls.attachMedia(video);
        }
      }
    };

    loadVideo();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [hlsUrl, isSummary]);

  if (!hlsUrl) {
    return (
      <div className='flex aspect-video w-full items-center justify-center bg-gray-100'>
        <span className='text-sm text-gray-400'>No video configured</span>
      </div>
    );
  }

  return (
    <div className='w-full'>
      {isSummary && thumbnailUrl ? (
        <Image
          alt={title || 'Steam video'}
          className='aspect-video w-full rounded object-cover'
          height={360}
          src={thumbnailUrl}
          width={640}
        />
      ) : (
        <div className='bg-black aspect-video w-full overflow-hidden rounded'>
          <video
            controls
            playsInline
            className='h-full w-full'
            ref={videoRef}
          />
        </div>
      )}
      {title && <div className='mt-1 text-xs text-gray-500'>{title}</div>}
    </div>
  );
};

export default SteamVideoPreview;
