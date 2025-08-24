import { Editor, Element, Node, Path, Range, Transforms } from 'slate';
import { RichEditor } from 'types/slate';
import { editorUtils } from '../utils/editorUtils';
import {
  BlockElementType,
  NON_WRAPPING_ELEMENTS,
  SHORTCUTS_MAP,
} from '@/lib/constants';

export const withShortcuts = (editor: RichEditor) => {
  const { insertBreak, deleteBackward, insertText } = editor;

  editor.insertBreak = () => {
    console.log('[ insertBreak ]');

    // 获取当前节点（未产生 break 时）
    const block = Editor.above(editor, {
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
    });

    if (!block) return;

    // 获取当前的节点的父节点
    const parent = Editor.parent(editor, block[1]);
    // 获取当前节点的类型
    const elementType = block[0].type;
    // 获取当前节点的文本
    const text = Editor.string(editor, block[1]);

    // 如果当前节点的类型是 list-item，且无内容，则拆分
    if (elementType === BlockElementType.LIST_ITEM && text === '') {
      console.log('[ 拆分 ]', parent, block);
      Editor.withoutNormalizing(editor, () => {
        Transforms.splitNodes(editor, {
          at: block[1],
          mode: 'highest',
        });
        Transforms.unwrapNodes(editor, {
          mode: 'highest',
        });
        Transforms.setNodes(
          editor,
          {
            type: BlockElementType.PARAGRAPH,
          },
          {
            mode: 'highest',
          }
        );
      });
      return;
    }

    // 如果当前节点的类型是非包裹元素，则插入段落
    if (NON_WRAPPING_ELEMENTS.includes(elementType)) {
      editorUtils.insertBlockNode(editor, BlockElementType.PARAGRAPH);
      return;
    }

    // 代码块
    if (
      text.endsWith('```') &&
      !editorUtils.isElementActive(editor, BlockElementType.CODE_BLOCK)
    ) {
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

      if (
        type &&
        !editorUtils.isElementActive(editor, BlockElementType.CODE_BLOCK)
      ) {
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
          Transforms.setNodes(
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

        Transforms.setNodes(editor, nextProperties, {
          match: n => Element.isElement(n) && Editor.isBlock(editor, n),
        });

        return;
      }
    }

    insertText(text);
  };

  editor.deleteBackward = unit => {
    const { selection } = editor;
    if (!selection || !Range.isCollapsed(selection)) {
      return deleteBackward(unit);
    }

    const match = Editor.above(editor, {
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
    });
    if (!match || !Editor.isStart(editor, selection.anchor, match[1])) {
      return deleteBackward(unit);
    }

    const [, path] = match;

    // 如果有前一个兄弟节点，直接删除
    if (Path.hasPrevious(path)) {
      deleteBackward(unit);
      return;
    }

    // 如果下一个节点存在，说明当前行为空且下方有内容，直接移除当前行
    if (Node.has(editor, Path.next(path))) {
      Transforms.removeNodes(editor, {
        at: path,
        hanging: true,
        voids: true,
      });
      return;
    }

    // 如果父节点不是 Editor，说明当前在包裹元素内，拆包
    const parent = Node.parent(editor, path);
    if (!Editor.isEditor(parent)) {
      Transforms.unwrapNodes(editor, {
        at: Path.parent(path),
        split: true,
      });
      return;
    }

    // 其他情况，默认删除
    deleteBackward(unit);
  };

  return editor;
};
