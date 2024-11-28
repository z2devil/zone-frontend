import { useCallback, useEffect, useMemo, useRef } from 'react';
import { CubeBlockElement } from 'types/slate';
import { Application } from '@splinetool/runtime';
import { ReactEditor, useSlate } from 'slate-react';
import { Transforms } from 'slate';

interface CubeEditProps {
  element: CubeBlockElement;
}

const CubeEdit = (props: CubeEditProps) => {
  const { element } = props;

  const editor = useSlate();

  const url = useMemo(() => element.url, [element.url]);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value;
      Transforms.setNodes(
        editor,
        { url },
        { at: ReactEditor.findPath(editor, element) }
      );
    },
    [editor, element]
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !url) return;
    const app = new Application(canvas);
    app.load(url);
  }, [url]);

  return (
    <div className='flex w-full flex-col gap-4'>
      <input defaultValue={url} onInput={handleInput}></input>
      <canvas className='aspect-video h-full w-full' ref={canvasRef}></canvas>
    </div>
  );
};

export default CubeEdit;
