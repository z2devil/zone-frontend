import { BlockElementType } from '@/lib/constants';
import { createElementPlugin } from 'ui/RichEditor/utils/elementPlugin';
import LayoutBlockElement from './element';
import { Editor, Element, Range, Transforms } from 'slate';

const layoutBlockPlugin = createElementPlugin({
  type: BlockElementType.LAYOUT,
  element: LayoutBlockElement,
  extendEditor: editor => {
    const { deleteBackward, isEmpty, normalizeNode } = editor;

    editor.normalizeNode = entry => {
      normalizeNode(entry);

      const [node, path] = entry;

      if (!Element.isElement(node) || node.type !== BlockElementType.LAYOUT)
        return;

      const totalWidth = node.children.reduce(
        (acc, child) => acc + child.width,
        0
      );

      if (Math.floor(totalWidth) !== 100) {
        const lastChild = node.children[node.children.length - 1];
        const remainingWidth = 100 - totalWidth;

        // 调整最后一个子节点的宽度
        Transforms.setNodes(
          editor,
          { width: lastChild.width + remainingWidth },
          { at: path.concat(node.children.length - 1) }
        );
      }

      node.children.forEach((child, index) => {
        if (
          Element.isElement(child) &&
          child.type !== BlockElementType.LAYOUT_ITEM
        ) {
          Transforms.removeNodes(editor, { at: path.concat(index) });
        }
      });

      if (node.children.length < 2) {
        editor.withoutNormalizing(() => {
          Transforms.unwrapNodes(editor, { at: path });
          Transforms.unwrapNodes(editor, { at: path });
        });

        return;
      }

      if (node.children.length === 0) {
        Transforms.removeNodes(editor, { at: path });

        return;
      }
    };

    editor.deleteBackward = unit => {
      if (editor.selection && Range.isCollapsed(editor.selection)) {
        const entry = Editor.above(editor, {
          match: n =>
            Element.isElement(n) && n.type === BlockElementType.LAYOUT,
        });

        if (entry) {
          const [node, path] = entry;

          if (node.children.length > 1) return deleteBackward(unit);

          const isStart = Editor.isStart(
            editor,
            editor.selection?.anchor,
            path
          );

          if (isStart) return;
        }
      }

      deleteBackward(unit);
    };

    editor.isEmpty = (element: any) => {
      if (element?.type && element.type === BlockElementType.LAYOUT) {
        return element.children.length === 1 && isEmpty(element.children[0]);
      }

      return isEmpty(element);
    };

    return editor;
  },
});

export default layoutBlockPlugin;
