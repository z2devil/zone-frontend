import { BlockElementType } from '@/lib/constants';
import { Editor, Element, NodeEntry, Transforms } from 'slate';
import { TipBlockElement } from 'types/slate';

export const withNormalizeTipBlock = (editor: Editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = entry => {
    normalizeNode(entry);

    const [node, path] = entry as NodeEntry<TipBlockElement>;

    if (!Element.isElement(node) || node.type !== BlockElementType.TIP) {
      return;
    }

    // Children should all be code lines
    let nonCodeLinePath;
    let nonCodeLineNode;
    node.children.some((child, index) => {
      if (child.type !== BlockElementType.PARAGRAPH) {
        nonCodeLinePath = [...path, index];
        nonCodeLineNode = child;
        return true;
      }
    });

    if (nonCodeLineNode) {
      Transforms.setNodes(
        editor,
        { type: BlockElementType.PARAGRAPH },
        { at: nonCodeLinePath }
      );
    }
  };

  return editor;
};
