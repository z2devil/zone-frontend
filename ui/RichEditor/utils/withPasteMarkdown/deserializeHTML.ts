import { jsx } from 'slate-hyperscript';
import { Descendant } from 'slate';
import { BlockElementType, InlineElementType } from '@/lib/constants';

const ELEMENT_TAGS = {
  A: (el: Element) => ({
    type: InlineElementType.LINK,
    url: el.getAttribute('href') || void 0,
  }),
  BLOCKQUOTE: () => ({ type: BlockElementType.BLOCK_QUOTE }),
  H1: () => ({ type: BlockElementType.HEADING_1 }),
  H2: () => ({ type: BlockElementType.HEADING_2 }),
  H3: () => ({ type: BlockElementType.HEADING_3 }),
  H4: () => ({ type: BlockElementType.HEADING_4 }),
  H5: () => ({ type: BlockElementType.HEADING_5 }),
  H6: () => ({ type: BlockElementType.HEADING_6 }),
  IMG: (el: Element) => ({
    type: BlockElementType.IMAGE,
    url: el.getAttribute('src') || void 0,
  }),
  LI: () => ({ type: BlockElementType.LIST_ITEM }),
  OL: () => ({ type: BlockElementType.OL_LIST }),
  P: () => ({ type: BlockElementType.PARAGRAPH }),
  PRE: () => ({ type: BlockElementType.CODE_BLOCK }),
  UL: () => ({ type: BlockElementType.UL_LIST }),
};

const TEXT_TAGS = {
  CODE: () => ({ code: true }),
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true }),
};

const deserialize = (el: Node) => {
  if (el.nodeType === 3) {
    return el.textContent;
  } else if (el.nodeType !== 1) {
    return null;
  } else if (el.nodeName === 'BR') {
    return '\n';
  }

  const { nodeName } = el;
  let parent = el;

  if (
    nodeName === 'PRE' &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === 'CODE'
  ) {
    parent = el.childNodes[0] as HTMLElement;
  }
  let children: (Descendant | string | null)[] = Array.from(parent.childNodes)
    .map(deserialize)
    .flat();

  if (children.length === 0) {
    children = [{ text: '' }];
  }

  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children);
  }

  if ((ELEMENT_TAGS as any)[nodeName]) {
    const attrs = (ELEMENT_TAGS as any)[nodeName](el);
    return jsx('element', attrs, children);
  }

  if ((TEXT_TAGS as any)[nodeName]) {
    const attrs = (TEXT_TAGS as any)[nodeName](el);
    return children.map(child => jsx('text', attrs, child));
  }

  return children;
};

export default deserialize;
