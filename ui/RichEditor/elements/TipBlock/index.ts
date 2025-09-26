import { BlockElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import TipBlockElement from './element';
import { Element, Transforms } from 'slate';

const tipBlockPlugin = createPlugin({
  name: 'tip',
  element: {
    type: BlockElementType.TIP,
    component: TipBlockElement,
  },
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
