import { RichEditor } from 'types/slate';
import { Node } from 'slate';

export const withElementClick = (
  editor: RichEditor,
  callback: (element: Node) => void
) => {
  const { onElementClick } = editor;

  editor.onElementClick = target => {
    callback(target);
    onElementClick && onElementClick(target);
  };

  return editor;
};
