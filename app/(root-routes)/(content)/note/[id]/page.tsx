'use client';

import {
  AdjacentNotes,
  NoteInfo,
  NoteTypeEnum,
  deleteNoteAPI,
  getAdjacentNotesAPI,
  getNoteAPI,
  putNoteAPI,
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
import RichEditor from '@/ui/RichEditor';
import Editor from '@/ui/RichEditor/components/Editor';
import TOC from '@/ui/TOC';
import clsx from 'clsx';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Descendant, createEditor } from 'slate';
import { withReact, Slate as SlateProvider } from 'slate-react';

interface NoteDetailPageProps {
  params: { id: string };
  id: string;
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

  const [note, setNote] = useState<NoteInfo | null>(null);

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

  const editor = useMemo(() => {
    const enhancers = [withReact];
    return enhancers.reduce(
      (editor, enhancer) => enhancer(editor),
      createEditor()
    );
  }, []);

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
      return navigation.push('/404');
    }
  }, [params, navigation, request]);

  useEffect(() => {
    init();
  }, [init]);

  /************************************************
   * ✨ 更多
   ************************************************/

  const editorContent = useRef<Descendant[]>([]);

  const handleEditorContentChange = useCallback((value: Descendant[]) => {
    editorContent.current = value;
  }, []);

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
              const uuid = modalUtils?.open({
                title: '编辑笔记',
                children: (
                  <div className='mb-6'>
                    <RichEditor
                      initialValue={JSON.parse(note.content)}
                      className=' max-h-[70vh]'
                      onChange={handleEditorContentChange}
                    />
                  </div>
                ),
                okText: '保存',
                onOk: async () => {
                  try {
                    await putNoteAPI(request)({
                      _id: note._id,
                      type: NoteTypeEnum.NOTE,
                      content: JSON.stringify(editorContent.current),
                    });
                    notificationUtils
                      ?.open({
                        type: NotificationType.SUCCESS,
                        content: '保存成功',
                        duration: 3,
                      })
                      .then(() => {
                        modalUtils?.close(uuid);
                        // onChange?.(editorContent.current);
                        setNote(prevNote => {
                          if (prevNote) {
                            return {
                              ...prevNote,
                              content: JSON.stringify(editorContent.current),
                            };
                          }
                          return prevNote;
                        });
                      });
                  } catch (error: any) {
                    notificationUtils?.open({
                      type: NotificationType.WARNING,
                      content: error.message,
                      duration: 3,
                    });
                  }
                },
                cancelText: '取消',
                onCancel: () => {
                  modalUtils.close();
                },
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
      handleEditorContentChange,
      isAdmin,
      modalUtils,
      note,
      notificationUtils,
      request,
    ]
  );

  if (!note) return null;

  return (
    <SlateProvider editor={editor} initialValue={JSON.parse(note.content)}>
      <div
        className='mx-auto flex w-fit gap-8'
        style={{
          minHeight: 'calc(100vh - 3.625rem)',
        }}>
        <div className='flex w-[45rem] flex-col overflow-hidden bg-gray-100'>
          <div className='flex flex-col gap-4 p-8'>
            {/* 顶部 */}
            <div className='flex items-center justify-between gap-10'>
              {note.type === NoteTypeEnum.NOTE ? (
                <div className='flex items-center gap-1'>
                  <i className='iconfont icon-calender-filled text-17 text-black-250' />
                  <span
                    className='text-[0.75rem] leading-[0.75rem] text-black-250'
                    title={dayjs(note.createdAt).format('YYYY-MM-DD HH:mm:ss')}>
                    {dayjs(note.createdAt).format('YYYY-MM-DD')}
                  </span>
                </div>
              ) : (
                <span
                  className='overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-black-900 group-hover:text-primary-50'
                  title={note.title}>
                  {note.title}
                </span>
              )}
              {isLogin ? (
                <button
                  className=' group/more flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[0.5rem] border border-transparent transition-all duration-100 hover:bg-primary-50'
                  onClick={handleSetting}>
                  <i className='iconfont icon-ellipsis-v text-black-250 group-hover/more:text-white' />
                </button>
              ) : null}
            </div>
            {/* 内容 */}
            <div className='relative flex flex-1 flex-col overflow-hidden'>
              <Editor readonly />
            </div>
            {/* 底部 */}
            {note.type === NoteTypeEnum.ARTICLE && (
              <div className='flex items-center justify-between gap-1'>
                <div className='flex items-center gap-1'>
                  <i className='iconfont icon-calender-filled text-17 text-black-250' />
                  <span className='text-[0.75rem] leading-[0.75rem] text-black-250'>
                    {dayjs(note.createdAt).format('YYYY-MM-DD')}
                  </span>
                </div>
                <div className='flex gap-2.5'>
                  {[].map((tag, i) => (
                    <div
                      key={i}
                      className='text-black text-xs font-normal text-opacity-40'>
                      #{tag}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* 上下页 */}
          <div className='flex flex-col gap-4 bg-gray-50 p-5 md:flex-row'>
            <Link
              className={clsx(
                ' group flex h-16 flex-1 cursor-pointer items-center justify-start gap-2.5 overflow-hidden rounded-xl border border-transparent bg-black-50 px-3.5 py-2.5 transition-colors duration-100 hover:border-blue-600',
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
                ' group flex h-16 flex-1 cursor-pointer items-center justify-end gap-2.5 overflow-hidden rounded-xl border border-transparent bg-black-50 px-3.5 py-2.5 transition-colors duration-100 hover:border-blue-600',
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
        <TOC className='sticky top-24 hidden h-fit shrink-0 lg:flex' />
      </div>
    </SlateProvider>
  );
};

export default NoteDetailPage;
