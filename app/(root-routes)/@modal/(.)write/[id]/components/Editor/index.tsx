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
import { withHistory } from 'slate-history';
import { createPortal } from 'react-dom';
import {
  disableScrollbar,
  enableScrollbar,
} from '@/lib/utils/scrollbarTrigger';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { RichEditor as EditorInstance } from 'types/slate';
import { useNotificationUtilsStore } from '@/lib/stores';
import { NotificationType } from '@/ui/Notification/components/Notification';
import TOC from '@/ui/TOC';
import { BlockElementType } from '@/lib/constants';
import {
  withInlines,
  withPasteMarkdown,
  withShortcuts,
  withVoids,
} from '@/ui/RichEditor/utils';
import Toolbar from '@/ui/RichEditor/components/Toolbar';
import RichEditor from '@/ui/RichEditor';
import DraftTip from '@/ui/RichEditor/components/DraftTip';
import FullScreenButton from '@/ui/FullScreenButton';
import Button from '@/ui/Button';

export interface EditorRef {
  getEditor: () => EditorInstance;
}

interface EditorProps {
  initialValue?: Descendant[];
  onPublish: () => void;
  onChange?: (value: Descendant[]) => void;
}

const Editor = forwardRef<EditorRef, EditorProps>((props, ref) => {
  const {
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
    onPublish,
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

  /************************************************
   * ✨ 发布
   ************************************************/

  const handlePublish = useCallback(() => {
    setFullScreen(false);
    onPublish();
  }, [onPublish]);

  return (
    <DndProvider backend={HTML5Backend}>
      <SlateProvider
        editor={editor}
        initialValue={initialValue}
        onChange={handleContentChange}>
        {fullScreen ? (
          createPortal(
            <div
              className='fixed inset-0 z-50 flex gap-8 overflow-auto bg-gray-200'
              ref={containerRef}>
              <div className='flex h-fit min-h-screen w-full flex-col bg-gray-100'>
                {/* 工具栏 */}
                <Toolbar
                  className='z-10 bg-gray-100'
                  RightSlot={
                    <div className='flex gap-2'>
                      <FullScreenButton
                        fullScreen={fullScreen}
                        onChangeFullScreen={handleFullScreen}
                      />
                      <div className='flex h-full flex-shrink-0 items-center gap-2 border-l border-gray-50 pl-2'>
                        <Button
                          className='relative mx-4 rounded-xl text-17 font-bold hover:text-primary-50'
                          onClick={handlePublish}>
                          发布笔记
                        </Button>
                      </div>
                    </div>
                  }
                />
                {/* 草稿 */}
                {hasDraft ? (
                  <DraftTip calssName='z-10 top-12 backdrop-blur-xl' />
                ) : null}
                {/* 编辑区 */}
                <div className='z-0 flex flex-1 flex-col py-10'>
                  <RichEditor className='mx-auto max-w-[45rem] border-2 border-dashed border-black-50 p-6' />
                  {/* 保存状态 */}
                  <div className='fixed bottom-0 h-8 w-full backdrop-blur-xl'>
                    <div className='mx-auto flex h-full max-w-[45rem] items-center justify-end gap-1'>
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
                </div>
              </div>
              <TOC className='fixed right-6 top-32 hidden h-fit shrink-0 lg:flex' />
            </div>,
            document.body
          )
        ) : (
          <div className='relative flex max-h-[70vh] flex-1 flex-col overflow-hidden'>
            {/* 工具栏 */}
            <Toolbar
              RightSlot={
                <FullScreenButton
                  fullScreen={fullScreen}
                  onChangeFullScreen={handleFullScreen}
                />
              }
            />
            {/* 草稿 */}
            {hasDraft ? <DraftTip /> : null}
            {/* 编辑器 */}
            <RichEditor className='p-6' />
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

Editor.displayName = 'Editor';

export default Editor;
