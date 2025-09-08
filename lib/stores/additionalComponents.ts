import { create } from 'zustand';
import { Editor } from 'slate';
import { AdditionalComponentConfig } from '@/ui/RichEditor/utils';

interface AdditionalComponentsState {
  /**
   * 编辑器到附加组件的映射
   */
  editorComponents: Map<Editor, AdditionalComponentConfig[]>;
}

interface AdditionalComponentsAction {
  /**
   * 设置编辑器的附加组件
   */
  setEditorComponents: (
    editor: Editor,
    components: AdditionalComponentConfig[]
  ) => void;

  /**
   * 添加附加组件到编辑器
   */
  addComponent: (editor: Editor, component: AdditionalComponentConfig) => void;

  /**
   * 移除编辑器的附加组件
   */
  removeComponent: (editor: Editor, key: string) => void;

  /**
   * 清空编辑器的附加组件
   */
  clearEditorComponents: (editor: Editor) => void;

  /**
   * 获取编辑器的附加组件
   */
  getEditorComponents: (editor: Editor) => AdditionalComponentConfig[];
}

export const useAdditionalComponentsStore = create<
  AdditionalComponentsState & AdditionalComponentsAction
>((set, get) => ({
  editorComponents: new Map(),

  setEditorComponents: (editor, components) => {
    set(state => ({
      editorComponents: new Map(state.editorComponents).set(editor, components),
    }));
  },

  addComponent: (editor, component) => {
    set(state => {
      const newMap = new Map(state.editorComponents);
      const existingComponents = newMap.get(editor) || [];
      const filteredComponents = existingComponents.filter(
        c => c.key !== component.key
      );
      newMap.set(editor, [...filteredComponents, component]);
      return { editorComponents: newMap };
    });
  },

  removeComponent: (editor, key) => {
    set(state => {
      const newMap = new Map(state.editorComponents);
      const existingComponents = newMap.get(editor) || [];
      const filteredComponents = existingComponents.filter(c => c.key !== key);
      newMap.set(editor, filteredComponents);
      return { editorComponents: newMap };
    });
  },

  clearEditorComponents: editor => {
    set(state => {
      const newMap = new Map(state.editorComponents);
      newMap.delete(editor);
      return { editorComponents: newMap };
    });
  },

  getEditorComponents: editor => {
    const state = get();
    return state.editorComponents.get(editor) || [];
  },
}));
