import { ContextMenuUtils } from '@/ui/ContextMenu';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface ContextMenuUtilsState {
  utils: ContextMenuUtils | null;
}

interface ContextMenuUtilsAction {
  setUtils: (utils: ContextMenuUtils | null) => void;
}

export const useContextMenuUtilsStore = create(
  immer<ContextMenuUtilsState & ContextMenuUtilsAction>(set => ({
    utils: null,
    setUtils: utils => {
      set(state => {
        state.utils = utils;
      });
    },
  }))
);
