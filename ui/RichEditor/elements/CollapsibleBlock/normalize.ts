import {
  Editor,
  Element,
  Node,
  NodeEntry,
  Path,
  Text,
  Transforms,
} from 'slate';
import { BlockElementType } from '@/lib/constants';

/**
 * 折叠块结构规则（只移动/包裹/合并，不删除任何子节点）：
 * - collapsible-block 的子节点固定为 [title, content]；
 *   缺失时补空节点，顺序颠倒时移动，多余子节点按文档顺序并入 content，
 *   多余的 title/content 解包后同样并入 content。
 * - title 只保留一个段落：标题类块转为段落，其他块与多余段落移入 content。
 * - content 至少有一个块；散落的文本/行内节点包成段落。
 * - 脱离折叠块的 title/content 解包为普通块。
 *
 * 每次只做一步修正并返回 true，由 Slate 继续对脏路径重复 normalize。
 * 需在 Slate 核心 normalize 之前执行：核心规则会删除与首个子节点
 * 块/行内属性不一致的兄弟节点，先包裹可避免数据丢失。
 */

const COLLAPSIBLE_TYPES: string[] = [
  BlockElementType.COLLAPSIBLE_BLOCK,
  BlockElementType.COLLAPSIBLE_BLOCK_TITLE,
  BlockElementType.COLLAPSIBLE_BLOCK_CONTENT,
];

const TITLE_CONVERTIBLE_TYPES: string[] = [
  BlockElementType.HEADING_1,
  BlockElementType.HEADING_2,
  BlockElementType.HEADING_3,
  BlockElementType.HEADING_4,
  BlockElementType.HEADING_5,
  BlockElementType.HEADING_6,
];

const isType = (node: Node | undefined, type: BlockElementType) =>
  Element.isElement(node) && node.type === type;

const isInlineOrText = (editor: Editor, node: Node) =>
  Text.isText(node) ||
  (Element.isElement(node) && Editor.isInline(editor, node));

const emptyParagraph = () =>
  ({
    type: BlockElementType.PARAGRAPH,
    children: [{ text: '' }],
  }) as Element;

const wrapper = (type: BlockElementType) =>
  ({ type, children: [] }) as unknown as Element;

/** 将第一个散落的文本/行内子节点包成段落 */
const wrapLooseInline = (editor: Editor, node: Element, path: Path) => {
  const index = node.children.findIndex(child => isInlineOrText(editor, child));
  if (index === -1) return false;
  Transforms.wrapNodes(editor, wrapper(BlockElementType.PARAGRAPH), {
    at: [...path, index],
  });
  return true;
};

const normalizeTitle = (editor: Editor, node: Element, path: Path) => {
  const parent = Node.parent(editor, path);
  if (!isType(parent, BlockElementType.COLLAPSIBLE_BLOCK)) {
    Transforms.unwrapNodes(editor, { at: path });
    return true;
  }
  if (wrapLooseInline(editor, node, path)) return true;

  // 多余子节点从最后一个开始移到标题之后，保持原顺序，再由外层并入 content
  if (node.children.length > 1) {
    Transforms.moveNodes(editor, {
      at: [...path, node.children.length - 1],
      to: Path.next(path),
    });
    return true;
  }

  const [first] = node.children;
  if (!Element.isElement(first) || first.type === BlockElementType.PARAGRAPH) {
    return false;
  }
  if (TITLE_CONVERTIBLE_TYPES.includes(first.type)) {
    Transforms.setNodes(
      editor,
      { type: BlockElementType.PARAGRAPH },
      { at: [...path, 0] }
    );
    return true;
  }
  Editor.withoutNormalizing(editor, () => {
    Transforms.moveNodes(editor, { at: [...path, 0], to: Path.next(path) });
    Transforms.insertNodes(editor, emptyParagraph(), { at: [...path, 0] });
  });
  return true;
};

