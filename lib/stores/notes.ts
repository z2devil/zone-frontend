import { create } from 'zustand';
import { NoteInfo } from '../api/notes';
import { immer } from 'zustand/middleware/immer';

interface NotesState {
  notes: NoteInfo[];
  filter: {
    tags: string[];
    content?: string;
  };
}

interface NotesAction {
  clear: () => void;
  setNotes: (notes: NoteInfo[]) => void;
  removeNote: (id: string) => void;
  setFilterTags: (tags: string[]) => void;
  setFilterContent: (content?: string) => void;
}

export const useNotesStore = create(
  immer<NotesState & NotesAction>(set => ({
    notes: [],
    filter: {
      tags: [],
    },
    clear: () => {
      set(state => {
        state.notes = [];
        state.filter = { tags: [] };
      });
    },
    setNotes: notes => {
      set(state => {
        state.notes = notes;
      });
    },
    removeNote: id => {
      set(state => {
        state.notes = state.notes.filter(note => note._id !== id);
      });
    },
    setFilterTags: tags => {
      set(state => {
        state.filter.tags = tags;
      });
    },
    setFilterContent: content => {
      set(state => {
        state.filter.content = content;
      });
    },
  }))
);
