import { useCallback } from 'react';
import { Editor } from 'slate';
import { useSelected } from 'slate-react';
import { RichEditor, CustomElement } from 'types/slate';

const useCut = (editor: RichEditor, readOnly = false) => {
  const { selection } = editor;

  const selected = useSelected();

  const handleCut = useCallback(() => {
    const selectedElement = Editor.above(editor, {
      match: node =>
        Editor.isBlock(editor, node as CustomElement) &&
        Editor.isVoid(editor, node as CustomElement),
    });

    console.log('[ handleCut ]', selectedElement, selection, selected);

    if (!selectedElement) return false;
    return true;
  }, [editor, selected, selection]);

  if (readOnly) return;

  return handleCut;
};

export default useCut;
