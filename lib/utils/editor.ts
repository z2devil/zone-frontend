import { BlockElementType } from '@/ui/RichEditor/constants';
import { Descendant, Node } from 'slate';

export const getContentSummary = (contentString: string) => {
  const content = JSON.parse(contentString) as Descendant[];

  for (const node of content) {
    if (!node.type) continue;
    if (
      [
        BlockElementType.HEADING_1,
        BlockElementType.HEADING_2,
        BlockElementType.HEADING_3,
        BlockElementType.HEADING_4,
        BlockElementType.HEADING_5,
        BlockElementType.HEADING_6,
        BlockElementType.PARAGRAPH,
      ].includes(node.type as any) &&
      Node.string(node).length > 0
    ) {
      return Node.string(node);
    }
  }
  return '未命名';
};
