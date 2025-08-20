import { ComponentType } from 'react';
import { Editor } from 'slate';

export const EDITOR_TO_TYPE_TO_COMPONENT = new WeakMap<
  Editor,
  Record<string, ComponentType<any>>
>();
