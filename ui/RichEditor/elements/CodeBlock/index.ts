import { BlockElementType } from '@/lib/constants';
import { createElementPlugin } from 'ui/RichEditor/utils/elementPlugin';
import CodeBlockElement from './element';
import { Element, Transforms } from 'slate';

const codeBlockPlugin = createElementPlugin({
  type: BlockElementType.CODE_BLOCK,
  element: CodeBlockElement,
  extendEditor: editor => {
    const { normalizeNode } = editor;

    editor.normalizeNode = entry => {
      normalizeNode(entry);

      const [node, path] = entry;

      if (
        !Element.isElement(node) ||
        node.type !== BlockElementType.CODE_BLOCK
      ) {
        return;
      }

      // Children should all be code lines
      let nonCodeLinePath;
      let nonCodeLineNode;
      node.children.some((child, index) => {
        if (child.type !== BlockElementType.CODE_LINE_BLOCK) {
          nonCodeLinePath = [...path, index];
          nonCodeLineNode = child;
          return true;
        }
      });

      if (nonCodeLineNode) {
        Transforms.setNodes(
          editor,
          { type: BlockElementType.CODE_LINE_BLOCK },
          { at: nonCodeLinePath }
        );
      }
    };

    return editor;
  },
});

export default codeBlockPlugin;
