import { ComponentType } from 'react';
import { Editor, Element } from 'slate';

/**
 * 元素插件选项
 */
export interface ElementPluginOptions {
  /**
   * 元素类型
   */
  type: string;

  /**
   * 元素
   */
  element: ComponentType<any>;

  /**
   * 扩展编辑器
   */
  extendEditor?: (editor: Editor) => Editor;

  /**
   * 是否是块级元素
   */
  isBlock?: (element: Element) => boolean;

  /**
   * 是否是内联元素
   */
  isInline?: (element: Element) => boolean;

  /**
   * 是否是空元素
   */
  isVoid?: (element: Element) => boolean;

  /**
   * 是否启用
   */
  enable?: boolean;
}

/**
 * 元素插件接口
 */
export interface ElementPlugin {
  /**
   * 元素
   */
  element: ComponentType<any>;

  /**
   * 元素类型
   */
  type: string;

  /**
   * 扩展编辑器
   */
  extendEditor?: (editor: Editor) => Editor;

  /**
   * 是否是块级元素
   */
  isBlock?: (element: Element) => boolean;

  /**
   * 是否是内联元素
   */
  isInline?: (element: Element) => boolean;

  /**
   * 是否是空元素
   */
  isVoid?: (element: Element) => boolean;

  /**
   * 是否启用
   */
  enable?: boolean;
}

/**
 * 创建元素插件
 * @param options 元素插件选项
 * @returns 元素插件
 */
export const createElementPlugin = (options: ElementPluginOptions) => {
  const {
    element,
    type,
    extendEditor,
    isBlock = () => true,
    isInline = () => false,
    isVoid = () => false,
    enable = true,
  } = options;

  return {
    element,
    type,
    extendEditor,
    isBlock,
    isInline,
    isVoid,
    enable,
  };
};

/**
 * 应用元素插件
 * @param editor 编辑器
 * @param plugin 元素插件
 * @returns 应用后的编辑器
 */
export const applyElementPlugin = (editor: Editor, plugin: ElementPlugin) => {
  const { extendEditor, isBlock, isInline, isVoid, enable } = plugin;

  if (!enable) {
    return editor;
  }

  if (extendEditor) {
    editor = extendEditor(editor);
  }

  if (isBlock) {
    const _isBlock = editor.isBlock;
    editor.isBlock = element => {
      return isBlock(element) || _isBlock(element);
    };
  }

  if (isInline) {
    const _isInline = editor.isInline;
    editor.isInline = element => {
      return isInline(element) || _isInline(element);
    };
  }

  if (isVoid) {
    const _isVoid = editor.isVoid;
    editor.isVoid = element => {
      return isVoid(element) || _isVoid(element);
    };
  }

  return editor;
};
