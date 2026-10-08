'use client';

import { canShareNote, deleteNoteAPI, isNoteOwner } from '@/lib/api/notes';
import { UserRole } from '@/lib/api/user';
import usePermission from '@/lib/hooks/usePermission';
import useRequest from '@/lib/hooks/useRequest';
import {
  useContextMenuUtilsStore,
  useAuthStore,
  useModalUtilsStore,
  useNotificationUtilsStore,
} from '@/lib/stores';
import EmptyInfo from '@/ui/EmptyInfo';
import { NotificationType } from '@/ui/Notification/components/Notification';
import TOC from '@/ui/TOC';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  disableScrollbar,
  enableScrollbar,
} from '@/lib/utils/scrollbarTrigger';
import { useNotesStore } from '@/lib/stores/notes';
import { NoteDetail } from '@/ui/NoteDetail';
import { NoteContentProvider } from '@/ui/NoteContent';
import { useNoteDetail } from '../../../(content)/note/[id]/useNoteDetail';

interface NoteDetailPageProps {
  params: { id: string };
}

const NoteDetailPage = (props: NoteDetailPageProps) => {
  const { params } = props;

  const navigation = useRouter();

  const [request] = useRequest();

  const { notes } = useNotesStore();

  const cachedNote = useMemo(
    () => notes.find(note => note._id === params.id),
    [notes, params.id]
  );

  const { status, note, adjacentNotes } = useNoteDetail(params.id, cachedNote);

  const contextMenuUtils = useContextMenuUtilsStore(state => state.utils);

  const { utils: modalUtils } = useModalUtilsStore();

  const { utils: notificationUtils } = useNotificationUtilsStore();

  const isLogin = usePermission([
    UserRole.LOGIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
  ]);

  const isAdmin = usePermission([UserRole.ADMIN, UserRole.MANAGER]);

  const userId = useAuthStore(state => state.userInfo?._id);

  const canManage = Boolean(note && isAdmin && isNoteOwner(note, userId));

  const prevNoteInfo = useMemo(() => {
    if (!adjacentNotes.prev) return null;
    return {
      id: adjacentNotes.prev._id,
      title: adjacentNotes.prev.title || '无标题',
    };
  }, [adjacentNotes]);

  const nextNoteInfo = useMemo(() => {
    if (!adjacentNotes.next) return null;
    return {
      id: adjacentNotes.next._id,
      title: adjacentNotes.next.title || '无标题',
    };
  }, [adjacentNotes]);

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
          canShareNote(note) && {
            key: 'share',
            label: '分享',
            icon: <i className='iconfont icon-share-filled text-17' />,
            onClick: () => {
              console.log('share');
            },
            sticky: true,
          },
          canManage && {
            key: 'edit',
            label: '编辑',
            icon: <i className='iconfont icon-edit text-19' />,
            onClick: () => {
              navigation.push(`/write/${note._id}`, {
                scroll: false,
              });
            },
          },
          canManage && {
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
      canManage,
      modalUtils,
      navigation,
      note,
      notificationUtils,
      request,
    ]
  );

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
    disableScrollbar();
    return () => {
      enableScrollbar();
    };
  }, []);

  if (status === 'unavailable') {
    return (
      <div
        className='fixed z-10 flex w-full items-center justify-center bg-black-80 backdrop-blur'
        style={{
          height: 'calc(100vh - 3.625rem)',
        }}
        onClick={() => navigation.back()}>
        <div
          className='rounded-xl bg-white p-10'
          onClick={e => e.stopPropagation()}>
          <EmptyInfo
            buttonText='关闭'
            tip='笔记不存在或无法访问'
            onButtonClick={() => navigation.back()}
          />
        </div>
      </div>
    );
  }

  if (!note) return null;

  return (
    <NoteContentProvider content={note.content}>
      <AnimatePresence>
        {!isExit ? (
          <div
            className='fixed z-10 flex w-full overflow-hidden'
            style={{
              height: 'calc(100vh - 3.625rem)',
            }}>
            {/* 背景 */}
            <motion.div
              animate={{ opacity: 1 }}
              className='pointer-events-none absolute inset-0 z-10 bg-black-80 backdrop-blur'
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
            />
            <div
              className='relative z-20 h-full w-full overflow-y-auto'
              onClick={handleBack}>
              <div className='relative mx-auto flex min-h-full gap-8 overflow-hidden md:w-fit'>
                {/* note */}
                <motion.div
                  animate={{ opacity: 1, top: 0 }}
                  className='relative flex min-w-0 max-w-full flex-1 flex-col bg-white md:w-[45rem]'
                  exit={{
                    opacity: 0,
                    top: -50,
                  }}
                  initial={{ opacity: 0, top: -50 }}
                  transition={{ type: 'tween' }}
                  onClick={e => e.stopPropagation()}>
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
                </motion.div>
                <motion.div
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  className='sticky top-11 hidden h-fit shrink-0 lg:block'
                  exit={{
                    opacity: 0,
                    x: 50,
                  }}
                  initial={{
                    opacity: 0,
                    x: 50,
                  }}
                  transition={{ type: 'tween' }}
                  onClick={e => e.stopPropagation()}>
                  <TOC />
                </motion.div>
              </div>
            </div>
          </div>
        ) : null}
      </AnimatePresence>
    </NoteContentProvider>
  );
};

export default NoteDetailPage;
