import { useModalUtilsStore } from '@/lib/stores';
import Button from '@/ui/Button';
import clsx from 'clsx';
import { useMemo } from 'react';

export type ModalProps = {
  uuid: string;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  closable?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  outterCalssName?: string;
  outterStyle?: React.CSSProperties;
};

const Modal = (props: ModalProps) => {
  const {
    uuid,
    title,
    children,
    footer,
    okText,
    cancelText,
    closable,
    onOk,
    onCancel,
    outterCalssName,
    outterStyle,
  } = props;

  const { utils: modalUtils } = useModalUtilsStore();

  const handleBack = () => {
    if (!modalUtils) return;
    modalUtils.close(uuid);
  };

  const childrenRender = useMemo(() => {
    if (typeof children === 'string' || typeof children === 'number') {
      return <div className='p-6 text-17 text-black-900'>{children}</div>;
    } else {
      return children;
    }
  }, [children]);

  const footerRender = useMemo(() => {
    if (footer) return footer;
    if (okText || cancelText) {
      return (
        <div className='flex w-full justify-center gap-5 px-6'>
          {cancelText && (
            <Button
              className=' relative flex h-11 flex-grow items-center justify-center rounded-xl border border-black-80 text-17 text-black-600 hover:text-black-900'
              onClick={onCancel}>
              {cancelText}
            </Button>
          )}
          {okText && (
            <Button
              className=' relative flex h-11 flex-shrink-0 items-center justify-center rounded-xl border border-black-80 bg-primary-50 px-6 text-17 text-white hover:bg-primary-100'
              onClick={onOk}>
              {okText}
            </Button>
          )}
        </div>
      );
    }
    return null;
  }, [footer, okText, cancelText, onOk, onCancel]);

  return (
    <div
      className={clsx(
        ' absolute left-0 right-0 top-1/2 flex w-full -translate-y-1/2 flex-col items-center justify-between overflow-hidden bg-gray-100 transition-all duration-300 max-sm:border-y max-sm:border-black-80 sm:mx-auto sm:w-[640px] sm:rounded-2xl sm:shadow-2xl',
        outterCalssName
      )}
      style={{
        pointerEvents: 'all',
        ...outterStyle,
      }}>
      {/* title */}
      <div className='flex h-14 w-full items-center justify-between gap-4 px-6 sm:border-b sm:border-black-80 sm:bg-white'>
        <span className='text-19 font-medium leading-6 text-black-900'>
          {title}
        </span>
        {closable && (
          <button className=' group p-2'>
            <i
              className=' iconfont icon-error text-[1.5rem] font-medium leading-6 text-black-600 transition-colors duration-100 group-hover:text-black-900'
              onClick={handleBack}></i>
          </button>
        )}
      </div>
      {/* content */}
      <div className='w-full overflow-y-auto'>{childrenRender}</div>
      {/* footer */}
      {footerRender && (
        <div className='flex w-full justify-center gap-5 pb-6'>
          {footerRender}
        </div>
      )}
    </div>
  );
};

export default Modal;
