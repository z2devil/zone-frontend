'use client';

import { Modal } from '@/ui/Modal';
import { MotionList } from '@/ui/Motion';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import style from './style.module.scss';
import { ModalInfo } from '@/ui/Modal/hooks/useModal';
import NotePublish, { NoteOptions } from '@/ui/NotePublish';
import { useNotificationUtilsStore } from '@/lib/stores';
import { NotificationType } from '@/ui/Notification/components/Notification';
import { postNoteAPI, putNoteAPI } from '@/lib/api/notes';
import useRequest from '@/lib/hooks/useRequest';
import { useNotesStore } from '@/lib/stores/notes';
import { createEditor, Descendant, Node } from 'slate';
import Editor from './components/Editor';
import { DndProvider } from 'react-dnd';
import { Slate as SlateProvider, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { withPasteMarkdown, withShortcuts } from '@/ui/RichEditor/plugins';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { withPluginSetup } from '@/ui/RichEditor/plugins';
import {
  disableScrollbar,
  enableScrollbar,
} from '@/lib/utils/scrollbarTrigger';
import { useNoteLoader } from '@/ui/NoteEditor/useNoteLoader';
import NoteLoadError from '@/ui/NoteEditor/NoteLoadError';
import { useNoteEditState } from '@/ui/NoteEditor/useNoteEditState';
import { removeNoteDraft } from '@/lib/note-draft';

interface NoteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function WriteNote(props: NoteDetailPageProps) {
  const params = use(props.params);

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

  const navigation = useRouter();

  const [request] = useRequest();

  const { utils: notificationUtils } = useNotificationUtilsStore();

  const { notes, setNotes } = useNotesStore();

  const [step, setStep] = useState(0);

  const { contentRef, handleChange, handleBack, isSaved } = useNoteEditState({
    editor,
    noteId: id,
    initialContent,
    step,
    setStep,
  });

  useEffect(() => {
    disableScrollbar();
    return () => {
      enableScrollbar();
    };
  }, []);

  /************************************************
   * ✨ 第一步 - 编辑笔记
   ************************************************/

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
    [
      contentRef,
      id,
      isCreate,
      navigation,
      notes,
      notificationUtils,
      request,
      setNotes,
    ]
  );

  const modals = useMemo<ModalInfo[]>(() => {
    return [
      step === 0 && {
        key: '0',
        options: {
          uuid: 'edit',
          keepAlive: true,
          closable: true,
          title: isCreate ? '发布笔记' : '编辑笔记',
          okText: isCreate ? '发布' : '保存并发布',
          onOk: handleToConfig,
          children: (
            <div className='mb-6'>
              {/* 编辑器 */}
              <Editor
                isSaved={isSaved}
                noteId={id}
                onPublish={handleToConfig}
              />
            </div>
          ),
        },
      },
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
  }, [handlePublish, handleToConfig, id, isCreate, isSaved, step]);

  return (
    <DndProvider backend={HTML5Backend}>
      <SlateProvider
        editor={editor}
        initialValue={initialContent}
        onChange={handleChange}>
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
