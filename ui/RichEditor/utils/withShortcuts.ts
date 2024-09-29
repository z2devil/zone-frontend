import { Editor, Element, Point, Range, Transforms } from 'slate';
import { RichEditor } from 'types/slate';
import {
  NON_WRAPPING_ELEMENTS,
  SHORTCUTS_MAP,
  NON_EMPTY_ELEMENTS,
  BlockElementType,
} from '../constants';
import { editorUtils } from './editorUtils';

export const withShortcuts = (editor: RichEditor) => {
  const { insertBreak, insertSoftBreak, deleteBackward, insertText } = editor;

  editor.insertBreak = () => {
    console.log('[ insertBreak ]');

    // 获取上一行的节点
    const block = Editor.above(editor, {
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
    });

    if (!block) return;

    // 获取上一行的节点的父节点
    const parent = Editor.parent(editor, block[1]);

    const prevElementType = block[0].type;

    const prevText = Editor.string(editor, block[1]);

    if (
      [BlockElementType.OL_LIST, BlockElementType.UL_LIST].includes(
        parent[0].type as BlockElementType
      ) &&
      block[0].type === BlockElementType.PARAGRAPH
    ) {
      Transforms.unwrapNodes(editor, {
        match: n =>
          !Editor.isEditor(n) &&
          Element.isElement(n) &&
          n.type === parent[0].type,
        split: true,
      });
      return;
    }

    if (NON_WRAPPING_ELEMENTS.includes(prevElementType)) {
      editorUtils.insertBlockNode(editor, BlockElementType.PARAGRAPH);
      return;
    }

    if (NON_EMPTY_ELEMENTS.includes(prevElementType)) {
      if (prevText === '') {
        Transforms.setNodes(editor, {
          type: BlockElementType.PARAGRAPH,
        });
        return;
      }
    }

    // 代码块
    if (prevText.endsWith('```') && !editorUtils.isElementActive(editor, BlockElementType.CODE_BLOCK)) {
      Transforms.removeNodes(editor, {
        match: n => Element.isElement(n) && Editor.isBlock(editor, n),
      });

      editorUtils.insertBlockNode(editor, BlockElementType.CODE_BLOCK, [
        {
          type: BlockElementType.PARAGRAPH,
          children: [{ text: '' }],
        },
      ]);

      return;
    }

    insertBreak();
  };

  editor.insertSoftBreak = () => {
    console.log('[ insertSoftBreak ]');
    insertSoftBreak();
  };

  editor.insertText = text => {
    const { selection } = editor;

    if (text.endsWith(' ') && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = Editor.above(editor, {
        match: n => Element.isElement(n) && Editor.isBlock(editor, n),
      });
      const path = block ? block[1] : [];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range) + text.slice(0, -1);
      const type = SHORTCUTS_MAP[beforeText];

      if (type && !editorUtils.isElementActive(editor, BlockElementType.CODE_BLOCK)) {
        Transforms.select(editor, range);

        if (!Range.isCollapsed(range)) {
          Transforms.delete(editor);
        }

        // 列表
        if (
          [BlockElementType.UL_LIST, BlockElementType.OL_LIST].includes(type)
        ) {
          const list = {
            type,
            children: [],
          };
          Transforms.setNodes<Element>(
            editor,
            {
              type: BlockElementType.LIST_ITEM,
            },
            {
              match: n => Element.isElement(n) && Editor.isBlock(editor, n),
            }
          );
          Transforms.wrapNodes(editor, list, {
            match: n => !Editor.isEditor(n) && Element.isElement(n),
          });
          return;
        }

        const nextProperties: Partial<Element> = {
          type,
        };

        Transforms.setNodes<Element>(editor, nextProperties, {
          match: n => Element.isElement(n) && Editor.isBlock(editor, n),
        });

        return;
      }
    }

    insertText(text);
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => Element.isElement(n) && Editor.isBlock(editor, n),
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          !Editor.isEditor(block) &&
          Element.isElement(block) &&
          block.type !== BlockElementType.PARAGRAPH &&
          Point.equals(selection.anchor, start)
        ) {
          const newProperties: Partial<Element> = {
            type: BlockElementType.PARAGRAPH,
          };
          Transforms.setNodes(editor, newProperties);

          if (block.type === BlockElementType.UL_LIST) {
            Transforms.unwrapNodes(editor, {
              match: n =>
                !Editor.isEditor(n) &&
                Element.isElement(n) &&
                n.type === BlockElementType.UL_LIST,
              split: true,
            });
          }

          return;
        }
      }

      deleteBackward(...args);
    }
  };

  return editor;
};
