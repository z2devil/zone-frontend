import { ModalUtils } from '@/ui/Modal';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface ModalUtilsState {
  utils: ModalUtils | null;
}

interface ModalUtilsAction {
  setUtils: (utils: ModalUtils | null) => void;
}

export const useModalUtilsStore = create(
  immer<ModalUtilsState & ModalUtilsAction>(set => ({
    utils: null,
    setUtils: utils => {
      set(state => {
        state.utils = utils;
      });
    },
  }))
);
