import { ShortcustType } from 'types/slate';

export enum MarkType {
  BOLD = 'bold',
  ITALIC = 'italic',
  UNDERLINE = 'underline',
  STRIKETHROUGH = 'strikethrough',
  CODE = 'code',
}

export enum ElementType {
  TEXT = 'text',
  PARAGRAPH = 'paragraph',
  HEADING_1 = 'heading-1',
  HEADING_2 = 'heading-2',
  HEADING_3 = 'heading-3',
  HEADING_4 = 'heading-4',
  HEADING_5 = 'heading-5',
  HEADING_6 = 'heading-6',
  OL_LIST = 'ol-list',
  UL_LIST = 'ul-list',
  BLOCK_QUOTE = 'block-quote',
  CODE_LINE = 'code-line',
  CODE_BLOCK = 'code-block',
  LINK = 'link',
  IMAGE = 'image',
  BUTTON = 'button',
}

export const CAN_INSERT_ELEMENTS = [
  ElementType.PARAGRAPH,
  ElementType.HEADING_1,
  ElementType.HEADING_2,
  ElementType.HEADING_3,
  ElementType.HEADING_4,
  ElementType.HEADING_5,
  ElementType.HEADING_6,
  ElementType.OL_LIST,
  ElementType.UL_LIST,
  ElementType.BLOCK_QUOTE,
  ElementType.CODE_BLOCK,
];

export const SHORTCUTS = {
  [ElementType.OL_LIST]: ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.'],
  [ElementType.UL_LIST]: ['*', '-', '+'],
  [ElementType.BLOCK_QUOTE]: ['>'],
  [ElementType.HEADING_1]: ['#'],
  [ElementType.HEADING_2]: ['##'],
  [ElementType.HEADING_3]: ['###'],
  [ElementType.HEADING_4]: ['####'],
  [ElementType.HEADING_5]: ['#####'],
  [ElementType.HEADING_6]: ['######'],
};

export const SHORTCUTS_MAP: Record<string, ShortcustType> = (() => {
  const map: Record<string, ShortcustType> = {};

  Object.entries(SHORTCUTS).forEach(([type, chars]) => {
    chars.forEach(char => {
      map[char] = type as ShortcustType;
    });
  });

  return map;
})();

export const NON_WRAPPING_ELEMENTS = [
  ElementType.HEADING_1,
  ElementType.HEADING_2,
  ElementType.HEADING_3,
  ElementType.HEADING_4,
  ElementType.HEADING_5,
  ElementType.HEADING_6,
];

export const NON_EMPTY_ELEMENTS = [
  ElementType.OL_LIST,
  ElementType.UL_LIST,
  ElementType.BLOCK_QUOTE,
];
