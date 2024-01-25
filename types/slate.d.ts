import { BaseEditor, BaseRange, Element } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';
import {
  BlockElementType,
  InlineElementType,
  Language,
  MarkType,
} from '@/ui/RichEditor/constants';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';

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
  align?: string;
  children: Descendant[];
};

export type UnorderedListElement = {
  type: BlockElementType.UL_LIST;
  align?: string;
  children: Descendant[];
};

export type BlockQuoteElement = {
  type: BlockElementType.BLOCK_QUOTE;
  align?: string;
  children: Descendant[];
};

export type CodeSpanElement = {
  type: InlineElementType.CODE_SPAN;
  children: CustomText[];
};

export type CodeBlockElement = {
  type: BlockElementType.CODE_BLOCK;
  children: CustomText[];
  language?: Language;
  content?: string;
  height?: number;
};

export type LinkElement = {
  type: InlineElementType.LINK;
  url?: string;
  children: CustomText[];
};

export type ImageBlockElement = {
  type: BlockElementType.IMAGE;
  url?: string;
  width?: number;
  height?: number;
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

export type InlineElement = CodeSpanElement | LinkElement;

export type BlockElement =
  | ParagraphElement
  | HeadingElement
  | OrderedListElement
  | UnorderedListElement
  | BlockQuoteElement
  | CodeBlockElement
  | ImageBlockElement
  | ButtonElement
  | MusicBlockElement
  | WhiteBoardBlockElement;

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
