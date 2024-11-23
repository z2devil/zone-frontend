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
import { notFound, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import style from './style.module.scss';
import { ModalInfo } from '@/ui/Modal/hooks/useModal';
import NotePublish, { NoteOptions } from '@/ui/NotePublish';
import { useModalUtilsStore, useNotificationUtilsStore } from '@/lib/stores';
import { NotificationType } from '@/ui/Notification/components/Notification';
import {
  NoteTypeEnum,
  getNoteAPI,
  postNoteAPI,
  putNoteAPI,
} from '@/lib/api/notes';
import useRequest from '@/lib/hooks/useRequest';
import { useNotesStore } from '@/lib/stores/notes';
import { createEditor, Descendant, Element, Node, Transforms } from 'slate';
import { Slate as SlateProvider, withReact } from 'slate-react';
import { useMount } from 'react-use';
import { getContentSummary } from '@/lib/utils/editor';
import { BlockElementType } from '@/lib/constants';
import { withHistory } from 'slate-history';
import {
  withInlines,
  withPasteMarkdown,
  withShortcuts,
  withVoids,
} from '@/ui/RichEditor/utils';
import Button from '@/ui/Button';

interface NoteDetailPageProps {
  params: { id: string };
}

export default function WriteNote(props: NoteDetailPageProps) {
  const { params } = props;

  const isCreate = useMemo(() => params.id === 'new', [params.id]);

  const navagation = useRouter();

  const [request] = useRequest();

  const { utils: notificationUtils } = useNotificationUtilsStore();

  const { utils: modalUtils } = useModalUtilsStore();

  const { notes, setNotes } = useNotesStore();

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
            navagation.back();
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
        navagation.back();
      }, 400);
    }
  }, [modalUtils, navagation, step]);

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
    const noteDraft = localStorage.getItem('note-draft');
    if (noteDraft) {
      const draft = JSON.parse(noteDraft);
      Transforms.removeNodes(editor, {
        at: [],
        match: node => Element.isElement(node),
      });
      Transforms.insertNodes(editor, draft);
    }
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
   * ✨ 初始化
   ************************************************/

  const [inited, setInited] = useState(false);

  const init = useCallback(async () => {
    if (isCreate) return setInited(true);
    try {
      const res = await getNoteAPI(request)(params.id);
      contentRef.current = JSON.parse(res.content);
      optionsRef.current = {
        title: res.title,
        type: res.type,
        bannerPath: res.bannerPath,
        tags: res.tags.map(tag => tag._id),
      };
    } catch (error) {
      return notFound();
    } finally {
      setInited(true);
    }
  }, [isCreate, params.id, request]);

  useMount(() => {
    init();
  });

  /************************************************
   * ✨ 第一步 - 编辑笔记
   ************************************************/

  const contentRef = useRef<Descendant[]>([
    {
      type: BlockElementType.PARAGRAPH,
      children: [
        {
          text: '',
        },
      ],
    },
  ]);

  const handleContentChange = useCallback((content: Descendant[]) => {
    contentRef.current = content;
  }, []);

  const handleToConfig = useCallback(() => {
    if (editor.string([]).length === 0) {
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

  const optionsRef = useRef<NoteOptions>({
    title: '',
    type: NoteTypeEnum.NOTE,
    bannerPath: '',
    tags: [],
  });

  const handlePublish = useCallback(
    async (res: NoteOptions) => {
      console.log('[ handlePublish ]', res);
      try {
        const data = {
          type: res.type,
          title: res.title,
          content: JSON.stringify(contentRef.current),
          bannerPath: res.bannerPath,
          summary: getContentSummary(contentRef.current),
          tags: res.tags,
        };
        if (isCreate) {
          const nextNote = await postNoteAPI(request)(data);
          setNotes([nextNote, ...notes]);
        } else {
          const nextNote = await putNoteAPI(request)({
            ...data,
            _id: params.id,
          });
          setNotes(
            notes.map(note => (note._id === params.id ? nextNote : note))
          );
        }
        setStep(2);
        notificationUtils?.open({
          type: NotificationType.SUCCESS,
          content: '发布成功',
          duration: 3,
        });
        setTimeout(() => {
          navagation.back();
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
      isCreate,
      navagation,
      notes,
      notificationUtils,
      params.id,
      request,
      setNotes,
    ]
  );

  const modals = useMemo<ModalInfo[]>(() => {
    if (!inited) return [];
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
  }, [handlePublish, inited, step]);

  return (
    <DndProvider backend={HTML5Backend}>
      <SlateProvider
        editor={editor}
        initialValue={contentRef.current}
        onChange={handleContentChange}>
        {/* 主要内容 */}
        <div className='flex gap-8 bg-gray-200' ref={containerRef}>
          <div className='w-full flex-col bg-gray-100'>
            {/* 工具栏 */}
            <Toolbar
              className='z-10 bg-gray-100'
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
