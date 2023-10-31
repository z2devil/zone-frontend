import { KeyboardEvent, useCallback, useRef } from 'react';
import { Editor, Range, Transforms } from 'slate';
import { CustomEditor, CustomElement } from 'types/slate';
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
  // 用于记录上一次按下的键盘按键是否是内联元素
  const isInlneAbove = useRef(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
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
        if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
          if (selection && Range.isCollapsed(selection)) {
            const nextLocation = Editor.before(editor, selection, {
              unit: 'offset',
            });
            const nextAbove = Editor.above(editor, {
              at: nextLocation,
              match: node => Editor.isInline(editor, node as CustomElement),
            });
            console.log('[ nextAbove ]', isInlneAbove.current, nextAbove);
            if (isInlneAbove.current !== !!nextAbove) {
              e.preventDefault();
              Transforms.move(editor, { unit: 'offset', reverse: true });
            }
            if (e.key === 'Backspace' && !nextAbove && isInlneAbove.current) {
              console.log('[ 删除 ]');
              e.preventDefault();
              Transforms.delete(editor, {
                unit: 'character',
              });
            }
            isInlneAbove.current = !!nextAbove;
          }
        }
        if (e.key === 'ArrowRight') {
          if (selection && Range.isCollapsed(selection)) {
            const nextLocation = Editor.after(editor, selection, {
              unit: 'offset',
            });
            const nextAbove = Editor.above(editor, {
              at: nextLocation,
              match: node => Editor.isInline(editor, node as CustomElement),
            });
            console.log('[ nextAbove ]', isInlneAbove.current, nextAbove);
            if (isInlneAbove.current !== !!nextAbove) {
              e.preventDefault();
              Transforms.move(editor, { unit: 'offset' });
            }
            isInlneAbove.current = !!nextAbove;
          }
        }
      }
    },
    [editor]
  );

  return handleKeyDown;
};

export default useKeyDown;
