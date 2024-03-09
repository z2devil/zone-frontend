'use client';

import {
  NoteInfo,
  NoteTypeEnum,
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
import { NotificationType } from '@/ui/Notification/components/Notification';
import RichEditor from '@/ui/RichEditor';
import dayjs from 'dayjs';
import { notFound, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Descendant, createEditor } from 'slate';
import { withReact, Slate as SlateProvider } from 'slate-react';
import Editor from '@/ui/RichEditor/components/Editor';

const ABOUT_ID = '65ebc4f8f3cdb3499f7c32bb';

const About = () => {
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
      const res = await getNoteAPI(request)(ABOUT_ID);
      setNote(res);
    } catch (error) {
      return notFound();
    }
  }, [request]);

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
                    notificationUtils?.open({
                      type: NotificationType.SUCCESS,
                      content: '保存成功',
                      duration: 3,
                    });
                    modalUtils?.close(uuid);
                    setNote(prevNote => {
                      if (prevNote) {
                        return {
                          ...prevNote,
                          content: JSON.stringify(editorContent.current),
                        };
                      }
                      return prevNote;
                    });
                    navigation.refresh();
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
      navigation,
      note,
      notificationUtils,
      request,
    ]
  );

  if (!note) return null;

  return (
    <SlateProvider editor={editor} initialValue={JSON.parse(note.content)}>
      <div
        className='mx-auto flex gap-8 md:w-fit'
        style={{
          minHeight: 'calc(100vh - 3.625rem)',
        }}>
        <div className='flex w-full flex-col overflow-hidden md:w-[45rem]'>
          <div className='flex flex-col gap-4 p-8'>
            {/* 顶部 */}
            {isAdmin ? (
              <div className='flex items-center justify-between gap-10'>
                {note.type === NoteTypeEnum.NOTE ? (
                  <div className='flex items-center gap-1'>
                    <i className='iconfont icon-calender-filled text-17 text-black-250' />
                    <span
                      className='text-[0.75rem] leading-[0.75rem] text-black-250'
                      title={dayjs(note.createdAt).format(
                        'YYYY-MM-DD HH:mm:ss'
                      )}>
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
            ) : null}
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
        </div>
      </div>
    </SlateProvider>
  );
};

export default About;
