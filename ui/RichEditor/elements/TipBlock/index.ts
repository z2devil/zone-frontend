import { BlockElementType } from '@/lib/constants';
import { createElementPlugin } from 'ui/RichEditor/utils/elementPlugin';
import TipBlockElement from './element';
import { Element, Transforms } from 'slate';

const tipBlockPlugin = createElementPlugin({
  type: BlockElementType.TIP,
  element: TipBlockElement,
  extendEditor: editor => {
    const { normalizeNode } = editor;

    editor.normalizeNode = entry => {
      normalizeNode(entry);

      const [node, path] = entry;

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
  },
});

export default tipBlockPlugin;
