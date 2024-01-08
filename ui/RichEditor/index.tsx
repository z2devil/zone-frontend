'use client';

import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import { Descendant, createEditor } from 'slate';
import { Slate as SlateProvider, withReact } from 'slate-react';
import Toolbar from './components/Toolbar';
import { withShortcuts, withVoids, withInlines } from './utils';
import { withHistory } from 'slate-history';
import { BlockElementType } from './constans';
import Editor from './components/Editor';
import { twMerge } from 'tailwind-merge';
import { createPortal } from 'react-dom';
import {
  disableScrollbar,
  enableScrollbar,
} from '@/lib/utils/scrollbarTrigger';

interface EditorProps {
  className?: string;
  initialValue?: Descendant[];
  onChange?: (value: Descendant[]) => void;
}
const RichEditor = (props: EditorProps) => {
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
  } = props;

  const editor = useMemo(() => {
    const enhancers = [
      withReact,
      withHistory,
      withInlines,
      withVoids,
      withShortcuts,
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

  return (
    <SlateProvider
      editor={editor}
      initialValue={initialValue}
      onChange={handleContentChange}>
      {fullScreen ? (
        createPortal(
          <div
            className={clsx(
              twMerge(
                ' fixed inset-0 z-50 flex flex-col overflow-hidden bg-gray-200',
                className,
                'min-h-screen'
              )
            )}>
            <Toolbar
              className='z-10 bg-gray-100'
              fullScreen={fullScreen}
              onChangeFullScreen={handleFullScreen}
            />
            <div className='flex flex-1 overflow-auto bg-gray-100 sm:py-10'>
              <Editor className='mx-auto h-fit max-w-[45rem] overflow-y-hidden p-6' />
            </div>
          </div>,
          document.body
        )
      ) : (
        <div
          className={clsx(
            twMerge(' relative flex flex-1 flex-col overflow-hidden', className)
          )}>
          <Toolbar
            fullScreen={fullScreen}
            onChangeFullScreen={handleFullScreen}
          />
          <Editor className='p-6' />
        </div>
      )}
    </SlateProvider>
  );
};

export default RichEditor;
