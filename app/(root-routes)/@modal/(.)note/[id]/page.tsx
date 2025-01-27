'use client';

import {
  AdjacentNotes,
  deleteNoteAPI,
  getAdjacentNotesAPI,
} from '@/lib/api/notes';
import { UserRole } from '@/lib/api/user';
import usePermission from '@/lib/hooks/usePermission';
import useRequest from '@/lib/hooks/useRequest';
import {
  useContextMenuUtilsStore,
  useModalUtilsStore,
  useNotificationUtilsStore,
} from '@/lib/stores';
import { getContentSummary } from '@/lib/utils/editor';
import EmptyInfo from '@/ui/EmptyInfo';
import { NotificationType } from '@/ui/Notification/components/Notification';
import TOC from '@/ui/TOC';
import clsx from 'clsx';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { withReact, Slate as SlateProvider } from 'slate-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  disableScrollbar,
  enableScrollbar,
  isDisabledScrollbar,
} from '@/lib/utils/scrollbarTrigger';
import { useNotesStore } from '@/lib/stores/notes';
import { NoteDetail } from '@/ui/NoteDetail';

interface NoteDetailPageProps {
  params: { id: string };
}

const NoteDetailPage = (props: NoteDetailPageProps) => {
  const { params } = props;

  const navigation = useRouter();

  const [request] = useRequest();

  const { notes } = useNotesStore();

  const note = useMemo(
    () => notes.find(note => note._id === params.id),
    [notes, params.id]
  );

  const contextMenuUtils = useContextMenuUtilsStore(state => state.utils);

  const { utils: modalUtils } = useModalUtilsStore();

  const { utils: notificationUtils } = useNotificationUtilsStore();

  const isLogin = usePermission([
    UserRole.LOGIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
  ]);

  const isAdmin = usePermission([UserRole.ADMIN, UserRole.MANAGER]);

  const [adjacentNotes, setAdjacentNotes] = useState<AdjacentNotes>({
    prev: null,
    next: null,
  });

  const prevNoteInfo = useMemo(() => {
    if (!adjacentNotes.prev) return null;
    return {
      id: adjacentNotes.prev._id,
      title: getContentSummary(adjacentNotes.prev.content),
    };
  }, [adjacentNotes]);

  const nextNoteInfo = useMemo(() => {
    if (!adjacentNotes.next) return null;
    return {
      id: adjacentNotes.next._id,
      title: getContentSummary(adjacentNotes.next.content),
    };
  }, [adjacentNotes]);

  /************************************************
   * ✨ 初始化
   ************************************************/

  const init = useCallback(async () => {
    try {
      // const res = await getNoteAPI(request)(params.id);
      // setNote(res);
      const adjacentNotes = await getAdjacentNotesAPI(request)(params.id);
      setAdjacentNotes(adjacentNotes);
      console.log('[ adjacentNotes ]', adjacentNotes);
    } catch (error) {
      return notFound();
    }
  }, [params, request]);

  useEffect(() => {
    init();
  }, [init]);

  /************************************************
   * ✨ 更多
   ************************************************/

  const handleSetting = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (!note) return;
      contextMenuUtils?.open(
        [
          {
            key: 'like',
            label: '喜欢',
            icon: <i className='iconfont icon-heart-filled text-17' />,
            onClick: () => {
              console.log('like');
            },
            sticky: true,
          },
          {
            key: 'share',
            label: '分享',
            icon: <i className='iconfont icon-share-filled text-17' />,
            onClick: () => {
              console.log('share');
            },
            sticky: true,
          },
          isAdmin && {
            key: 'lock',
            label: '上锁',
            icon: <i className='iconfont icon-lock-filled text-17' />,
            onClick: () => {
              console.log('lock');
            },
            sticky: true,
          },
          isAdmin && {
            key: 'edit',
            label: '编辑',
            icon: <i className='iconfont icon-edit text-19' />,
            onClick: () => {
              navigation.push(`/write/${note._id}`, {
                scroll: false,
              });
            },
          },
          isAdmin && {
            key: 'delete',
            label: '删除',
            icon: <i className='iconfont icon-trash text-19' />,
            onClick: () => {
              const uuid = modalUtils?.open({
                title: '删除',
                children: '确定要删除这篇笔记吗？',
                okText: '删除',
                onOk: async () => {
                  try {
                    await deleteNoteAPI(request)(note._id);
                    notificationUtils?.open({
                      type: NotificationType.SUCCESS,
                      content: '删除成功',
                      duration: 3,
                    });
                  } catch (error) {
                    notificationUtils?.open({
                      type: NotificationType.ERROR,
                      content: '删除失败',
                      duration: 3,
                    });
                  } finally {
                    modalUtils.close(uuid);
                  }
                },
                cancelText: '取消',
                onCancel: () => {
                  modalUtils.close(uuid);
                },
              });
            },
          },
        ],
        { x: e.clientX, y: e.clientY },
        document.querySelector('body') as HTMLElement
      );
    },
    [
      contextMenuUtils,
      isAdmin,
      modalUtils,
      navigation,
      note,
      notificationUtils,
      request,
    ]
  );

  const editor = useMemo(() => {
    return withReact(createEditor());
  }, []);

  const [isExit, setIsExit] = useState(false);

  const handleBack = useCallback(() => {
    setIsExit(true);
  }, []);

  useEffect(() => {
    if (isExit) {
      setTimeout(() => {
        navigation.back();
      }, 300);
    }
  }, [isExit, navigation]);

  useEffect(() => {
    if (isDisabledScrollbar()) return;
    disableScrollbar();
    return enableScrollbar;
  }, []);

  if (!note) return null;

  return (
    <SlateProvider
      editor={editor}
      initialValue={JSON.parse(note.content || '')}>
      <div className='fixed inset-0 z-10 overflow-y-auto' onClick={handleBack}>
        <AnimatePresence>
          {!isExit ? (
            <>
              {/* mask */}
              <motion.div
                animate={{ opacity: 1 }}
                className='pointer-events-none fixed z-0 h-full w-full bg-black-80'
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
              />
              {/* note */}
              <motion.div
                animate={{ opacity: 1, top: 0 }}
                className='relative z-10 mx-auto flex gap-8 md:w-fit'
                exit={{
                  opacity: 0,
                  top: -50,
                }}
                initial={{ opacity: 0, top: -50 }}
                style={{
                  marginTop: '3.625rem',
                  minHeight: 'calc(100vh - 3.625rem)',
                }}
                transition={{ type: 'tween' }}
                onClick={e => e.stopPropagation()}>
                <div className='flex w-full flex-col overflow-hidden bg-white md:w-[45rem]'>
                  <NoteDetail
                    isLogin={isLogin}
                    note={note}
                    onSetting={handleSetting}
                  />
                  {/* 上下页 */}
                  <div className='flex flex-col gap-4 p-5 md:flex-row'>
                    <Link
                      className={clsx(
                        'group flex h-16 flex-1 cursor-pointer items-center justify-start gap-2.5 overflow-hidden rounded-xl border border-transparent bg-black-50 px-3.5 py-2.5 transition-colors duration-100 hover:border-blue-600',
                        {
                          'pointer-events-none': !prevNoteInfo,
                        }
                      )}
                      href={`/note/${prevNoteInfo?.id}`}
                      replace={true}
                      scroll={false}>
                      <span className='iconfont icon-angle-left relative shrink-0 text-19 font-semibold text-black-600 transition-colors duration-100 group-hover:text-primary-50' />
                      <span
                        className='flex-1 truncate text-base font-semibold text-black-600 transition-colors duration-100 group-hover:text-primary-50'
                        title={prevNoteInfo?.title}>
                        {'上一篇：' + (prevNoteInfo?.title || '无')}
                      </span>
                    </Link>
                    <Link
                      className={clsx(
                        'group flex h-16 flex-1 cursor-pointer items-center justify-end gap-2.5 overflow-hidden rounded-xl border border-transparent bg-black-50 px-3.5 py-2.5 transition-colors duration-100 hover:border-blue-600',
                        {
                          'pointer-events-none': !nextNoteInfo,
                        }
                      )}
                      href={`/note/${nextNoteInfo?.id}`}
                      replace={true}
                      scroll={false}>
                      <span
                        className='flex-1 truncate text-base font-semibold text-black-600 transition-colors duration-100 group-hover:text-primary-50'
                        title={nextNoteInfo?.title}>
                        {'下一篇：' + (nextNoteInfo?.title || '无')}
                      </span>
                      <span className='iconfont icon-angle-right relative shrink-0 text-19 font-semibold text-black-600 transition-colors duration-100 group-hover:text-primary-50' />
                    </Link>
                  </div>
                  {/* 评论 */}
                  <div className='flex px-5 pb-20 pt-5'>
                    <EmptyInfo tip='暂无评论' />
                  </div>
                </div>
                <motion.div
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  className='fixed top-24 ml-[47rem] hidden h-fit lg:flex'
                  exit={{
                    opacity: 0,
                    x: 50,
                  }}
                  initial={{
                    opacity: 0,
                    x: 50,
                  }}
                  transition={{ type: 'tween' }}>
                  <TOC />
                </motion.div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </div>
    </SlateProvider>
  );
};

export default NoteDetailPage;
