import { CustomElement, MdastNode } from 'types/slate';
import { Descendant } from 'slate';
import remarkTransformElementChildren from './remarkTransformElementChildren';
import remarkTransformInline from './remarkTransformInline';
import CodeTransfromToElementChildren from './CodeTransfromToElementChildren';
import { BlockElementType } from '@/lib/constants';

// 内联块元素类型
const inlineBlockTypes = ['code-span'];

// 内联元素类型
export const remarkTextRules: Record<
  string,
  {
    mark?: string;
    type?: string;
  }
> = {
  // 斜体
  emphasis: {
    mark: 'italic',
  },
  // 加粗
  strong: {
    mark: 'bold',
  },
  // 删除线
  delete: {
    mark: 'strikethrough',
  },
  // 行内代码
  inlineCode: {
    type: 'code-span',
  },
};

// 块元素类型
export const remarkElementRules: Record<
  string,
  {
    transform: (node: MdastNode) => CustomElement | CustomElement[];
  }
> = {
  heading: {
    transform: node => {
      const headingType = {
        1: BlockElementType.HEADING_1,
        2: BlockElementType.HEADING_2,
        3: BlockElementType.HEADING_3,
        4: BlockElementType.HEADING_4,
        5: BlockElementType.HEADING_5,
        6: BlockElementType.HEADING_6,
      }[node.depth ?? 1];

      return {
        type: headingType,
        children: remarkTransformElementChildren(node),
      } as CustomElement;
    },
  },
  list: {
    transform: node => {
      return {
        type: node.ordered
          ? BlockElementType.OL_LIST
          : BlockElementType.UL_LIST,
        children: remarkTransformElementChildren(node),
      } as CustomElement;
    },
  },
  listItem: {
    transform: node => {
      return {
        type: BlockElementType.LIST_ITEM,
        // 暂时反序列化为 text
        // remarkTransformElementChildren(node),
        children: remarkTransformInline(node),
      } as CustomElement;
    },
  },
  code: {
    transform: node => {
      return {
        type: BlockElementType.CODE_BLOCK,
        language: node.lang,
        children: CodeTransfromToElementChildren(node.value),
      } as CustomElement;
    },
  },
  blockquote: {
    transform: node => {
      return {
        type: BlockElementType.BLOCK_QUOTE,
        children: remarkTransformElementChildren(node),
      } as CustomElement;
    },
  },
  paragraph: {
    transform: node => {
      const children = remarkTransformElementChildren(node);

      const elements: CustomElement[] = [];
      let inlineNodes: Descendant[] = [];

      const flushInlineNodes = () => {
        if (inlineNodes.length > 0) {
          elements.push({
            type: BlockElementType.PARAGRAPH,
            children: inlineNodes,
          } as CustomElement);

          inlineNodes = [];
        }
      };

      children.forEach(child => {
        const { type } = child;

        if (type && !inlineBlockTypes.includes(type)) {
          flushInlineNodes();
          elements.push(child as CustomElement);
        } else {
          inlineNodes.push(child);
        }
      });

      flushInlineNodes();

      return elements;
    },
  },
  image: {
    transform: node => {
      return {
        type: BlockElementType.IMAGE,
        url: node.url,
        alt: node.alt,
        children: [
          {
            text: '',
          },
        ],
      } as CustomElement;
    },
  },
};
