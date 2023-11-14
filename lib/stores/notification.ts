import { NotificationUtils } from '@/ui/Notification/Index';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface NotificationUtilsState {
  utils: NotificationUtils | null;
}

interface NotificationUtilsAction {
  setUtils: (utils: NotificationUtils | null) => void;
}

export const useNotificationUtilsStore = create(
  immer<NotificationUtilsState & NotificationUtilsAction>(set => ({
    utils: null,
    setUtils: utils => {
      set(state => {
        state.utils = utils;
      });
    },
  }))
);
