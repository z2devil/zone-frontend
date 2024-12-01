import { BlockElementType } from '@/lib/constants';
import { Editor, Element, Range, Transforms } from 'slate';
import { LayoutBlockElement } from 'types/slate';

export const withColumn = (editor: Editor) => {
  const { deleteBackward, isEmpty, normalizeNode } = editor;

  editor.normalizeNode = entry => {
    normalizeNode(entry);

    const [n, path] = entry;

    if (!Element.isElement(n) || n.type !== BlockElementType.LAYOUT) return;

    const node = n as LayoutBlockElement;

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
        match: n => Element.isElement(n) && n.type === BlockElementType.LAYOUT,
      });

      if (entry) {
        const [node, path] = entry;

        if (node.children.length > 1) return deleteBackward(unit);

        const isStart = Editor.isStart(editor, editor.selection?.anchor, path);

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
};
