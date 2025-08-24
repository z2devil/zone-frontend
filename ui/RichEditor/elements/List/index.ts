import { BlockElementType } from '@/lib/constants';
import { createElementPlugin } from 'ui/RichEditor/utils/elementPlugin';
import ListElement from './element';
import { Editor, Element, NodeEntry, Path, Range, Transforms } from 'slate';
import { OrderedListElement, UnorderedListElement } from 'types/slate';
import { HistoryEditor } from 'slate-history';

const listPlugin = createElementPlugin({
  type: [BlockElementType.OL_LIST, BlockElementType.UL_LIST],
  element: ListElement,
  extendEditor: editor => {
    const { normalizeNode, deleteBackward } = editor;

    editor.normalizeNode = entry => {
      normalizeNode(entry);

      const [node, path] = entry as NodeEntry<
        OrderedListElement | UnorderedListElement
      >;

      if (
        !Element.isElement(node) ||
        ![BlockElementType.OL_LIST, BlockElementType.UL_LIST].includes(
          node.type
        )
      ) {
        return;
      }

      console.log('[ 是列表 ]', node, path);

      if (!Path.hasPrevious(path)) {
        return;
      }

      const previousEntry = Editor.node(editor, Path.previous(path));
      if (
        !previousEntry ||
        !Element.isElement(previousEntry[0]) ||
        previousEntry[0].type !== node.type
      ) {
        return;
      }

      console.log('[ 合并 ]', previousEntry, entry);

      // 合并
      HistoryEditor.withoutSaving(editor, () => {
        Transforms.mergeNodes(editor, {
          at: path,
        });
      });
    };

    editor.deleteBackward = unit => {
      console.log('[ deleteBackward ]', unit);
      const { selection } = editor;
      if (!selection || !Range.isCollapsed(selection)) {
        return deleteBackward(unit);
      }

      const match = Editor.above(editor, {
        match: n =>
          Element.isElement(n) &&
          Editor.isBlock(editor, n) &&
          [BlockElementType.UL_LIST, BlockElementType.OL_LIST].includes(
            n.type as BlockElementType
          ),
      });
      if (match) {
        Transforms.removeNodes(editor, {
          at: match[1],
          hanging: true,
          voids: true,
        });
        Transforms.insertNodes(editor, {
          type: BlockElementType.PARAGRAPH,
          children: [{ text: '' }],
        });
        return;
      }

      deleteBackward(unit);
    };

    return editor;
  },
});

export default listPlugin;
