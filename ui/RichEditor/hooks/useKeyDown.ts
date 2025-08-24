import { KeyboardEvent, MutableRefObject, useCallback, useRef } from 'react';
import { Editor, Element, Path, Range, Transforms } from 'slate';
import { RichEditor, CustomElement } from 'types/slate';
import { editorUtils } from '../utils';
import { BlockElementType, InlineElementType, MarkType } from '@/lib/constants';

const ACTIONS: Record<string, (editor: RichEditor) => void> = {
  b: editor => {
    editorUtils.toggleMark(editor, MarkType.BOLD);
  },
  i: editor => {
    editorUtils.toggleMark(editor, MarkType.ITALIC);
  },
  u: editor => {
    editorUtils.toggleMark(editor, MarkType.UNDERLINE);
  },
  d: editor => {
    editorUtils.toggleMark(editor, MarkType.STRIKETHROUGH);
  },
  e: editor => {
    editorUtils.wrapElement(editor, InlineElementType.CODE_SPAN);
  },
};

export const useKeyDown = (editor: RichEditor, readOnly = false) => {
  // 用于记录上一次按下的键盘按键是否是内联元素
  const isInlneAbove = useRef(false);

  // 用于记录上一次按下的键盘按键是否是空元素
  const isVoidAbove = useRef(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (readOnly) return;

      const { metaKey, ctrlKey, altKey, shiftKey, key } = e;
      const isModifierKey = metaKey || ctrlKey || altKey || shiftKey;

      if (metaKey || ctrlKey) {
        const action = ACTIONS[key];
        if (
          action &&
          !editorUtils.isElementActive(editor, BlockElementType.CODE_BLOCK)
        ) {
          e.preventDefault();
          action(editor);
        }
      } else if (shiftKey && key === 'Enter') {
        handleShiftEnter(editor, e);
      } else if (!isModifierKey) {
        handleSingleKey(editor, e, { isInlneAbove, isVoidAbove });
      }
    },
    [editor, readOnly]
  );

  return handleKeyDown;
};

const handleShiftEnter = (editor: RichEditor, e: KeyboardEvent) => {
  e.preventDefault();
  const { selection } = editor;
  if (!selection) return;
  // 判断当前选中节点是否有包裹元素，如果有，则在包裹元素外面的下方插入一个空行
  const nodeEntry = Editor.above(editor, {
    match: node => Element.isElement(node),
  });
  if (nodeEntry) {
    const [, path] = nodeEntry;
    const [parentNode, parentPath] = Editor.node(editor, Path.parent(path));
    if (
      [BlockElementType.CODE_BLOCK, BlockElementType.TIP].includes(
        parentNode.type as any
      )
    ) {
      const nextPath = Path.next(parentPath);
      Transforms.insertNodes(
        editor,
        {
          type: BlockElementType.PARAGRAPH,
          children: [{ text: '' }],
        },
        {
          at: nextPath,
        }
      );
      // 将光标移动到新插入的空行中
      Transforms.select(editor, nextPath);
      return;
    }
  }
};

/**
 * 处理单个键盘按键
 */
