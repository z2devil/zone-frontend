import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { NoteInfo } from '../api/notes';

interface WorksState {
  works: NoteInfo[];
}

interface WorksAction {
  setWorks: (works: NoteInfo[]) => void;
}

export const useWorksStore = create(
  immer<WorksState & WorksAction>(set => ({
    works: [],
    setWorks: works => {
      set(state => {
        state.works = works;
      });
    },
  }))
);
