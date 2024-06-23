import dynamic from 'next/dynamic';
import { WhiteBoardBlockElement } from 'types/slate';
import style from './style.module.scss';
import clsx from 'clsx';
import {
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from '@excalidraw/excalidraw/types/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import { Transforms } from 'slate';
import { ReactEditor, useSelected, useSlateStatic } from 'slate-react';

interface WhiteBoardProps {
  element: WhiteBoardBlockElement;
  readOnly?: boolean;
}

const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  {
    loading: () => (
      <div className='flex h-full w-full items-center justify-center'>
        <div className='flex items-center gap-1'>
          <span className='iconfont icon-spinner animate-spin font-semibold'></span>
          <span>加载中...</span>
        </div>
      </div>
    ),
    ssr: false,
  }
);

const isElementsEqual = (
  prevElements: readonly ExcalidrawElement[],
  nextElements: readonly ExcalidrawElement[]
) => {
  if (prevElements.length !== nextElements.length) return false;
  return prevElements.every((prevElement, index) => {
    const nextElement = nextElements[index];
    return prevElement.updated === nextElement.updated;
  });
};

const WhiteBoard = (props: WhiteBoardProps) => {
  const { element, readOnly } = props;

  const editor = useSlateStatic();

  const selected = useSelected();

  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  const initialData = useMemo<ExcalidrawInitialDataState>(
    () => ({
      // scrollToContent: true,
      elements: element.elements,
    }),
    [element.elements]
  );

  useEffect(() => {
    console.log('[ refresh ]', readOnly, selected, excalidrawAPI?.refresh);
    if (readOnly || !selected) return;
    requestAnimationFrame(() => excalidrawAPI?.refresh());
  }, [excalidrawAPI, readOnly, selected]);

  const latestElementsRef = useRef<readonly ExcalidrawElement[]>([]);

  const handleChange = useCallback(
    (
      elements: readonly ExcalidrawElement[]
      // appState: AppState
      // files: BinaryFiles
    ) => {
      const elementsClone = structuredClone(elements);
      if (isElementsEqual(latestElementsRef.current, elementsClone)) return;
      latestElementsRef.current = elementsClone;
      console.log('[ 更新 ]', elementsClone);
      Transforms.setNodes(
        editor,
        {
          elements: elementsClone as ExcalidrawElement[],
        },
        { at: ReactEditor.findPath(editor, element) }
      );
    },
    [editor, element]
  );

  useEffect(() => {
    if (!readOnly) return;
    if (!initialData.elements) return;
    excalidrawAPI?.scrollToContent(initialData.elements, {
      fitToViewport: true,
      viewportZoomFactor: 0.9,
    });
  }, [excalidrawAPI, initialData.elements, readOnly]);

  return (
    <div
      className={clsx(
        'relative flex h-full w-full',
        style.excalidraw,
        readOnly ? style.readOnly : undefined
      )}>
      <Excalidraw
        gridModeEnabled
        zenModeEnabled
        excalidrawAPI={(api: ExcalidrawImperativeAPI) => setExcalidrawAPI(api)}
        initialData={initialData}
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: false,
            export: false as const,
            toggleTheme: false,
          },
        }}
        viewModeEnabled={readOnly}
        onChange={handleChange}
      />
    </div>
  );
};

export default WhiteBoard;
