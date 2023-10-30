import { KeyboardEvent, useCallback } from 'react';
import { Editor, Element, Range, Transforms } from 'slate';
import { CustomEditor } from 'types/slate';
import { editorUtils } from '../utils';
import { InlineElementType, MarkType } from '../constans';

const ACTIONS: Record<string, (editor: CustomEditor) => void> = {
  b: editor => {
    editorUtils.toggleMark(editor, MarkType.BOLD);
  },
  i: editor => {
    editorUtils.toggleMark(editor, MarkType.ITALIC);
  },
  u: editor => {
    editorUtils.toggleMark(editor, MarkType.UNDERLINE);
  },
  s: editor => {
    editorUtils.toggleMark(editor, MarkType.STRIKETHROUGH);
  },
  e: editor => {
    editorUtils.wrapElement(editor, InlineElementType.CODE_LINE);
  },
};

const useKeyDown = (editor: CustomEditor) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      console.log('[ handleKeyDown ]', e);

      const isMeta = !!e.metaKey;
      const isCtrl = !!e.ctrlKey;
      const isAlt = !!e.altKey;
      const isShift = !!e.shiftKey;

      const { selection } = editor;

      // 组合键
      if (isMeta || isCtrl) {
        const action = ACTIONS[e.key];
        if (action) {
          e.preventDefault();
          action(editor);
        }
      }
      // 单键
      else if (!isMeta && !isCtrl && !isAlt && !isShift) {
        if (e.key === 'Tab') {
          e.preventDefault();
          Editor.insertText(editor, '  ');
        }
        if (e.key === 'ArrowLeft') {
          if (selection && Range.isCollapsed(selection)) {
            e.preventDefault();
            Transforms.move(editor, { unit: 'offset', reverse: true });
          }
        }
        if (e.key === 'ArrowRight') {
          if (selection && Range.isCollapsed(selection)) {
            e.preventDefault();
            Transforms.move(editor, { unit: 'offset' });
          }
        }
      }
    },
    [editor]
  );

  return handleKeyDown;
};

export default useKeyDown;
