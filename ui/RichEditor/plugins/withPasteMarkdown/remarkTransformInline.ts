import { CustomText, MdastNode } from 'types/slate';
import { remarkTextRules } from './rules';

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

export default remarkTransformInline;
