import { create } from 'zustand';
import { NoteEntity } from '../api/notes';
import { immer } from 'zustand/middleware/immer';

interface NotesState {
  notes: NoteEntity[];
}

interface NotesAction {
  setNotes: (notes: NoteEntity[]) => void;
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
