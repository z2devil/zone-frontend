'use client';

import { useContextMenu } from '../ContextMenu';
import { useNotification } from '../Notification/Index';
import { useModal } from '../Modal';
import { useEffect } from 'react';
import {
  useContextMenuUtilsStore,
  useModalUtilsStore,
  useNotificationUtilsStore,
} from '@/lib/stores';

const RootProvider = ({ children }: { children: React.ReactNode }) => {
  const [notificationUtils, notificationHolder] = useNotification({
    maxCount: 5,
  });
  const [modalUtils, modalHolder] = useModal();
  const [contextMenuUtils, contextMenuHolder] = useContextMenu();

  const setNotificationUtils = useNotificationUtilsStore(
    state => state.setUtils
  );

  const setModalUtils = useModalUtilsStore(state => state.setUtils);

  const setContextMenuUtils = useContextMenuUtilsStore(state => state.setUtils);

  useEffect(() => {
    setNotificationUtils(notificationUtils);
    setModalUtils(modalUtils);
    setContextMenuUtils(contextMenuUtils);
    return () => {
      setNotificationUtils(null);
      setModalUtils(null);
      setContextMenuUtils(null);
    };
  }, [
    contextMenuUtils,
    modalUtils,
    notificationUtils,
    setContextMenuUtils,
    setModalUtils,
    setNotificationUtils,
  ]);

  return (
    <>
      {notificationHolder}
      {modalHolder}
      {contextMenuHolder}
      {children}
    </>
  );
};

export default RootProvider;
