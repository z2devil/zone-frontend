import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { DropType } from '../constants';

interface EditorState {
  dragHoveringElementInfo: {
    id: string | null;
    type: DropType | null;
  };
}

interface EditorAction {
  setDragHovering: (id: string, type: DropType) => void;
  clearDragHovering: () => void;
}

export const useEditorStore = create(
  immer<EditorState & EditorAction>(set => ({
    dragHoveringElementInfo: {
      id: null,
      type: null,
    },
    setDragHovering: (id, type) => {
      set(state => {
        state.dragHoveringElementInfo.id = id;
        state.dragHoveringElementInfo.type = type;
      });
    },
    clearDragHovering: () => {
      set(state => {
        state.dragHoveringElementInfo.id = null;
        state.dragHoveringElementInfo.type = null;
      });
    },
  }))
);
