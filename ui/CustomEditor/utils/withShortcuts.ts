import { Editor, Element, Point, Range, Transforms } from 'slate';
import { CustomEditor } from 'types/slate';
import { NON_WRAPPING_ELEMENTS, SHORTCUTS_MAP } from '../constans';
import { ElementType } from 'types';

const withShortcuts = (editor: CustomEditor) => {
  const { insertBreak, insertSoftBreak, deleteBackward, insertText } = editor;

  editor.insertBreak = () => {
    console.log('[ insertBreak ]');

    // 获取上一行的节点
    const block = Editor.above(editor, {
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
    });

    if (!block) return;

    const prevElementType = block[0].type;

    const prevText = Editor.string(editor, block[1]);

    if (NON_WRAPPING_ELEMENTS.includes(prevElementType)) {
      Transforms.insertNodes(editor, {
        type: ElementType.PARAGRAPH,
        children: [
          {
            type: ElementType.TEXT,
            text: '',
          },
        ],
      });

      return;
    }

    if (prevElementType === ElementType.LIST_ITEM) {
      if (prevText === '') {
        Transforms.setNodes(editor, {
          type: ElementType.PARAGRAPH,
        });
        return;
      }
    }

    if (prevText.endsWith('```')) {
      console.log('[ 代码块 ]');

      const codeBlock: Partial<Element> = {
        type: ElementType.CODE_BLOCK,
      };

      Transforms.setNodes(editor, codeBlock, {
        match: n => Element.isElement(n) && Editor.isBlock(editor, n),
      });

      Transforms.insertNodes(editor, {
        type: ElementType.PARAGRAPH,
        children: [
          {
            type: ElementType.TEXT,
            text: '',
          },
        ],
      });

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

      if (type) {
        Transforms.select(editor, range);

        if (!Range.isCollapsed(range)) {
          Transforms.delete(editor);
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
          block.type !== 'paragraph' &&
          Point.equals(selection.anchor, start)
        ) {
          const newProperties: Partial<Element> = {
            type: ElementType.PARAGRAPH,
          };
          Transforms.setNodes(editor, newProperties);

          if (block.type === ElementType.LIST_ITEM) {
            Transforms.unwrapNodes(editor, {
              match: n =>
                !Editor.isEditor(n) &&
                Element.isElement(n) &&
                n.type === ElementType.LIST_ITEM,
              split: true,
            });
          }

          return;
        }
      }

      deleteBackward(...args);
    }
  };

  const { isVoid } = editor;

  editor.isVoid = element => {
    if (element.type === ElementType.CODE_BLOCK) {
      return true;
    }
    return isVoid(element);
  };

  return editor;
};

export { withShortcuts };
