import { useEffect, useMemo, useRef } from 'react';
import { CubeBlockElement } from 'types/slate';
import { Application } from '@splinetool/runtime';
import Image from 'next/image';
import defaultImg from 'public/tip/default-img.png';
import { useSlate } from 'slate-react';

interface CubePreviewProps {
  element: CubeBlockElement;
}

const CubePreview = (props: CubePreviewProps) => {
  const { element } = props;

  const editor = useSlate();

  const isSummary = useMemo(() => {
    return editor.isSummary;
  }, [editor.isSummary]);

  const url = useMemo(() => element.url, [element.url]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !url) return;
    const app = new Application(canvas);
    app.load(url);
  }, [url]);

  return (
    <>
      {isSummary ? (
        <Image
          alt='placeholder'
          className='aspect-video w-full object-contain'
          src={defaultImg}
        />
      ) : (
        <canvas className='aspect-video w-full' ref={canvasRef}></canvas>
      )}
    </>
  );
};

export default CubePreview;
