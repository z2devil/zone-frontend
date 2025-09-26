import { ComponentType } from 'react';
import { Editor } from 'slate';
import { ActionKeyConfig } from '../hooks';

/**
 * 附加组件位置选项
 */
export type AdditionalComponentPosition = 'before' | 'after' | 'above';

/**
 * 附加组件配置
 */
export interface AdditionalComponentConfig {
  /**
   * 组件唯一标识
   */
  key: string;

  /**
   * 附加组件
   */
  component: ComponentType<any>;

  /**
   * 组件位置（相对于 Editable）
   */
  position?: AdditionalComponentPosition;
}

/**
 * 元素插件选项
 */
export interface PluginElement {
  /**
   * 元素类型
   */
  type: string | string[];

  /**
   * 元素组件
   */
  component: ComponentType<any>;

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
}

/**
 * 插件选项
 */
export interface PluginOptions {
  /**
   * 插件名称
   */
  name: string;

  /**
   * 是否启用
   */
  enable?: boolean;

  /**
   * 元素
   */
  element?: PluginElement;

  /**
   * 扩展编辑器
   */
  extendEditor?: (editor: Editor) => Editor;

  /**
   * 快捷键
   */
  hotkeys?: ActionKeyConfig[];

  /**
   * 附加组件配置
   */
  additionalComponent?: AdditionalComponentConfig | AdditionalComponentConfig[];
}

/**
 * 插件
 */
export interface Plugin {
  /**
   * 插件名称
   */
  name: string;

  /**
   * 是否启用
   */
  enable: boolean;

  /**
   * 元素
   */
  element?: PluginElement;

  /**
   * 扩展编辑器
   */
  extendEditor?: (editor: Editor) => Editor;

  /**
   * 快捷键
   */
  hotkeys: ActionKeyConfig[];

  /**
   * 附加组件配置
   */
  additionalComponents: AdditionalComponentConfig[];
}

/**
 * 创建元素插件
 * @param options 元素插件选项
 * @returns 元素插件
 */
export const createPlugin = (options: PluginOptions) => {
  const {
    name,
    enable = true,
    element,
    extendEditor,
    hotkeys = [],
    additionalComponent = [],
  } = options;

  const plugin: Plugin = {
    name,
    enable,
    extendEditor,
    hotkeys,
    additionalComponents: [],
  };

  if (element) {
    const {
      type,
      component,
      isBlock = true,
      isInline = false,
      isVoid = false,
    } = element;
    plugin.element = {
      type,
      component,
      isBlock,
      isInline,
      isVoid,
    };
  }

  plugin.additionalComponents = Array.isArray(additionalComponent)
    ? additionalComponent
    : [additionalComponent];

  return plugin;
};
