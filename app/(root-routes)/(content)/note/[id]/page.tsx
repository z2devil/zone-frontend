'use client';

import {
  AdjacentNotes,
  NoteInfo,
  canShareNote,
  deleteNoteAPI,
  getAdjacentNotesAPI,
  getNoteAPI,
  isNoteOwner,
} from '@/lib/api/notes';
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
import { notFound, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { withReact, Slate as SlateProvider } from 'slate-react';
import { NoteDetail } from '@/ui/NoteDetail';
import { withPluginSetup } from '@/ui/RichEditor/plugins';

interface NoteDetailPageProps {
  params: { id: string };
}

const NoteDetailPage = (props: NoteDetailPageProps) => {
  const { params } = props;

  const navigation = useRouter();

  const [request] = useRequest();

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

  const [note, setNote] = useState<NoteInfo | null>(null);

  const canManage = Boolean(note && isAdmin && isNoteOwner(note, userId));

  const [adjacentNotes, setAdjacentNotes] = useState<AdjacentNotes>({
    prev: null,
    next: null,
  });

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
   * ✨ 初始化
   ************************************************/

  const init = useCallback(async () => {
    try {
      const res = await getNoteAPI(request)(params.id);
      setNote(res);
      const adjacentNotes = await getAdjacentNotesAPI(request)(params.id);
      setAdjacentNotes(adjacentNotes);
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

  const editor = useMemo(() => {
    const enhancers = [withReact, withPluginSetup];
    return enhancers.reduce(
      (editor, enhancer) => enhancer(editor),
      createEditor()
    );
  }, []);

  if (!note) return null;

  return (
    <SlateProvider editor={editor} initialValue={JSON.parse(note.content)}>
      <div
        className='mx-auto flex gap-8 md:w-fit'
        style={{
          minHeight: 'calc(100vh - 3.625rem)',
        }}>
        <div className='flex w-full flex-col overflow-hidden bg-white md:w-[45rem]'>
          <NoteDetail isLogin={isLogin} note={note} onSetting={handleSetting} />
          {/* 上下页 */}
          <div className='flex flex-col gap-4 p-5 md:flex-row'>
            <Link
              className={clsx(
                'group flex h-16 flex-1 cursor-pointer items-center justify-start gap-2.5 overflow-hidden rounded-xl border border-transparent bg-black-50 px-3.5 py-2.5 transition-colors duration-100 hover:border-blue-600',
                {
                  'pointer-events-none': !prevNoteInfo,
                }
              )}
              href={`/note/${prevNoteInfo?.id}`}>
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
              href={`/note/${nextNoteInfo?.id}`}>
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
        <TOC className='sticky top-24 hidden h-fit shrink-0 lg:block' />
      </div>
    </SlateProvider>
  );
};

export default NoteDetailPage;
