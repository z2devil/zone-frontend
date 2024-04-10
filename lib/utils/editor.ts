import { BlockElementType } from '@/ui/RichEditor/constants';
import { Descendant, Node } from 'slate';

export const getContentTitle = (contentString: string | Descendant[]) => {
  const content = !Array.isArray(contentString)
    ? (JSON.parse(contentString) as Descendant[])
    : contentString;

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
      ].includes(node.type as any) &&
      Node.string(node).length > 0
    ) {
      return Node.string(node);
    }
  }

  return '无标题';
};

export const getContentSummary = (
  contentString: string | Descendant[],
  length = 200
) => {
  const content = !Array.isArray(contentString)
    ? (JSON.parse(contentString) as Descendant[])
    : contentString;

  let summary = '';

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
      summary += ` ${Node.string(node)}`;
      if (summary.length > length) break;
    }
  }

  // summary = summary
  //   .replaceAll('\n', ' ')
  //   .replaceAll('\r', '')
  //   .replaceAll(' ', '');

  return `${summary.replaceAll(' ', '').slice(0, length)}...`;
};
