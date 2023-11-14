'use client';

import { UserRole } from '@/lib/api/auth';
import { NoteTypeEnum, postNoteAPI } from '@/lib/api/notes';
import usePermission from '@/lib/hooks/usePermission';
import { useModalUtilsStore, useNotificationUtilsStore } from '@/lib/stores';
import Button from '@/ui/Button';
import { NotificationType } from '@/ui/Notification/components/Notification';
import RichEditor from '@/ui/RichEditor';
import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';
import { Descendant } from 'slate';

interface ContentLayoutProps {
  children: React.ReactNode;
}

const ContentLayout = (props: ContentLayoutProps) => {
  const { children } = props;

  const navigation = useRouter();

  const modalUtils = useModalUtilsStore(state => state.utils);

  const notificationUtils = useNotificationUtilsStore(state => state.utils);

  const isAdmin = usePermission([UserRole.ADMIN, UserRole.MANAGER]);

  const editorContent = useRef<Descendant[]>([]);

  const handleEditorChange = useCallback((value: Descendant[]) => {
    editorContent.current = value;
  }, []);

  const handleAdd = useCallback(() => {
    if (!isAdmin) return;
    const uuid = modalUtils?.open({
      title: '写动态',
      children: (
        <div>
          <RichEditor className=' max-h-[70vh]' onChange={handleEditorChange} />
        </div>
      ),
      okText: '发布',
      onOk: async () => {
        console.log('onOk', editorContent.current);
        // modalUtils.close();
        try {
          await postNoteAPI({
            type: NoteTypeEnum.NOTE,
            content: JSON.stringify(editorContent.current),
          });
          notificationUtils
            ?.open({
              type: NotificationType.SUCCESS,
              content: '发布成功',
              duration: 3,
            })
            .then(() => {
              modalUtils?.close(uuid);
              navigation.refresh();
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
  }, [handleEditorChange, isAdmin, modalUtils, navigation, notificationUtils]);

  return (
    <>
      {children}
      {isAdmin ? (
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
