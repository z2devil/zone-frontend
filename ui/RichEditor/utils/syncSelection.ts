import { Editor, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

/**
 * 输入前把 editor.selection 同步为当前 DOM 选区。
 *
 * slate-react 只在异步的 selectionchange 中同步选区。点击后立即输入时，
 * beforeinput / compositionstart 可能先于 selectionchange 到达：此时 editor.selection
 * 仍是旧位置，slate-react 会按目标范围插入首个字符后再恢复旧选区，
 * 导致后续输入落到点击前的位置（中文输入法则直接插到旧位置）。
 */
export const syncSelectionFromDOM = (editor: Editor) => {
  if (ReactEditor.isComposing(editor)) return;

  const domSelection = ReactEditor.getWindow(editor).getSelection();
  if (!domSelection || domSelection.rangeCount === 0) return;

  const { anchorNode, focusNode } = domSelection;
  if (
    !anchorNode ||
    !focusNode ||
    !ReactEditor.hasEditableTarget(editor, anchorNode) ||
    !ReactEditor.hasEditableTarget(editor, focusNode)
  ) {
    return;
  }

  const range = ReactEditor.toSlateRange(editor, domSelection, {
    exactMatch: false,
    suppressThrow: true,
  });
  if (!range) return;
  if (editor.selection && Range.equals(range, editor.selection)) return;

  Transforms.select(editor, range);
};
