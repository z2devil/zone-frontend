import { Descendant } from 'slate';
import { MdastNode } from 'types/slate';
import remarkTransformBlock from './remarkTransformBlock';
import remarkTransformInline from './remarkTransformInline';

// inline 元素类型
const remarkInlineypes: string[] = [
  'emphasis',
  'strong',
  'delete',
  'inlineCode',
  'html',
  'text',
];

/**
 * mdast node 转 slate node
 */
function remarkTransformNode(node: MdastNode): Descendant | Descendant[] {
  const { type } = node;

  console.log('[ remarkTransformNode ]', node);

  // 如果是 inline 元素类型
  if (remarkInlineypes.includes(type)) {
    const inline = remarkTransformInline(node);
    return inline;
  }

  // 如果是 block 元素类型
  return remarkTransformBlock(node);
}

export default remarkTransformNode;
