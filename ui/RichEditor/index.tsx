'use client';

import clsx from 'clsx';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Descendant, createEditor } from 'slate';
import { Slate as SlateProvider, withReact } from 'slate-react';
import Toolbar from './components/Toolbar';
import {
  withShortcuts,
  withVoids,
  withInlines,
  withPasteMarkdown,
} from './utils';
import { withHistory } from 'slate-history';
import { BlockElementType } from './constants';
import Editor from './components/Editor';
import { twMerge } from 'tailwind-merge';
import { createPortal } from 'react-dom';
import {
  disableScrollbar,
  enableScrollbar,
} from '@/lib/utils/scrollbarTrigger';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { RichEditor as EditorInstance } from 'types/slate';

export interface EditorRef {
  getEditor: () => EditorInstance;
}

interface EditorProps {
  className?: string;
  initialValue?: Descendant[];
  onChange?: (value: Descendant[]) => void;
  onSaved?: () => void;
}

const RichEditor = forwardRef<EditorRef, EditorProps>((props, ref) => {
  const {
    className,
    initialValue = [
      {
        type: BlockElementType.PARAGRAPH,
        children: [
          {
            text: '',
          },
        ],
      },
    ],
    onChange,
    onSaved,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useMemo(() => {
    const enhancers = [
      withReact,
      withHistory,
      withInlines,
      withVoids,
      withShortcuts,
      withPasteMarkdown,
    ];
    return enhancers.reduce(
      (editor, enhancer) => enhancer(editor),
      createEditor()
    );
  }, []);

  const handleContentChange = useCallback(
    (value: Descendant[]) => {
      onChange?.(value);
    },
    [onChange]
  );

  const [fullScreen, setFullScreen] = useState(false);

  const handleFullScreen = useCallback((nextFullScreen: boolean) => {
    setFullScreen(nextFullScreen);
    if (nextFullScreen) {
      disableScrollbar();
    } else {
      enableScrollbar();
    }
  }, []);

  useImperativeHandle(ref, () => ({
    getEditor: () => editor,
  }));

  /************************************************
   * ✨ 保存
   ************************************************/

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 's' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onSaved?.();
      }
    },
    [onSaved]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, onSaved]);

  return (
    <DndProvider backend={HTML5Backend}>
      <SlateProvider
        editor={editor}
        initialValue={initialValue}
        onChange={handleContentChange}>
        {fullScreen ? (
          createPortal(
            <div
              className={clsx(
                twMerge(
                  'fixed inset-0 z-50 flex flex-col overflow-hidden bg-gray-200',
                  className,
                  'min-h-screen'
                )
              )}
              ref={containerRef}>
              <Toolbar
                className='z-10 bg-gray-100'
                fullScreen={fullScreen}
                onChangeFullScreen={handleFullScreen}
              />
              <div className='flex flex-1 overflow-auto bg-gray-100 sm:py-10'>
                <Editor className='mx-auto h-fit max-w-[45rem] overflow-y-hidden border-2 border-dashed border-black-50 p-6' />
              </div>
            </div>,
            document.body
          )
        ) : (
          <div
            className={clsx(
              twMerge(
                'relative flex flex-1 flex-col overflow-hidden',
                className
              )
            )}>
            <Toolbar
              fullScreen={fullScreen}
              onChangeFullScreen={handleFullScreen}
            />
            <Editor className='p-6' />
          </div>
        )}
      </SlateProvider>
    </DndProvider>
  );
});

RichEditor.displayName = 'RichEditor';

export default RichEditor;
