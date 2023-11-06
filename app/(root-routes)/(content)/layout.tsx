'use client';

import { UserRole } from '@/lib/api/auth';
import { NoteTypeEnum, postNoteAPI } from '@/lib/api/notes';
import usePermission from '@/lib/hooks/usePermission';
import { modalUtilsState } from '@/lib/recoil/modal';
import Button from '@/ui/Button';
import RichEditor from '@/ui/RichEditor';
import { useCallback, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { Descendant } from 'slate';

interface ContentLayoutProps {
  children: React.ReactNode;
}

const ContentLayout = (props: ContentLayoutProps) => {
  const { children } = props;

  const modalUtils = useRecoilValue(modalUtilsState);

  const isAdmin = usePermission([UserRole.ADMIN, UserRole.MANAGER]);

  const editorContent = useRef<Descendant[]>([]);

  const handleEditorChange = useCallback((value: Descendant[]) => {
    editorContent.current = value;
  }, []);

  const handleAdd = useCallback(() => {
    if (!isAdmin) return;
    modalUtils?.open({
      title: '写动态',
      children: (
        <div>
          <RichEditor className=' max-h-[70vh]' onChange={handleEditorChange} />
        </div>
      ),
      okText: '发布',
      onOk: () => {
        console.log('onOk', editorContent.current);
        // modalUtils.close();
        postNoteAPI({
          type: NoteTypeEnum.NOTE,
          content: JSON.stringify(editorContent),
        });
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
