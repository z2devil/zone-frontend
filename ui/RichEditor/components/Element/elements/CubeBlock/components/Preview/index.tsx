import { useEffect, useMemo, useRef } from 'react';
import { CubeBlockElement } from 'types/slate';
import { Application } from '@splinetool/runtime';

interface CubePreviewProps {
  element: CubeBlockElement;
}

const CubePreview = (props: CubePreviewProps) => {
  const { element } = props;

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
      <canvas ref={canvasRef} className='aspect-video h-full w-full'></canvas>
    </>
  );
};

export default CubePreview;
