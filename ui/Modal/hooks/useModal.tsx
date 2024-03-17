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

type ModalOpenOptions = Omit<
  ModalProps,
  'uuid' | 'outterCalssName' | 'outterStyle'
> & {
  keepAlive?: boolean;
};

export interface ModalInfo {
  key: Key;
  options: Omit<ModalProps, 'outterCalssName' | 'outterStyle'> & {
    keepAlive?: boolean;
  };
}

const useModal = () => {
  const [modals, setModals] = useState<ModalInfo[]>([]);

  const calcKeys = useMemo(() => {
    if (modals.length === 0) return [];
    return [modals[modals.length - 1]];
  }, [modals]);

  const contextHolderRef = useRef<HTMLDivElement>(null);

  const utils = useMemo(() => {
    return {
      open: (options: ModalOpenOptions) => {
        const contextHolderDOM = contextHolderRef.current;
        if (!contextHolderDOM) throw new Error('contextHolderDOM unfined');

        const { closable = true, keepAlive = false } = options;

        const uuid = uniqueId('modal-');

        const nextModal: ModalInfo = {
          key: uuid,
          options: {
            ...options,
            closable,
            keepAlive,
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
      {
        <div
          className={clsx(
            ' absolute left-0 top-0 h-full w-full duration-500 max-sm:bg-white max-sm:bg-opacity-20 max-sm:backdrop-blur-3xl sm:bg-black-100',
            calcKeys.length > 0
              ? 'pointer-events-auto opacity-100 delay-200'
              : 'pointer-events-none opacity-0 delay-200'
          )}
          // onClick={handleBack}
        ></div>
      }
      {/* modal */}
      <MotionList transitionDuration={0.4} keys={calcKeys}>
        {info => {
          const { options, enterIn, leaveOut } = info;
          return (
            <Modal
              {...options}
              outterCalssName={clsx(
                enterIn && style.enterIn,
                leaveOut && style.leaveOut
              )}
              outterStyle={{
                ...info.style,
                display: info.visible ? 'block' : 'none',
              }}
            />
          );
        }}
      </MotionList>
    </div>
  );

  return [utils, contextHolder] as const;
};

export default useModal;