const handleSingleKey = (
  editor: Editor,
  e: KeyboardEvent,
  {
    isInlneAbove,
    isVoidAbove,
  }: {
    isInlneAbove: MutableRefObject<boolean>;
    isVoidAbove: MutableRefObject<boolean>;
  }
) => {
  const { selection } = editor;
  if (!selection) return;
  if (e.key === 'Tab') {
    e.preventDefault();
    Editor.insertText(editor, '  ');
  }
  if (e.key === 'Backspace') {
    if (!selection || !Range.isCollapsed(selection)) return;
    const currentEntry = Editor.above(editor, {
      match: node => Element.isElement(node),
    });
    const beforeSelectionPoint = Editor.before(editor, selection, {
      unit: 'offset',
    });
    const beforeEntry = Editor.above(editor, {
      at: beforeSelectionPoint,
      match: node => Element.isElement(node),
    });
    console.log('[ beforeEntry ]', beforeEntry, isInlneAbove.current);
    if (!currentEntry || !beforeEntry) return;
    const [, currentPath] = currentEntry;
    const [beforeNode] = beforeEntry;
    // 内联节点处理
    const isInline = Editor.isInline(editor, beforeNode as CustomElement);
    if (isInline && isInlneAbove.current !== !!beforeNode) {
      e.preventDefault();
      Transforms.move(editor, { unit: 'offset', reverse: true });
    }
    if (!isInline && isInlneAbove.current) {
      const [currentNode, currentPath] = currentEntry;
      if (
        Editor.isInline(editor, currentNode as CustomElement) &&
        currentNode.children.length === 1 &&
        currentNode.children[0].text === ''
      ) {
        e.preventDefault();
        Transforms.removeNodes(editor, {
          at: currentPath,
        });
      }
    }
    isInlneAbove.current = isInline;
    // 块级节点处理
    const parentPath = Path.parent(currentPath);
    const parentEntry = Editor.node(editor, parentPath);
    const [parentNode] = parentEntry;
    if (
      [BlockElementType.CODE_BLOCK].includes(
        parentNode.type as BlockElementType
      )
    ) {
      if (parentNode.children?.length !== 1) return;
      if (Editor.string(editor, parentPath) === '') {
        e.preventDefault();
        Transforms.unwrapNodes(editor, {
          at: parentPath,
        });
      }
    }
  }
  if (e.key === 'Enter') {
    if (!selection || !Range.isCollapsed(selection)) return;
    const above = Editor.above<Element>(editor, {
      match: node => {
        if (Element.isElement(node)) return true;
        return false;
      },
    });
    if (!above) return;
    const [node, path] = above;
    if (!Editor.isVoid(editor, node)) return;
    const nextPath = Path.next(path);
    Transforms.insertNodes(
      editor,
      {
        type: BlockElementType.PARAGRAPH,
        children: [{ text: '' }],
      },
      {
        at: nextPath,
      }
    );
    Transforms.select(editor, nextPath);
    e.preventDefault();
  }
  if (e.key === 'ArrowLeft') {
    if (selection && Range.isCollapsed(selection)) {
      const nextLocation = Editor.before(editor, selection, {
        unit: 'offset',
      });
      const nextAbove = Editor.above(editor, {
        at: nextLocation,
        match: node => {
          if (!Element.isElement(node)) return false;
          return Editor.isInline(editor, node);
        },
      });
      if (isInlneAbove.current !== !!nextAbove) {
        e.preventDefault();
        Transforms.move(editor, { unit: 'offset', reverse: true });
      }
      isInlneAbove.current = !!nextAbove;
    }
  }
  if (e.key === 'ArrowRight') {
    if (selection && Range.isCollapsed(selection)) {
      const nextLocation = Editor.after(editor, selection, {
        unit: 'offset',
      });
      const nextAbove = Editor.above(editor, {
        at: nextLocation,
        match: node => {
          if (!Element.isElement(node)) return false;
          return Editor.isInline(editor, node);
        },
      });
      if (isInlneAbove.current !== !!nextAbove) {
        e.preventDefault();
        Transforms.move(editor, { unit: 'offset' });
      }
      isInlneAbove.current = !!nextAbove;
    }
  }
  if (e.key === 'ArrowUp') {
    if (selection && Range.isCollapsed(selection)) {
      try {
        const path = Editor.path(editor, selection);
        const nextPath = Path.previous(path);
        const nextAbove = Editor.above(editor, {
          at: nextPath,
          match: node => {
            if (!Element.isElement(node)) return false;
            return Editor.isBlock(editor, node) && Editor.isVoid(editor, node);
          },
        });
        if (isVoidAbove.current !== !!nextAbove) {
          e.preventDefault();
          Transforms.move(editor, { unit: 'offset', reverse: true });
        }
        isVoidAbove.current = !!nextAbove;
        if (nextAbove) {
          Transforms.select(editor, nextPath);
          e.preventDefault();
        }
      } catch (error) {
        // do nothing
      }
    }
  }
  if (e.key === 'ArrowDown') {
    if (selection && Range.isCollapsed(selection)) {
      try {
        const path = Editor.path(editor, selection);
        const nextPath = Path.next(path);
        console.log('[ nextPath ]', Path.next(nextPath));
        nextPath[nextPath.length - 2] > 0 && nextPath[nextPath.length - 2]++;
        const nextAbove = Editor.above(editor, {
          at: nextPath,
          match: node => {
            if (!Element.isElement(node)) return false;
            return Editor.isBlock(editor, node) && Editor.isVoid(editor, node);
          },
        });
        if (isVoidAbove.current !== !!nextAbove) {
          e.preventDefault();
          Transforms.move(editor, { unit: 'offset' });
        }
        isVoidAbove.current = !!nextAbove;
        if (nextAbove) {
          Transforms.select(editor, nextPath);
          e.preventDefault();
        }
      } catch (error) {
        // do nothing
      }
    }
  }
};
