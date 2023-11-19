import { create } from 'zustand';
import { NoteInfo } from '../api/notes';
import { immer } from 'zustand/middleware/immer';

interface NotesState {
  notes: NoteInfo[];
}

interface NotesAction {
  setNotes: (notes: NoteInfo[]) => void;
}

export const useNotesStore = create(
  immer<NotesState & NotesAction>(set => ({
    notes: [],
    setNotes: notes => {
      set(state => {
        state.notes = notes;
      });
    },
  }))
);
