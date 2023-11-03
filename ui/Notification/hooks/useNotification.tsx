import { Key, useCallback, useMemo, useState } from 'react';
import NotificationGroup from '../components/NotificationGroup';
import { NotificationProps } from '../components/Notification';
import { produce } from 'immer';
import { uniqueId } from 'lodash';

export type NotificationConfig = Omit<NotificationProps, 'uuid'>;

export interface NotificationUtils {
  open: (config: NotificationConfig) => void;
  close: (key: Key) => void;
  destroy: () => void;
}

enum NotificationTaskType {
  OPEN,
  CLOSE,
  DESTROY,
}

interface UseNotificationOptions {
  maxCount?: number;
  onClose?: (uuid: Key) => void;
}

const useNotification = (options: UseNotificationOptions) => {
  const { maxCount = 5, onClose } = options;

  const [notificationList, setNotificationList] = useState<NotificationProps[]>(
    []
  );

  const utils = useMemo<NotificationUtils>(() => {
    const actions = {
      [NotificationTaskType.OPEN]: (config: NotificationConfig) => {
        const uuid = uniqueId();
        setNotificationList(
          produce(draft => {
            const nextNotice: NotificationProps = {
              uuid,
              ...config,
            };
            draft.push(nextNotice);
            if (maxCount > 0 && draft.length > maxCount) {
              draft.splice(0, draft.length - maxCount);
            }
          })
        );
      },
      [NotificationTaskType.CLOSE]: (uuid: Key) => {
        setNotificationList(
          produce(draft => {
            const index = draft.findIndex(item => item.uuid === uuid);
            if (index >= 0) {
              const config = draft[index];
              config.onClose?.(uuid);
              draft.splice(index, 1);
            }
          })
        );
      },
      [NotificationTaskType.DESTROY]: () => {
        setNotificationList(
          produce(draft => {
            draft.forEach(config => {
              config.onClose?.(config.uuid);
            });
            draft.splice(0, draft.length);
          })
        );
      },
    };

    return {
      open: config => {
        actions[NotificationTaskType.OPEN](config);
      },
      close: key => {
        actions[NotificationTaskType.CLOSE](key);
      },
      destroy: () => {
        actions[NotificationTaskType.DESTROY]();
      },
    };
  }, [maxCount]);

  const handleClose = useCallback(
    (key: Key) => {
      utils.close(key);
      onClose?.(key);
    },
    [utils, onClose]
  );

  const contextHolder = (
    <NotificationGroup list={notificationList} onClose={handleClose} />
  );

  return [utils, contextHolder] as const;
};

export default useNotification;
