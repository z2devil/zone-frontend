'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Toolbar from '@/ui/RichEditor/components/Toolbar';
import RichEditor from '@/ui/RichEditor';
import DraftTip from '@/ui/RichEditor/components/DraftTip';
import TOC from '@/ui/TOC';
import clsx from 'clsx';
import { Modal } from '@/ui/Modal';
import { MotionList } from '@/ui/Motion';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import style from './style.module.scss';
import { ModalInfo } from '@/ui/Modal/hooks/useModal';
import NotePublish, { NoteOptions } from '@/ui/NotePublish';
import { useModalUtilsStore, useNotificationUtilsStore } from '@/lib/stores';
import { NotificationType } from '@/ui/Notification/components/Notification';
import { postNoteAPI, putNoteAPI } from '@/lib/api/notes';
import useRequest from '@/lib/hooks/useRequest';
import { useNotesStore } from '@/lib/stores/notes';
import { createEditor, Descendant, Node } from 'slate';
import { Slate as SlateProvider, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import {
  withPasteMarkdown,
  withShortcuts,
  withPluginSetup,
} from '@/ui/RichEditor/plugins';
import Button from '@/ui/Button';
import { removeNoteDraft, saveNoteDraft } from '@/lib/note-draft';
import { useNoteLoader } from '@/ui/NoteEditor/useNoteLoader';
import NoteLoadError from '@/ui/NoteEditor/NoteLoadError';

interface NoteDetailPageProps {
  params: { id: string };
}

export default function WriteNote(props: NoteDetailPageProps) {
  const { params } = props;

  const navigation = useRouter();

  const { status, content, options, isCreate, retry } = useNoteLoader(
    params.id
  );

  if (status === 'loading') return null;

  if (status === 'error') {
    return <NoteLoadError onBack={navigation.back} onRetry={retry} />;
  }

  return (
    <WriteNoteEditor
      id={params.id}
      initialContent={content}
      initialOptions={options}
      isCreate={isCreate}
    />
  );
}

interface WriteNoteEditorProps {
  id: string;
  isCreate: boolean;
  initialContent: Descendant[];
  initialOptions: NoteOptions;
}

function WriteNoteEditor(props: WriteNoteEditorProps) {
  const { id, isCreate, initialContent, initialOptions } = props;

  const navigation = useRouter();

  const [request] = useRequest();

  const { utils: notificationUtils } = useNotificationUtilsStore();

  const { utils: modalUtils } = useModalUtilsStore();

  const { notes, setNotes } = useNotesStore();

  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useMemo(() => {
    const enhancers = [
      withReact,
      withHistory,
      withShortcuts,
      withPasteMarkdown,
      withPluginSetup,
    ];
    return enhancers.reduce(
      (editor, enhancer) => enhancer(editor),
      createEditor()
    );
  }, []);

  const [step, setStep] = useState(0);

  const handleBack = useCallback(() => {
    if (step === 0) {
      const uuid = modalUtils?.open({
        title: '退出编辑',
        children: '确定退出编辑吗？',
        okText: '确定',
        onOk: () => {
          modalUtils?.close(uuid);
          setStep(step - 1);
          if (step > 0) return;
          setTimeout(() => {
            navigation.back();
          }, 400);
        },
        cancelText: '取消',
        onCancel: () => {
          modalUtils?.close(uuid);
        },
      });
    } else {
      setStep(step - 1);
      if (step > 0) return;
      setTimeout(() => {
        navigation.back();
      }, 400);
    }
  }, [modalUtils, navigation, step]);

  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (Node.string(editor)) {
        e.preventDefault();
      }
    },
    [editor]
  );

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [editor, handleBeforeUnload]);

  /************************************************
   * ✨ 保存
   ************************************************/

  const [isSaved, setIsSaved] = useState(false);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 's' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        saveNoteDraft(id, editor.children);
        setIsSaved(true);
        notificationUtils?.open({
          type: NotificationType.SUCCESS,
          content: '保存成功',
          duration: 3,
        });
      }
    },
    [editor, id, notificationUtils]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  /************************************************
   * ✨ 第一步 - 编辑笔记
   ************************************************/

  const contentRef = useRef<Descendant[]>(initialContent);

  const handleContentChange = useCallback((content: Descendant[]) => {
    contentRef.current = content;
  }, []);

  const handleToConfig = useCallback(() => {
    if (
      editor.children.length === 1 &&
      editor.children[0].type === 'paragraph' &&
      Node.string(editor) === ''
    ) {
      notificationUtils?.open({
        type: NotificationType.WARNING,
        content: '内容不能为空',
        duration: 3,
      });
      return;
    }
    setStep(1);
  }, [editor, notificationUtils]);

  /************************************************
   * ✨ 第二步 - 发布笔记
   ************************************************/

  const optionsRef = useRef<NoteOptions>(initialOptions);

  const handlePublish = useCallback(
    async (res: NoteOptions) => {
      try {
        const data = {
          title: res.title,
          content: JSON.stringify(contentRef.current),
          bannerPath: res.bannerPath,
          tags: res.tags,
          visibility: res.visibility,
        };
        if (isCreate) {
          const nextNote = await postNoteAPI(request)(data);
          setNotes([nextNote, ...notes]);
        } else {
          const nextNote = await putNoteAPI(request)({
            ...data,
            _id: id,
          });
          setNotes(notes.map(note => (note._id === id ? nextNote : note)));
        }
        removeNoteDraft(id);
        setStep(2);
        notificationUtils?.open({
          type: NotificationType.SUCCESS,
          content: '发布成功',
          duration: 3,
        });
        setTimeout(() => {
          navigation.back();
        }, 400);
      } catch (error: any) {
        notificationUtils?.open({
          type: NotificationType.WARNING,
          content: error.message,
          duration: 3,
        });
      }
    },
    [isCreate, navigation, notes, notificationUtils, id, request, setNotes]
  );

  const modals = useMemo<ModalInfo[]>(() => {
    return [
      step === 1 && {
        key: '1',
        options: {
          uuid: 'config',
          keepAlive: true,
          closable: true,
          title: '笔记配置',
          children: (
            <NotePublish
              options={optionsRef.current}
              onPublish={handlePublish}
            />
          ),
        },
      },
    ].filter(Boolean) as ModalInfo[];
  }, [handlePublish, step]);

  return (
    <DndProvider backend={HTML5Backend}>
      <SlateProvider
        editor={editor}
        initialValue={contentRef.current}
        onChange={handleContentChange}>
        {/* 主要内容 */}
        <div className='flex gap-8' ref={containerRef}>
          <div className='min-h-screen w-full flex-col bg-white'>
            {/* 工具栏 */}
            <Toolbar
              className='z-10'
              RightSlot={
                <div className='flex h-full flex-shrink-0 items-center gap-2 border-l border-gray-50 pl-2'>
                  <Button
                    className='relative ml-4 mr-1 rounded-xl text-17 font-bold hover:text-primary-50'
                    onClick={handleToConfig}>
                    发布笔记
                  </Button>
                </div>
              }
            />
            {/* 草稿 */}
            <DraftTip calssName='z-10 top-12 backdrop-blur-xl' noteId={id} />
            {/* 编辑区 */}
            <div className='z-0 flex flex-1 flex-col py-10'>
              <RichEditor className='mx-auto max-w-[45rem]' />
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
            <TOC className='fixed right-6 top-32 hidden h-fit shrink-0 lg:flex' />
          </div>
        </div>
        {/* 弹窗 */}
        <div
          className='fixed left-0 top-0 z-20 flex h-full w-full flex-col items-center justify-center'
          style={{
            pointerEvents: 'none',
          }}>
          {/* mask */}
          {
            <div
              className={clsx(
                'absolute left-0 top-0 h-full w-full duration-500 max-sm:bg-white max-sm:bg-opacity-20 max-sm:backdrop-blur-3xl sm:bg-black-100',
                modals.length > 0
                  ? 'pointer-events-auto opacity-100 delay-200'
                  : 'pointer-events-none opacity-0 delay-200'
              )}
              onClick={handleBack}></div>
          }
          {/* modal */}
          <MotionList keys={modals} transitionDuration={0.4}>
            {info => {
              const { options, enterIn, leaveOut } = info;
              return (
                <Modal
                  {...options}
                  key={options.key}
                  outterCalssName={clsx(
                    'sm:w-[640px]',
                    enterIn && style.enterIn,
                    leaveOut && style.leaveOut
                  )}
                  outterStyle={{
                    ...info.style,
                    display: info.visible ? 'block' : 'none',
                  }}
                  onClose={handleBack}
                />
              );
            }}
          </MotionList>
        </div>
      </SlateProvider>
    </DndProvider>
  );
}
