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
import DraftTip from './components/DraftTip';
import { NotificationType } from '../Notification/components/Notification';
import { useNotificationUtilsStore } from '@/lib/stores';

export interface EditorRef {
  getEditor: () => EditorInstance;
}

interface EditorProps {
  className?: string;
  initialValue?: Descendant[];
  onChange?: (value: Descendant[]) => void;
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
  } = props;

  const { utils: notificationUtils } = useNotificationUtilsStore();

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
      setIsSaved(false);
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

  const [isSaved, setIsSaved] = useState(false);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 's' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        const draft = editor.children;
        localStorage.setItem('note-draft', JSON.stringify(draft));
        setIsSaved(true);
        notificationUtils?.open({
          type: NotificationType.SUCCESS,
          content: '保存成功',
          duration: 3,
        });
      }
    },
    [editor.children, notificationUtils]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  /************************************************
   * ✨ 草稿
   ************************************************/

  const hasDraft = useMemo(() => {
    const draft = localStorage.getItem('note-draft');
    return draft && JSON.parse(draft).length > 0;
  }, []);

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
              {/* 草稿 */}
              {hasDraft ? <DraftTip /> : null}
              {/* 工具栏 */}
              <Toolbar
                className='z-10 bg-gray-100'
                fullScreen={fullScreen}
                onChangeFullScreen={handleFullScreen}
              />
              {/* 编辑器 */}
              <div className='flex flex-1 flex-col overflow-auto bg-gray-100 sm:py-10'>
                <Editor className='mx-auto h-fit max-w-[45rem] overflow-y-hidden border-2 border-dashed border-black-50 p-6' />
                {/* 保存状态 */}
                <div className='mx-auto flex h-8 w-full max-w-[45rem] items-center justify-end gap-1'>
                  <div
                    className={clsx(
                      'h-1 w-1 rounded-full',
                      isSaved ? 'bg-green-500' : 'bg-black-400'
                    )}></div>
                  <span className='text-xs text-black-600'>
                    {isSaved ? '已保存' : '未保存'}
                  </span>
                </div>
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
            {/* 草稿 */}
            {hasDraft ? <DraftTip /> : null}
            {/* 工具栏 */}
            <Toolbar
              fullScreen={fullScreen}
              onChangeFullScreen={handleFullScreen}
            />
            {/* 编辑器 */}
            <Editor className='p-6' />
            {/* 保存状态 */}
            <div className='flex items-center justify-end gap-1 px-6'>
              <div
                className={clsx(
                  'h-1 w-1 rounded-full',
                  isSaved ? 'bg-green-500' : 'bg-black-400'
                )}></div>
              <span className='text-xs text-black-600'>
                {isSaved ? '已保存' : '未保存'}
              </span>
            </div>
          </div>
        )}
      </SlateProvider>
    </DndProvider>
  );
});

RichEditor.displayName = 'RichEditor';

export default RichEditor;
