'use client';

import { Modal } from '@/ui/Modal';
import { MotionList } from '@/ui/Motion';
import RichEditor, { EditorRef } from '@/ui/RichEditor';
import clsx from 'clsx';
import { notFound, useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef, useState } from 'react';
import style from './style.module.scss';
import { ModalInfo } from '@/ui/Modal/hooks/useModal';
import NotePublish, { NoteOptions } from '@/ui/NotePublish';
import { useNotificationUtilsStore } from '@/lib/stores';
import { NotificationType } from '@/ui/Notification/components/Notification';
import {
  NoteTypeEnum,
  getNoteAPI,
  postNoteAPI,
  putNoteAPI,
} from '@/lib/api/notes';
import useRequest from '@/lib/hooks/useRequest';
import { useNotesStore } from '@/lib/stores/notes';
import { Descendant } from 'slate';
import { BlockElementType } from '@/ui/RichEditor/constants';
import { useMount } from 'react-use';
import { getContentSummary } from '@/lib/utils/editor';

interface NoteDetailPageProps {
  params: { id: string };
}

export default function WriteNote(props: NoteDetailPageProps) {
  const { params } = props;

  const editorRef = useRef<EditorRef | null>(null);

  const isCreate = useMemo(() => params.id === 'new', [params.id]);

  const navagation = useRouter();

  const [request] = useRequest();

  const { utils: notificationUtils } = useNotificationUtilsStore();

  const { notes, setNotes } = useNotesStore();

  const [step, setStep] = useState(0);

  const handleBack = useCallback(() => {
    setStep(step - 1);
    if (step > 0) return;
    setTimeout(() => {
      navagation.back();
    }, 400);
  }, [navagation, step]);

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
    const editor = editorRef.current?.getEditor();
    if (editor && editor?.string([0]).length === 0) {
      notificationUtils?.open({
        type: NotificationType.WARNING,
        content: '内容不能为空',
        duration: 3,
      });
      return;
    }
    setStep(1);
  }, [notificationUtils]);

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
      step === 0 && {
        key: 0,
        options: {
          uuid: 'edit',
          keepAlive: true,
          closable: true,
          title: isCreate ? '发布笔记' : '编辑笔记',
          okText: isCreate ? '发布' : '保存并发布',
          onOk: handleToConfig,
          children: (
            <div className='mb-6'>
              <RichEditor
                ref={editorRef}
                initialValue={contentRef.current}
                className=' max-h-[70vh]'
                onChange={handleContentChange}
              />
            </div>
          ),
        },
      },
      step === 1 && {
        key: 1,
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
  }, [
    handleContentChange,
    handlePublish,
    handleToConfig,
    inited,
    isCreate,
    step,
  ]);

  return (
    <div
      className=' fixed left-0 top-0 z-30 flex h-full w-full flex-col items-center justify-center'
      style={{
        pointerEvents: 'none',
      }}>
      {/* mask */}
      {
        <div
          className={clsx(
            ' absolute left-0 top-0 h-full w-full duration-500 max-sm:bg-white max-sm:bg-opacity-20 max-sm:backdrop-blur-3xl sm:bg-black-100',
            modals.length > 0
              ? 'pointer-events-auto opacity-100 delay-200'
              : 'pointer-events-none opacity-0 delay-200'
          )}
          onClick={handleBack}></div>
      }
      {/* modal */}
      <MotionList transitionDuration={0.4} keys={modals}>
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
  );
}
