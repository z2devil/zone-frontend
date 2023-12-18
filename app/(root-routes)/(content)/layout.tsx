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
import { useCallback, useMemo, useRef } from 'react';
import { Descendant } from 'slate';
import { usePathname } from 'next/navigation';

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
      title: '写笔记',
      children: (
        <div className='mb-6'>
          <RichEditor className=' max-h-[70vh]' onChange={handleEditorChange} />
        </div>
      ),
      okText: '发布',
      onOk: async () => {
        console.log('onOk', editorContent.current);
        // modalUtils.close();
        try {
          const nextNote = await postNoteAPI(request)({
            type: NoteTypeEnum.NOTE,
            content: JSON.stringify(editorContent.current),
          });
          modalUtils?.close(uuid);
          setNotes([nextNote, ...notes]);
          notificationUtils?.open({
            type: NotificationType.SUCCESS,
            content: '发布成功',
            duration: 3,
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
        console.log('onCancel');
        modalUtils.close();
      },
    });
  }, [
    handleEditorChange,
    isAdmin,
    modalUtils,
    notes,
    notificationUtils,
    request,
    setNotes,
  ]);

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
