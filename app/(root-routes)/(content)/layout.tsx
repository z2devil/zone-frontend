'use client';

import { UserRole } from '@/lib/api/user';
import { NoteTypeEnum, postNoteAPI } from '@/lib/api/notes';
import usePermission from '@/lib/hooks/usePermission';
import useRequest from '@/lib/hooks/useRequest';
import { useModalUtilsStore, useNotificationUtilsStore } from '@/lib/stores';
import { useNotesStore } from '@/lib/stores/notes';
import Button from '@/ui/Button';
import { NotificationType } from '@/ui/Notification/components/Notification';
import RichEditor from '@/ui/RichEditor';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Descendant } from 'slate';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

interface ContentLayoutProps {
  children: React.ReactNode;
}

const ContentLayout = (props: ContentLayoutProps) => {
  const { children } = props;

  const pathname = usePathname();

  const [request] = useRequest();

  const { utils: modalUtils } = useModalUtilsStore();

  const { utils: notificationUtils } = useNotificationUtilsStore();

  const { notes, setNotes } = useNotesStore();

  const isNotePage = useMemo(() => pathname === '/note', [pathname]);

  const isAdmin = usePermission([UserRole.ADMIN, UserRole.MANAGER]);

  const editorContent = useRef<Descendant[]>([]);

  const handleEditorChange = useCallback((value: Descendant[]) => {
    editorContent.current = value;
  }, []);

  const handleAdd = useCallback(() => {
    if (!isAdmin) return;
    const uuid = modalUtils?.open({
      keepAlive: true,
      title: '写笔记',
      children: (
        <div className='mb-6'>
          <RichEditor
            className=' max-h-[70vh] min-h-[320px]'
            onChange={handleEditorChange}
          />
        </div>
      ),
      okText: '发布',
      onOk: async () => {
        modalUtils?.open({
          keepAlive: true,
          title: (
            <div className='flex items-center gap-3'>
              <span className=' text-19 font-medium text-black-900'>
                发布流程
              </span>
              <span className=' text-15 text-black-250'>
                <span className=' font-medium text-black-600'>1</span>/3
              </span>
            </div>
          ),
          children: () => {
            const [type, setType] = useState<NoteTypeEnum>(NoteTypeEnum.NOTE);
            return (
              <div className='flex flex-col gap-5 p-6'>
                <span className=' text-17 text-black-600'>类型</span>
                <div className='flex gap-5'>
                  <Button
                    className={clsx(
                      ' relative h-12 flex-grow rounded-lg border text-17',
                      type === NoteTypeEnum.NOTE
                        ? 'border-primary-50 font-medium text-primary-50'
                        : 'border-black-80 text-black-600'
                    )}
                    onClick={() => setType(NoteTypeEnum.NOTE)}>
                    笔记
                  </Button>
                  <Button
                    className={clsx(
                      ' relative h-12 flex-grow rounded-lg border text-17',
                      type === NoteTypeEnum.ARTICLE
                        ? 'border-primary-50 font-medium text-primary-50'
                        : 'border-black-80 text-black-600'
                    )}
                    onClick={() => setType(NoteTypeEnum.ARTICLE)}>
                    文章
                  </Button>
                </div>
              </div>
            );
          },
          okText: '继续',
          onOk: async () => {},
        });

        // try {
        //   const nextNote = await postNoteAPI(request)({
        //     type: NoteTypeEnum.NOTE,
        //     content: JSON.stringify(editorContent.current),
        //   });
        //   modalUtils?.close(uuid);
        //   setNotes([nextNote, ...notes]);
        //   notificationUtils?.open({
        //     type: NotificationType.SUCCESS,
        //     content: '发布成功',
        //     duration: 3,
        //   });
        // } catch (error: any) {
        //   notificationUtils?.open({
        //     type: NotificationType.WARNING,
        //     content: error.message,
        //     duration: 3,
        //   });
        // }
      },
      cancelText: '取消',
      onCancel: () => {
        console.log('onCancel');
        modalUtils.close();
      },
    });
  }, [handleEditorChange, isAdmin, modalUtils]);

  return (
    <>
      {children}
      {isNotePage && isAdmin ? (
        <Button
          className=' group fixed bottom-20 left-1/2 h-14 w-14 -translate-x-1/2 rounded-full bg-white shadow-main hover:bg-primary-50'
          onClick={handleAdd}>
          <i className='iconfont icon-plus text-2xl text-primary-50 transition-colors duration-100 group-hover:text-white'></i>
        </Button>
      ) : null}
    </>
  );
};

export default ContentLayout;
