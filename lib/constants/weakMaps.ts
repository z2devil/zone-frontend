import { ComponentType } from 'react';
import { Editor } from 'slate';
import { WithEditorFirstArg } from 'slate/dist/utils';

/**
 * 编辑器到元素类型到组件的映射
 */
export const EDITOR_TO_TYPE_TO_COMPONENT = new WeakMap<
  Editor,
  Record<string, ComponentType<any>>
>();

/**
 * 编辑器到空元素类型的映射
 */
export const EDITOR_TO_VOID_ELEMENTS = new WeakMap<Editor, string[]>();

/**
 * 编辑器到内联元素类型的映射
 */
export const EDITOR_TO_INLINE_ELEMENTS = new WeakMap<Editor, string[]>();

/**
 * 编辑器到块元素类型的映射
 */
export const EDITOR_TO_BLOCK_ELEMENTS = new WeakMap<Editor, string[]>();

/**
 * 编辑器到快捷键的映射
 */
export const EDITOR_TO_HOTKEY_MAP = new WeakMap<
  Editor,
  Record<string, WithEditorFirstArg<(e: KeyboardEvent) => void>>
>();
