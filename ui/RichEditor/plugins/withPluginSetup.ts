import { ComponentType } from 'react';
import { Editor, Element } from 'slate';
import { autoImportPlugins } from '../utils';
import { EDITOR_TO_TYPE_TO_COMPONENT } from '@/lib/constants';

/**
 * 设置编辑器插件
 * @param editor 编辑器
 * @returns 编辑器
 */
export const withPluginSetup = (editor: Editor) => {
  // 编辑器到元素类型到组件的映射
  const typeToComponent: Record<string, ComponentType<any>> = {};
  EDITOR_TO_TYPE_TO_COMPONENT.set(editor, typeToComponent);

  // 自动导入元素插件
  const elementPlugins = autoImportPlugins();
  const keys = Object.keys(elementPlugins);
  keys.forEach(key => {
    const plugin = elementPlugins[key];
    const { type, element, enable, extendEditor, isBlock, isInline, isVoid } =
      plugin;

    if (!enable) return;
    typeToComponent[type] = element;

    if (extendEditor) {
      extendEditor(editor);
    }

    if (isBlock) {
      const _isBlock = editor.isBlock;
      editor.isBlock = (element: Element) => {
        return isBlock(element) || _isBlock(element);
      };
    }

    if (isInline) {
      const _isInline = editor.isInline;
      editor.isInline = (element: Element) => {
        return isInline(element) || _isInline(element);
      };
    }

    if (isVoid) {
      const _isVoid = editor.isVoid;
      editor.isVoid = (element: Element) => {
        return isVoid(element) || _isVoid(element);
      };
    }
  });

  return editor;
};
