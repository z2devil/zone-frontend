import { Editor, Element, Node, Path, Point, Transforms } from 'slate';
import { BlockElementType } from '@/lib/constants';

/**
 * 找到包含该点的、处于收起状态的最外层折叠块，且该点位于其内容区
 */
const findCollapsedBlockPath = (editor: Editor, point: Point) => {
  for (const [node, path] of Node.levels(editor, point.path)) {
    if (
      Element.isElement(node) &&
      node.type === BlockElementType.COLLAPSIBLE_BLOCK &&
      node.collapsed &&
      point.path.length > path.length &&
      point.path[path.length] === 1
    ) {
      return path;
    }
  }
  return null;
};

/**
 * 编辑模式下收起的内容不可见，选区不能落在其中：移到对应标题末尾
 */
export const moveSelectionOutOfCollapsedContent = (editor: Editor) => {
  const { selection } = editor;
  if (!selection) return;

  let blockPath: Path | null = null;
  try {
    blockPath =
      findCollapsedBlockPath(editor, selection.anchor) ||
      findCollapsedBlockPath(editor, selection.focus);
  } catch {
    return;
  }
  if (!blockPath) return;

  Transforms.select(editor, Editor.end(editor, [...blockPath, 0]));
};
