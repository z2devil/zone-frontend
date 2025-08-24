import { ComponentType } from 'react';
import { Editor } from 'slate';
import { ActionKeyConfig } from '../hooks';

/**
 * 元素插件接口
 */
export interface ElementPlugin {
  /**
   * 元素类型
   */
  type: string | string[];

  /**
   * 元素
   */
  element: ComponentType<any>;

  /**
   * 扩展编辑器
   */
  extendEditor?: (editor: Editor) => Editor;

  /**
   * 快捷键
   */
  hotkeys: ActionKeyConfig[];

  /**
   * 是否是块级元素
   */
  isBlock?: boolean;

  /**
   * 是否是内联元素
   */
  isInline?: boolean;

  /**
   * 是否是空元素
   */
  isVoid?: boolean;

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
export const createElementPlugin = (options: ElementPlugin) => {
  const {
    element,
    type,
    extendEditor,
    hotkeys,
    isBlock = true,
    isInline = false,
    isVoid = false,
    enable = true,
  } = options;

  return {
    element,
    type,
    extendEditor,
    hotkeys,
    isBlock,
    isInline,
    isVoid,
    enable,
  };
};
