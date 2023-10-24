'use client';

import { modalUtilsState } from '@/lib/recoil/modal';
import Button from '@/ui/Button';
import CustomEditor, { EditorRef } from '@/ui/CustomEditor';
import { useRef } from 'react';
import { useRecoilValue } from 'recoil';

interface ContentLayoutProps {
  children: React.ReactNode;
}

const ContentLayout = (props: ContentLayoutProps) => {
  const { children } = props;

  const modalUtils = useRecoilValue(modalUtilsState);

  const editorRef = useRef<EditorRef | null>(null);

  const handleAdd = () => {
    modalUtils?.open({
      title: '写动态',
      children: (
        <div>
          <CustomEditor ref={editorRef} className=' max-h-[70vh]' />
        </div>
      ),
      okText: '发布',
      onOk: () => {
        const editorInstance = editorRef.current;
        if (!editorInstance) return;
        console.log('onOk', editorInstance.getJSON(), editorInstance.getHTML());
        // modalUtils.close();
      },
      cancelText: '取消',
      onCancel: () => {
        console.log('onCancel');
        modalUtils.close();
      },
    });
  };

  return (
    <>
      {children}
      <Button
        className=' group fixed bottom-20 left-1/2 h-14 w-14 -translate-x-1/2 rounded-full bg-white shadow-main hover:bg-primary-50'
        onClick={handleAdd}>
        <i className='iconfont icon-plus text-2xl text-primary-50 transition-colors duration-100 group-hover:text-white'></i>
      </Button>
    </>
  );
};

export default ContentLayout;
