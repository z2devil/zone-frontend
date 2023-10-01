import { Key, useMemo, useRef, useState } from 'react';
import Modal, { ModalProps } from '../components/Modal';
import { uniqueId } from 'lodash';
import { produce } from 'immer';
import { MotionList } from '@/ui/Motion';
import style from './style.module.scss';
import clsx from 'clsx';

export interface ModalUtils {
  open: (options: ModalOpenOptions) => Key;
  close: (uuid?: Key) => void;
}

interface ModalOpenOptions {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  closable?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
}

interface ModalInfo {
  key: Key;
  options: ModalOpenOptions & { uuid: Key };
}

const useModal = () => {
  const [modals, setModals] = useState<ModalInfo[]>([]);

  const calcCurrentModals = useMemo(() => {
    if (modals.length === 0) return [];
    return [modals[modals.length - 1]];
  }, [modals]);

  const contextHolderRef = useRef<HTMLDivElement>(null);

  const utils = useMemo(() => {
    return {
      open: (options: ModalOpenOptions) => {
        const contextHolderDOM = contextHolderRef.current;
        if (!contextHolderDOM) throw new Error('contextHolderDOM unfined');

        const { closable = true } = options;

        const uuid = uniqueId('modal-');

        options.title += uuid;

        const nextModal: ModalInfo = {
          key: uuid,
          options: {
            ...options,
            closable,
            uuid,
          },
        };

        setModals(
          produce(draft => {
            draft.push(nextModal);
          })
        );

        return uuid;
      },
      close: (uuid?: Key) => {
        setModals(
          produce(draft => {
            if (uuid) {
              const index = draft.findIndex(item => item.key === uuid);
              if (index !== -1) draft.splice(index, 1);
            } else {
              draft.pop();
            }
          })
        );
      },
    };
  }, []);

  const contextHolder = (
    <div
      ref={contextHolderRef}
      className=' fixed left-0 top-0 z-30 flex h-full w-full flex-col items-center justify-center'
      style={{
        pointerEvents: 'none',
      }}>
      {/* mask */}
      {calcCurrentModals.length > 0 && (
        <div
          className=' absolute left-0 top-0 h-full w-full duration-500 max-sm:bg-white max-sm:bg-opacity-20 max-sm:backdrop-blur-3xl'
          // onClick={handleBack}
          style={{
            pointerEvents: 'all',
          }}></div>
      )}
      {/* modal */}
      <MotionList transitionDuration={0.4} keys={calcCurrentModals}>
        {info => {
          const { options, enterIn, leaveOut } = info as {
            options: ModalProps;
            visible: boolean;
            transitionDuration: number;
            style: React.CSSProperties;
            enterIn: boolean;
            leaveOut: boolean;
          };
          return (
            <Modal
              outterCalssName={clsx(
                enterIn && style.enterIn,
                leaveOut && style.leaveOut
              )}
              outterStyle={info.style}
              {...options}
            />
          );
        }}
      </MotionList>
    </div>
  );

  return [utils, contextHolder] as const;
};

export default useModal;
