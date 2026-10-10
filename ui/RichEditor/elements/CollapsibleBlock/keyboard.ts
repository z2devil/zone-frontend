import { Editor, Element, Node, Path, Range, Transforms } from 'slate';
import { BlockElementType } from '@/lib/constants';

const isType = (node: Node | undefined, type: BlockElementType) =>
  Element.isElement(node) && node.type === type;

const isEmptyParagraph = (node: Node | undefined) =>
  isType(node, BlockElementType.PARAGRAPH) && Node.string(node!) === '';

const emptyParagraph = () =>
  ({
    type: BlockElementType.PARAGRAPH,
    children: [{ text: '' }],
  }) as Element;

/**
 * 在当前选区所在（最内层）折叠块之后插入段落并选中
 * @returns 是否处理
 */
export const exitCollapsibleBlock = (editor: Editor) => {
  const entry = Editor.above(editor, {
    match: n => isType(n, BlockElementType.COLLAPSIBLE_BLOCK),
  });
  if (!entry) return false;
  Transforms.insertNodes(editor, emptyParagraph(), {
    at: Path.next(entry[1]),
    select: true,
  });
  return true;
};

/**
 * Enter：
 * - 标题中：不拆分标题，光标移到内容第一行开头（收起时先展开）
 * - 内容最后一行为空段落：跳出折叠块，在其后插入段落
 * @returns 是否处理
 */
export const handleCollapsibleBreak = (editor: Editor) => {
  const { selection } = editor;
  if (!selection) return false;

  const titleEntry = Editor.above(editor, {
    match: n => isType(n, BlockElementType.COLLAPSIBLE_BLOCK_TITLE),
  });
  if (titleEntry) {
    if (Range.isExpanded(selection)) Transforms.delete(editor);
    const blockPath = Path.parent(titleEntry[1]);
    const block = Node.get(editor, blockPath);
    if (Element.isElement(block) && 'collapsed' in block && block.collapsed) {
      Transforms.setNodes(editor, { collapsed: false }, { at: blockPath });
    }
    Transforms.select(editor, Editor.start(editor, [...blockPath, 1]));
    return true;
  }

  if (!Range.isCollapsed(selection)) return false;

  const lineEntry = Editor.above(editor, {
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
  });
  if (!lineEntry || !isEmptyParagraph(lineEntry[0])) return false;

  const [, linePath] = lineEntry;
  const contentPath = Path.parent(linePath);
  const content = Node.get(editor, contentPath);
  if (
    !Element.isElement(content) ||
    content.type !== BlockElementType.COLLAPSIBLE_BLOCK_CONTENT ||
    linePath[linePath.length - 1] !== content.children.length - 1
  ) {
    return false;
  }

  const blockPath = Path.parent(contentPath);
  Editor.withoutNormalizing(editor, () => {
    // 内容至少保留一行
    if (content.children.length > 1) {
      Transforms.removeNodes(editor, { at: linePath });
    }
    Transforms.insertNodes(editor, emptyParagraph(), {
      at: Path.next(blockPath),
      select: true,
    });
  });
  return true;
};

/**
 * Backspace（选区折叠时）：
 * - 块开头（标题开头）：标题与内容都为空时整个块转为段落，否则不做任何事
 * - 内容开头：首行为空且还有其他行时删除首行，否则光标移到标题末尾，
 *   避免默认规则把内容首行整行删除或拆出折叠块
 * - 收起的折叠块之后的行开头：不并入不可见的内容，空行删除，光标移到标题末尾
 * @returns 是否处理
 */
export const handleCollapsibleDeleteBackward = (editor: Editor) => {
  const { selection } = editor;
  if (!selection || !Range.isCollapsed(selection)) return false;

  // 紧跟在收起的折叠块之后的行：不并入不可见的内容，空行删除，光标移到标题末尾
  const lineEntry = Editor.above(editor, {
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
  });
  if (
    lineEntry &&
    Path.hasPrevious(lineEntry[1]) &&
    Editor.isStart(editor, selection.anchor, lineEntry[1])
  ) {
    const previousPath = Path.previous(lineEntry[1]);
    const previous = Node.get(editor, previousPath);
    if (
      isType(previous, BlockElementType.COLLAPSIBLE_BLOCK) &&
      'collapsed' in previous &&
      previous.collapsed
    ) {
      if (isEmptyParagraph(lineEntry[0])) {
        Transforms.removeNodes(editor, { at: lineEntry[1] });
      }
      Transforms.select(editor, Editor.end(editor, [...previousPath, 0]));
      return true;
    }
  }

  const blockEntry = Editor.above(editor, {
    match: n => isType(n, BlockElementType.COLLAPSIBLE_BLOCK),
  });
  if (!blockEntry) return false;

  const [block, blockPath] = blockEntry;
  const titlePath = [...blockPath, 0];
  const contentPath = [...blockPath, 1];

  if (Editor.isStart(editor, selection.anchor, blockPath)) {
    const content = Node.get(editor, contentPath);
    const isEmpty =
      Element.isElement(block) &&
      Node.string(Node.get(editor, titlePath)) === '' &&
      Element.isElement(content) &&
      content.children.length === 1 &&
      isEmptyParagraph(content.children[0]);

    if (isEmpty) {
      Editor.withoutNormalizing(editor, () => {
        Transforms.removeNodes(editor, { at: blockPath });
        Transforms.insertNodes(editor, emptyParagraph(), {
          at: blockPath,
          select: true,
        });
      });
    }
    return true;
  }

  if (
    Node.has(editor, contentPath) &&
    Editor.isStart(editor, selection.anchor, contentPath)
  ) {
    const content = Node.get(editor, contentPath) as Element;
    if (content.children.length > 1 && isEmptyParagraph(content.children[0])) {
      Transforms.removeNodes(editor, { at: [...contentPath, 0] });
      Transforms.select(editor, Editor.start(editor, contentPath));
    } else {
      Transforms.select(editor, Editor.end(editor, titlePath));
    }
    return true;
  }

  return false;
};
