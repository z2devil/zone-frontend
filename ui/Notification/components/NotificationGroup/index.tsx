import { Key, useCallback, useMemo } from 'react';
import NotificationItem, { NotificationProps } from '../Notification';
import { MotionList } from '@/ui/Motion';
import style from './style.module.scss';
import clsx from 'clsx';

export interface NotificationGroupProps {
  list: NotificationProps[];
  onClose?: (uuid: Key) => void;
}

const NotificationGroup = (props: NotificationGroupProps) => {
  const { list, onClose } = props;

  const calcKeys = useMemo(() => {
    return list.map(config => ({
      key: config.uuid,
      config,
    }));
  }, [list]);

  const handleClose = useCallback(
    (uuid: Key) => {
      onClose?.(uuid);
    },
    [onClose]
  );

  return (
    <div className=' pointer-events-none fixed top-2 z-50 mx-auto flex w-full flex-col items-center'>
      <MotionList keys={calcKeys}>
        {(info, nodeRef) => {
          const config = info.config as NotificationProps;
          return (
            <div
              className={clsx(
                'flex h-16 items-center',
                info.enterIn && style.enterIn,
                info.leaveOut && style.leaveOut
              )}
              style={{ pointerEvents: 'all', ...info.style }}
              ref={nodeRef}>
              <NotificationItem
                uuid={config.uuid}
                type={config.type}
                content={config.content}
                closable={config.closable}
                duration={config.duration}
                onClick={config.onClick}
                onClose={handleClose}
              />
            </div>
          );
        }}
      </MotionList>
    </div>
  );
};

export default NotificationGroup;
