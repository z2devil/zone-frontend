import { useCallback } from 'react';
import { Editor, Element } from 'slate';
import { useSelected } from 'slate-react';
import { RichEditor } from 'types/slate';

export const useCut = (editor: RichEditor, readOnly = false) => {
  const { selection } = editor;

  const selected = useSelected();

  const handleCut = useCallback(() => {
    const selectedElement = Editor.above(editor, {
      match: node => {
        if (!Element.isElement(node)) return false;
        return Editor.isBlock(editor, node) && Editor.isVoid(editor, node);
      },
    });

    console.log('[ handleCut ]', selectedElement, selection, selected);

    if (!selectedElement) return false;
    return true;
  }, [editor, selected, selection]);

  if (readOnly) return;

  return handleCut;
};