const normalizeContent = (editor: Editor, node: Element, path: Path) => {
  const parent = Node.parent(editor, path);
  if (!isType(parent, BlockElementType.COLLAPSIBLE_BLOCK)) {
    Transforms.unwrapNodes(editor, { at: path });
    return true;
  }
  return wrapLooseInline(editor, node, path);
};

const normalizeBlock = (editor: Editor, node: Element, path: Path) => {
  if (wrapLooseInline(editor, node, path)) return true;

  const { children } = node;

  // 1. 标题必须在第一位
  if (!isType(children[0], BlockElementType.COLLAPSIBLE_BLOCK_TITLE)) {
    const titleIndex = children.findIndex(child =>
      isType(child, BlockElementType.COLLAPSIBLE_BLOCK_TITLE)
    );
    if (titleIndex !== -1) {
      Transforms.moveNodes(editor, {
        at: [...path, titleIndex],
        to: [...path, 0],
      });
    } else {
      Transforms.insertNodes(
        editor,
        {
          type: BlockElementType.COLLAPSIBLE_BLOCK_TITLE,
          children: [emptyParagraph()],
        } as Element,
        { at: [...path, 0] }
      );
    }
    return true;
  }

  // 2. 多余的标题解包，其段落随后并入 content
  const extraTitleIndex = children.findIndex(
    (child, index) =>
      index > 0 && isType(child, BlockElementType.COLLAPSIBLE_BLOCK_TITLE)
  );
  if (extraTitleIndex !== -1) {
    Transforms.unwrapNodes(editor, { at: [...path, extraTitleIndex] });
    return true;
  }

  // 3. 内容必须存在
  const contentIndex = children.findIndex(child =>
    isType(child, BlockElementType.COLLAPSIBLE_BLOCK_CONTENT)
  );
  if (contentIndex === -1) {
    if (children.length === 1) {
      Transforms.insertNodes(
        editor,
        {
          type: BlockElementType.COLLAPSIBLE_BLOCK_CONTENT,
          children: [emptyParagraph()],
        } as Element,
        { at: [...path, 1] }
      );
    } else {
      Transforms.wrapNodes(
        editor,
        wrapper(BlockElementType.COLLAPSIBLE_BLOCK_CONTENT),
        { at: [...path, 1] }
      );
    }
    return true;
  }

  // 4. content 之前的多余块：从紧邻 content 的开始移入 content 开头，保持顺序
  if (contentIndex > 1) {
    Transforms.moveNodes(editor, {
      at: [...path, contentIndex - 1],
      to: [...path, contentIndex, 0],
    });
    return true;
  }

  // 5. content 之后的多余块：多余 content 解包，其它块移入 content 末尾
  if (children.length > 2) {
    const extra = children[2];
    if (isType(extra, BlockElementType.COLLAPSIBLE_BLOCK_CONTENT)) {
      Transforms.unwrapNodes(editor, { at: [...path, 2] });
    } else {
      const contentNode = children[1] as Element;
      Transforms.moveNodes(editor, {
        at: [...path, 2],
        to: [...path, 1, contentNode.children.length],
      });
    }
    return true;
  }

  return false;
};

/**
 * 修正折叠块相关节点的结构
 * @returns 是否做了修正（true 时调用方应直接返回，等待下一轮 normalize）
 */
export const normalizeCollapsibleEntry = (
  editor: Editor,
  [node, path]: NodeEntry
) => {
  if (!Element.isElement(node) || !COLLAPSIBLE_TYPES.includes(node.type)) {
    return false;
  }

  switch (node.type) {
    case BlockElementType.COLLAPSIBLE_BLOCK:
      return normalizeBlock(editor, node, path);
    case BlockElementType.COLLAPSIBLE_BLOCK_TITLE:
      return normalizeTitle(editor, node, path);
    case BlockElementType.COLLAPSIBLE_BLOCK_CONTENT:
      return normalizeContent(editor, node, path);
    default:
      return false;
  }
};
