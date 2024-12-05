import { ImagePreviewUtils } from '@/ui/ImagePreview';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface ImagePreviewUtilsState {
  utils: ImagePreviewUtils | null;
}

interface ImagePreviewUtilsAction {
  setUtils: (utils: ImagePreviewUtils | null) => void;
}

export const useImagePreviewUtilsStore = create(
  immer<ImagePreviewUtilsState & ImagePreviewUtilsAction>(set => ({
    utils: null,
    setUtils: utils => {
      set(state => {
        state.utils = utils;
      });
    },
  }))
);
