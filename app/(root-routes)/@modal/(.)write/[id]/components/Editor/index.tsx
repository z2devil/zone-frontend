'use client';

import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNotificationUtilsStore } from '@/lib/stores';
import { NotificationType } from '@/ui/Notification/components/Notification';
import TOC from '@/ui/TOC';
import Toolbar from '@/ui/RichEditor/components/Toolbar';
import RichEditor from '@/ui/RichEditor';
import DraftTip from '@/ui/RichEditor/components/DraftTip';
import FullScreenButton from '@/ui/FullScreenButton';
import Button from '@/ui/Button';
import { useSlate } from 'slate-react';

interface EditorProps {
  onPublish: () => void;
}

const Editor = (props: EditorProps) => {
  const { onPublish } = props;

  const editor = useSlate();

  const { utils: notificationUtils } = useNotificationUtilsStore();

  const containerRef = useRef<HTMLDivElement>(null);

  const [fullScreen, setFullScreen] = useState(false);

  const handleFullScreen = useCallback((nextFullScreen: boolean) => {
    setFullScreen(nextFullScreen);
  }, []);

  /************************************************
   * ✨ 保存
   ************************************************/

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const { onChange } = editor;
    editor.onChange = () => {
      onChange();
      setIsSaved(false);
    };
  }, [editor]);

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
    handleFullScreen(false);
    onPublish();
  }, [handleFullScreen, onPublish]);

  return (
    <>
      {fullScreen ? (
        createPortal(
          <div
            className='fixed inset-0 z-50 flex gap-8 overflow-y-auto overflow-x-hidden'
            ref={containerRef}>
            <div className='flex h-fit min-h-screen w-full flex-col bg-white'>
              {/* 工具栏 */}
              <Toolbar
                className='z-10'
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
              <div className='z-0 flex flex-1 flex-col'>
                <RichEditor className='mx-auto max-w-[45rem] py-10' />
                {/* 保存状态 */}
                <div className='sticky bottom-0 h-8 w-full backdrop-blur-xl'>
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
              <TOC className='fixed right-10 top-32 hidden h-fit shrink-0 lg:flex' />
            </div>
          </div>,
          document.body
        )
      ) : (
        <div className='relative z-0 flex max-h-[70vh] flex-1 flex-col overflow-y-auto overflow-x-hidden'>
          {/* 工具栏 */}
          <Toolbar
            className='z-10 backdrop-blur-xl'
            RightSlot={
              <FullScreenButton
                fullScreen={fullScreen}
                onChangeFullScreen={handleFullScreen}
              />
            }
          />
          {/* 草稿 */}
          {hasDraft ? (
            <DraftTip calssName='z-10 top-12 backdrop-blur-xl' />
          ) : null}
          {/* 编辑器 */}
          <div className='flex flex-1 flex-col'>
            <RichEditor className='p-6' />
            {/* 保存状态 */}
            <div className='sticky bottom-0 flex h-8 items-center justify-end gap-1 px-6 backdrop-blur-xl'>
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
      )}
    </>
  );
};

export default Editor;
