import { RichEditor, MdastNode, CustomText, CustomElement } from 'types/slate';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { Descendant, Node } from 'slate';
import { BlockElementType } from '../constants';

export const withPasteMd = (editor: RichEditor) => {
  const { insertData } = editor;

  editor.insertData = data => {
    // TODO: 之后再处理 html
    const html = data.getData('text/html');
    const text = data.getData('text/plain');
    if (text) {
      const fragment = unified()
        .use(remarkParse)
        .use(slateParse)
        .processSync(text).result as Node[];

      console.log('[ fragment ]', fragment);
      editor.insertFragment(fragment);
      return;
    }
    insertData(data);
  };

  return editor;
};

/**
 * mdast 转 slate 插件
 */
function slateParse(this: any) {
  const compiler = (node: { children: Array<MdastNode> }) => {
    return node.children.flatMap(remarkTransformNode);
  };

  this.Compiler = compiler;
}

// inline 元素类型
export const remarkInlineypes: string[] = [
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

  // 如果是 inline 元素类型
  if (remarkInlineypes.includes(type)) {
    const inline = remarkTransformInline(node);
    // console.log('[ remarkTransformNode node ]', node);
    // console.log('[ remarkTransformNode inline ]', inline);
    return inline;
  }

  // 如果是 block 元素类型
  return remarkTransformBlock(node);
}

/**
 * 转换 mdast node 的 children 为 slate node
 */
const remarkTransformElementChildren = (node: MdastNode): Descendant[] => {
  const { children } = node;
  if (!children) return [];

  return children.flatMap(child => remarkTransformNode(child));
};

/**
 * mdast inline node 转 slate text node
 */
function remarkTransformInline(
  node: MdastNode,
  inheritedMarkProps: {
    [key: string]: boolean | string;
  } = {}
): CustomText | CustomText[] {
  const { type, value, children } = node;

  // console.log('[ remarkTransformInline ]', type, value, children);

  const textRule = remarkTextRules[type];

  const { mark, type: textType } = textRule || {};

  const markProps = {
    ...inheritedMarkProps,
    ...(mark && {
      [mark]: true,
    }),
  };

  const childrenTextNodes =
    children?.flatMap(child => remarkTransformInline(child, markProps)) || [];

  if (textType) {
    return [
      {
        type: textType,
        children: [
          {
            text: value || '',
            ...markProps,
          },
        ],
      } as CustomText,
    ];
  }

  const textNode =
    value || childrenTextNodes.length === 0
      ? ([{ text: value || '', ...markProps }] as CustomText[])
      : [];

  return [...textNode, ...childrenTextNodes];
}

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

  console.log('[ remarkTransformBlock block ]', block);

  return block;
}

const remarkTextRules: Record<
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

const inlineBlockTypes = ['code-span'];

const remarkElementRules: Record<
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
  // list: {
  //   transform: node => {
  //     // if (options.indentList) {
  //     //   const listStyleType = node.ordered ? 'decimal' : 'disc';

  //     //   const parseListItems = (
  //     //     _node: MdastNode,
  //     //     listItems: CustomElement[] = [],
  //     //     indent = 1
  //     //   ) => {
  //     //     _node.children!.forEach(listItem => {
  //     //       const [paragraph, ...subLists] = listItem.children!;

  //     //       listItems.push({
  //     //         type: BlockElementType.PARAGRAPH,
  //     //         // listStyleType,
  //     //         // indent,
  //     //         children: remarkTransformElementChildren(paragraph || ''),
  //     //       } as CustomElement);

  //     //       subLists.forEach(subList => {
  //     //         parseListItems(subList, listItems, indent + 1);
  //     //       });
  //     //     });

  //     //     return listItems as CustomElement[];
  //     //   };

  //     //   return parseListItems(node);
  //     // } else {
  //     //   return {
  //     //     type: node.ordered
  //     //       ? BlockElementType.OL_LIST
  //     //       : BlockElementType.UL_LIST,
  //     //     children: remarkTransformElementChildren(node),
  //     //   } as CustomElement;
  //     // }
  //     return {
  //       type: node.ordered
  //         ? BlockElementType.OL_LIST
  //         : BlockElementType.UL_LIST,
  //       children: remarkTransformElementChildren(node),
  //     } as CustomElement;
  //   },
  // },
  // listItem: {
  //   transform: (node, options) => ({
  //     type: getPluginType(options.editor, ELEMENT_LI),
  //     children: remarkTransformElementChildren(node, options).map(
  //       child =>
  //         ({
  //           ...child,
  //           type:
  //             child.type === getPluginType(options.editor, ELEMENT_PARAGRAPH)
  //               ? getPluginType(options.editor, ELEMENT_LIC)
  //               : child.type,
  //         } as TDescendant)
  //     ),
  //   }),
  // },

  // link: {
  //   transform: (node, options) => ({
  //     type: getPluginType(options.editor, ELEMENT_LINK),
  //     url: node.url,
  //     children: remarkTransformElementChildren(node, options),
  //   }),
  // },
  // image: {
  //   transform: (node, options) => ({
  //     type: getPluginType(options.editor, ELEMENT_IMAGE),
  //     children: [{ text: '' } as TText],
  //     url: node.url,
  //     caption: [{ text: node.alt } as TText],
  //   }),
  // },
  // code: {
  //   transform: (node, options) => ({
  //     type: getPluginType(options.editor, ELEMENT_CODE_BLOCK),
  //     lang: node.lang ?? undefined,
  //     children: (node.value || '').split('\n').map(line => ({
  //       type: getPluginType(options.editor, ELEMENT_CODE_LINE),
  //       children: [{ text: line } as TText],
  //     })),
  //   }),
  // },
  // thematicBreak: {
  //   transform: (node, options) => ({
  //     type: getPluginType(options.editor, ELEMENT_HR),
  //     children: [{ text: '' } as TText],
  //   }),
  // },
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
};
