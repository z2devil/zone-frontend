import { BlockElementType } from '@/lib/constants';
import { Editor, Element, NodeEntry, Path, Range, Transforms } from 'slate';
import { HistoryEditor } from 'slate-history';
import { OrderedListElement, UnorderedListElement } from 'types/slate';

export const withList = (editor: Editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = entry => {
    normalizeNode(entry);

    const [node, path] = entry as NodeEntry<
      OrderedListElement | UnorderedListElement
    >;

    if (
      !Element.isElement(node) ||
      ![BlockElementType.OL_LIST, BlockElementType.UL_LIST].includes(node.type)
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

  return editor;
};
