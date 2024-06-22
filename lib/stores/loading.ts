import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface LoadingState {
  loadingMap: Record<string | symbol, boolean>;
  uiLoadingMap: Record<string | symbol, boolean>;
}

interface LoadingAction {
  setLoadingMap: (key: string | symbol, value: boolean) => void;
  setUiLoadingMap: (key: string | symbol, value: boolean) => void;
}

export const useLoadingStore = create(
  persist(
    immer<LoadingState & LoadingAction>(set => ({
      loadingMap: {},
      uiLoadingMap: {},
      setLoadingMap: (key: string | symbol, value: boolean) => {
        set(state => {
          state.loadingMap[key] = value;
        });
      },
      setUiLoadingMap: (key: string | symbol, value: boolean) => {
        set(state => {
          state.uiLoadingMap[key] = value;
        });
      },
    })),
    {
      name: 'loading-storage',
    }
  )
);
