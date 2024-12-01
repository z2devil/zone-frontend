import { BlockElementType } from '@/lib/constants';
import { Editor, Element, Range, Transforms } from 'slate';
import { LayoutBlockElement, LayoutItemBlockElement } from 'types/slate';

export const withColumn = (editor: Editor) => {
  const { deleteBackward, isEmpty, normalizeNode } = editor;

  editor.normalizeNode = entry => {
    const [n, path] = entry;

    if (Element.isElement(n) && n.type === BlockElementType.LAYOUT) {
      const node = n as LayoutBlockElement;

      if (
        !node.children.some(
          child =>
            Element.isElement(child) && child.type === BlockElementType.LAYOUT
        )
      ) {
        Transforms.removeNodes(editor, { at: path });

        return;
      }

      if (node.children.length < 2) {
        editor.withoutNormalizing(() => {
          Transforms.unwrapNodes(editor, { at: path });
          Transforms.unwrapNodes(editor, { at: path });
        });

        return;
      }

      // const prevChildrenCnt = node.children.length;
      // const currentLayout = node.layout;

      // if (currentLayout) {
      //   const currentChildrenCnt = currentLayout.length;

      //   const groupPathRef = createPathRef(editor, path);

      //   if (prevChildrenCnt === 2 && currentChildrenCnt === 3) {
      //     const lastChildPath = getLastChildPath(entry);

      //     insertColumn(editor, {
      //       at: lastChildPath,
      //     });

      //     setColumnWidth(editor, groupPathRef, currentLayout);

      //     return;
      //   }
      //   if (prevChildrenCnt === 3 && currentChildrenCnt === 2) {
      //     moveMiddleColumn(editor, entry, { direction: 'left' });
      //     setColumnWidth(editor, groupPathRef, currentLayout);

      //     return;
      //   }
      //   if (prevChildrenCnt === currentChildrenCnt) {
      //     setColumnWidth(editor, groupPathRef, currentLayout);

      //     return;
      //   }
      // }
    }
    if (Element.isElement(n) && n.type === BlockElementType.LAYOUT) {
      const node = n as LayoutItemBlockElement;

      if (node.children.length === 0) {
        Transforms.removeNodes(editor, { at: path });

        return;
      }
    }

    return normalizeNode(entry);
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
