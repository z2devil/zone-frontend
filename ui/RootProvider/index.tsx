'use client';

import { useEffect } from 'react';
import { useContextMenu } from '../ContextMenu';
import { useNotification } from '../Notification/Index';
import { useModal } from '../Modal';
import {
  useContextMenuUtilsStore,
  useModalUtilsStore,
  useNotificationUtilsStore,
} from '@/lib/stores';
import { useImagePreview } from '@/ui/ImagePreview';
import { useImagePreviewUtilsStore } from '@/lib/stores/imagePreview';

const RootProvider = ({ children }: { children: React.ReactNode }) => {
  const [notificationUtils, notificationHolder] = useNotification({
    maxCount: 5,
  });
  const [modalUtils, modalHolder] = useModal();
  const [contextMenuUtils, contextMenuHolder] = useContextMenu();
  const [imagePreviewUtils, imagePreviewHolder] = useImagePreview();

  const setNotificationUtils = useNotificationUtilsStore(
    state => state.setUtils
  );

  const setModalUtils = useModalUtilsStore(state => state.setUtils);

  const setContextMenuUtils = useContextMenuUtilsStore(state => state.setUtils);

  const setImagePreviewUtils = useImagePreviewUtilsStore(
    state => state.setUtils
  );

  useEffect(() => {
    setNotificationUtils(notificationUtils);
    setModalUtils(modalUtils);
    setContextMenuUtils(contextMenuUtils);
    setImagePreviewUtils(imagePreviewUtils);
    return () => {
      setNotificationUtils(null);
      setModalUtils(null);
      setContextMenuUtils(null);
      setImagePreviewUtils(null);
    };
  }, [
    contextMenuUtils,
    imagePreviewUtils,
    modalUtils,
    notificationUtils,
    setContextMenuUtils,
    setImagePreviewUtils,
    setModalUtils,
    setNotificationUtils,
  ]);

  return (
    <>
      {notificationHolder}
      {modalHolder}
      {contextMenuHolder}
      {imagePreviewHolder}
      {children}
    </>
  );
};

export default RootProvider;
