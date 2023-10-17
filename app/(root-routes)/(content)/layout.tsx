'use client';

import { modalUtilsState } from '@/lib/recoil/modal';
import Button from '@/ui/Button';
import { useRecoilValue } from 'recoil';

interface ContentLayoutProps {
  children: React.ReactNode;
}

const ContentLayout = (props: ContentLayoutProps) => {
  const { children } = props;

  const modalUtils = useRecoilValue(modalUtilsState);

  const handleAdd = () => {
    modalUtils?.open({
      title: '写动态',
      children: (
        <div>
          <iframe
            rel='preload'
            className=' h-[20rem] w-full'
            src='https://z2devil.github.io/editor/'></iframe>
        </div>
      ),
    });
  };

  return (
    <>
      {children}
      {/* <Button
        className=' group fixed bottom-20 left-1/2 h-14 w-14 -translate-x-1/2 rounded-full bg-white shadow-main hover:bg-primary-50'
        onClick={handleAdd}>
        <i className='iconfont icon-plus text-2xl text-primary-50 transition-colors duration-100 group-hover:text-white'></i>
      </Button> */}
    </>
  );
};

export default ContentLayout;
