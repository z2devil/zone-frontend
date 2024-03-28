import { Descendant } from 'slate';
import { MdastNode } from 'types/slate';
import remarkTransformNode from './remarkTransformNode';

/**
 * 转换 mdast node 的 children 为 slate node
 */
function remarkTransformElementChildren(node: MdastNode): Descendant[] {
  const { children } = node;
  if (!children) return [];

  return children.flatMap(child => remarkTransformNode(child));
}

export default remarkTransformElementChildren;
