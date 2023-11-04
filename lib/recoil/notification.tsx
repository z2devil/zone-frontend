'use client';

import { NotificationUtils, useNotification } from '@/ui/Notification/Index';
import { useEffect } from 'react';
import { atom, useSetRecoilState } from 'recoil';

export const notificationUtilsState = atom<NotificationUtils | null>({
  key: 'notificationUtilsState',
  default: null,
});

const NotificationUtilsProvider = () => {
  const [notificationUtils, notificationHolder] = useNotification({
    maxCount: 5,
  });

  const setNotificationStore = useSetRecoilState(notificationUtilsState);

  useEffect(() => {
    setNotificationStore(notificationUtils);
  }, [notificationUtils, setNotificationStore]);

  return <>{notificationHolder}</>;
};

export default NotificationUtilsProvider;
