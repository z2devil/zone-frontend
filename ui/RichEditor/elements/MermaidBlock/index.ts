import { Element, Text, Transforms } from 'slate';
import { BlockElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import MermaidBlockElement from './element';

const mermaidBlockPlugin = createPlugin({
  name: 'mermaidBlock',
  element: {
    type: BlockElementType.MERMAID,
    component: MermaidBlockElement,
  },
  extendEditor: editor => {
    const { normalizeNode } = editor;

    editor.normalizeNode = entry => {
      normalizeNode(entry);

      const [node, path] = entry;
      if (!Element.isElement(node) || node.type !== BlockElementType.MERMAID) {
        return;
      }

      const invalidLineIndex = node.children.findIndex(
        child =>
          !Element.isElement(child) ||
          child.type !== BlockElementType.CODE_LINE_BLOCK
      );

      if (invalidLineIndex !== -1) {
        const childPath = [...path, invalidLineIndex];
        const child = node.children[invalidLineIndex];

        if (Text.isText(child)) {
          Transforms.wrapNodes(
            editor,
            { type: BlockElementType.CODE_LINE_BLOCK, children: [] },
            { at: childPath }
          );
        } else {
          Transforms.setNodes(
            editor,
            { type: BlockElementType.CODE_LINE_BLOCK },
            { at: childPath }
          );
        }
      }
    };

    return editor;
  },
});

export default mermaidBlockPlugin;
