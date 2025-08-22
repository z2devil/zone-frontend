import { ComponentType } from 'react';
import { Editor, Element } from 'slate';
import { autoImportPlugins } from '../utils';
import {
  EDITOR_TO_TYPE_TO_COMPONENT,
  EDITOR_TO_INLINE_ELEMENTS,
  EDITOR_TO_BLOCK_ELEMENTS,
  EDITOR_TO_VOID_ELEMENTS,
} from '@/lib/constants';

/**
 * 设置编辑器插件
 * @param editor 编辑器
 * @returns 编辑器
 */
export const withPluginSetup = (editor: Editor) => {
  const { isVoid, isInline, isBlock } = editor;

  // 编辑器到元素类型到组件的映射
  const typeToComponent: Record<string, ComponentType<any>> = {};
  EDITOR_TO_TYPE_TO_COMPONENT.set(editor, typeToComponent);

  // 编辑器到内联元素类型的映射
  const inlineElements: string[] = [];
  EDITOR_TO_INLINE_ELEMENTS.set(editor, inlineElements);
  editor.isInline = (element: Element) => {
    return inlineElements.includes(element.type) || isInline(element);
  };

  // 编辑器到空元素类型的映射
  const voidElements: string[] = [];
  EDITOR_TO_VOID_ELEMENTS.set(editor, voidElements);
  editor.isVoid = (element: Element) => {
    return voidElements.includes(element.type) || isVoid(element);
  };

  // 编辑器到块元素类型的映射
  const blockElements: string[] = [];
  EDITOR_TO_BLOCK_ELEMENTS.set(editor, blockElements);
  editor.isBlock = (element: Element) => {
    return blockElements.includes(element.type) || isBlock(element);
  };

  // 自动导入元素插件
  const elementPlugins = autoImportPlugins();
  const keys = Object.keys(elementPlugins);
  keys.forEach(key => {
    const plugin = elementPlugins[key];
    const { type, element, enable, extendEditor, isBlock, isInline, isVoid } =
      plugin;

    if (!enable) return;
    const types = Array.isArray(type) ? type : [type];
    types.forEach(type => {
      typeToComponent[type] = element;

      if (extendEditor) {
        extendEditor(editor);
      }

      if (isBlock) {
        blockElements.push(type);
      }

      if (isInline) {
        inlineElements.push(type);
      }

      if (isVoid) {
        voidElements.push(type);
      }
    });
  });

  return editor;
};
