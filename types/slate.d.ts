import { BaseEditor, BaseRange, Element } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import { BlockElementType, InlineElementType, MarkType } from '@/lib/constants';

export type ElementType = BlockElementType | InlineElementType;

export type ShortcustType =
  | typeof BlockElementType.OL_LIST
  | typeof BlockElementType.UL_LIST
  | typeof BlockElementType.BLOCK_QUOTE
  | typeof BlockElementType.HEADING_1
  | typeof BlockElementType.HEADING_2
  | typeof BlockElementType.HEADING_3
  | typeof BlockElementType.HEADING_4
  | typeof BlockElementType.HEADING_5
  | typeof BlockElementType.HEADING_6;

export type RichEditor = BaseEditor &
  ReactEditor &
  HistoryEditor & {
    type: ElementType;
    nodeToDecorations?: Map<
      Element,
      (BaseRange & { [key: string]: unknown })[]
    >;
  } & {
    isSummary?: boolean;
  };

export type ParagraphElement = {
  type: BlockElementType.PARAGRAPH;
  children: CustomText[];
};

export type HeadingElement = {
  type:
    | BlockElementType.HEADING_1
    | BlockElementType.HEADING_2
    | BlockElementType.HEADING_3
    | BlockElementType.HEADING_4
    | BlockElementType.HEADING_5
    | BlockElementType.HEADING_6;
  children: CustomText[];
};

export type OrderedListElement = {
  type: BlockElementType.OL_LIST;
  children: Descendant[];
};

export type UnorderedListElement = {
  type: BlockElementType.UL_LIST;
  children: Descendant[];
};

export type ListItemElement = {
  type: BlockElementType.LIST_ITEM;
  children: Descendant[];
};

export type BlockQuoteElement = {
  type: BlockElementType.BLOCK_QUOTE;
  children: Descendant[];
};

export type CodeSpanElement = {
  type: InlineElementType.CODE_SPAN;
  children: CustomText[];
};

export type CodeBlockElement = {
  type: BlockElementType.CODE_BLOCK;
  language?: Language;
  content?: string;
  height?: number;
  children: CodeLineBlockElement[];
};

export type CodeLineBlockElement = {
  type: BlockElementType.CODE_LINE_BLOCK;
  children: CustomText[];
};

export type LinkInlineElement = {
  type: InlineElementType.LINK;
  url?: string;
  children: CustomText[];
};

export type ImageBlockElement = {
  type: BlockElementType.IMAGE;
  url?: string;
  originWidth?: number;
  originHeight?: number;
  width?: number;
  align?: 'left' | 'center' | 'right';
  children: CustomText[];
};

export type VideoBlockElement = {
  type: BlockElementType.VIDEO;
  url?: string;
  children: CustomText[];
};

export type ButtonElement = {
  type: BlockElementType.BUTTON;
  children: CustomText[];
};

export type MusicBlockElement = {
  type: BlockElementType.MUSIC;
  url?: string;
  coverUrl?: string;
  title?: string;
  children: CustomText[];
};

export type WhiteBoardBlockElement = {
  type: BlockElementType.WHITE_BOARD;
  elements?: ExcalidrawElement[];
  children: CustomText[];
};

export type LayoutBlockElement = {
  type: BlockElementType.LAYOUT;
  children: LayoutItemBlockElement[];
};

export type LayoutItemBlockElement = {
  type: BlockElementType.LAYOUT_ITEM;
  width: number;
  children: ParagraphElement[];
};

export type InlineElement = CodeSpanElement | LinkInlineElement;

export type BlockElement =
  | ParagraphElement
  | HeadingElement
  | OrderedListElement
  | UnorderedListElement
  | ListItemElement
  | BlockQuoteElement
  | CodeBlockElement
  | CodeLineBlockElement
  | ImageBlockElement
  | VideoBlockElement
  | ButtonElement
  | MusicBlockElement
  | WhiteBoardBlockElement
  | LayoutBlockElement
  | LayoutItemBlockElement;

// | CubeBlockElement;

export type CustomElement = InlineElement | BlockElement;

export type CustomText = {
  type?: InlineElementType;
  [MarkType.BOLD]?: boolean;
  [MarkType.ITALIC]?: boolean;
  [MarkType.UNDERLINE]?: boolean;
  [MarkType.STRIKETHROUGH]?: boolean;
  text?: string;
  children?: CustomText[];
};

declare module 'slate' {
  interface CustomTypes {
    Editor: RichEditor;
    Element: CustomElement;
    Text: CustomText;
    Range: BaseRange & {
      [key: string]: unknown;
    };
  }
}

export type MdastNodeType = string;

export interface MdastNode {
  type: MdastNodeType;
  ordered?: boolean;
  value?: string;
  text?: string;
  children?: Array<MdastNode>;
  depth?: 1 | 2 | 3 | 4 | 5 | 6;
  url?: string;
  alt?: string;
  lang?: string;
  // mdast metadata
  position?: any;
  spread?: any;
  checked?: any;
  indent?: any;
}
