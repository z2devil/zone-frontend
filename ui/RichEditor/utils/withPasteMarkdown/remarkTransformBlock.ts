import { CustomElement, MdastNode } from 'types/slate';
import { remarkElementRules } from './rules';

/**
 * mdast block node 转 slate element node
 */
function remarkTransformBlock(
  node: MdastNode
): CustomElement | CustomElement[] {
  const { type } = node;
  const elementRule = remarkElementRules[type];
  if (!elementRule) return [];

  const block = elementRule.transform(node);

  return block;
}

export default remarkTransformBlock;
