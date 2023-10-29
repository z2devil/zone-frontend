import { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';
import { ElementType, MarkType } from '@/ui/CustomEditor/constans';

export type ShortcustType =
  | typeof ElementType.OL_LIST
  | typeof ElementType.UL_LIST
  | typeof ElementType.BLOCK_QUOTE
  | typeof ElementType.HEADING_1
  | typeof ElementType.HEADING_2
  | typeof ElementType.HEADING_3
  | typeof ElementType.HEADING_4
  | typeof ElementType.HEADING_5
  | typeof ElementType.HEADING_6;

export type CustomEditor = BaseEditor &
  ReactEditor &
  HistoryEditor & {
    type: ElementType;
    nodeToDecorations?: Map<Element, Range[]>;
  };

export type ParagraphElement = {
  type: ElementType.PARAGRAPH;
  children: CustomText[];
};

export type HeadingElement = {
  type:
    | ElementType.HEADING_1
    | ElementType.HEADING_2
    | ElementType.HEADING_3
    | ElementType.HEADING_4
    | ElementType.HEADING_5
    | ElementType.HEADING_6;
  children: CustomText[];
};

export type OrderedListElement = {
  type: ElementType.OL_LIST;
  align?: string;
  children: Descendant[];
};

export type UnorderedListElement = {
  type: ElementType.UL_LIST;
  align?: string;
  children: Descendant[];
};

export type BlockQuoteElement = {
  type: ElementType.BLOCK_QUOTE;
  align?: string;
  children: Descendant[];
};

export type CodeLineElement = {
  type: ElementType.CODE_LINE;
  children: CustomText[];
};

export type CodeBlockElement = {
  type: ElementType.CODE_BLOCK;
  children: CustomText[];
};

export type LinkElement = {
  type: ElementType.LINK;
  url: string;
  children: CustomText[];
};

export type ImageElement = {
  type: ElementType.IMAGE;
  url: string;
  children: CustomText[];
};

export type ButtonElement = {
  type: ElementType.BUTTON;
  children: CustomText[];
};

export type CustomElement =
  | ParagraphElement
  | HeadingElement
  | OrderedListElement
  | UnorderedListElement
  | BlockQuoteElement
  | CodeLineElement
  | CodeBlockElement
  | LinkElement
  | ImageElement
  | ButtonElement;

export type CustomText = {
  type: ElementType.TEXT;
  text: string;
  [MarkType.BOLD]?: boolean;
  [MarkType.ITALIC]?: boolean;
  [MarkType.UNDERLINE]?: boolean;
  [MarkType.STRIKETHROUGH]?: boolean;
  [MarkType.CODE]?: boolean;
};

export type EmptyText = {
  type: ElementType.TEXT;
  text: string;
  [MarkType.BOLD]?: boolean;
  [MarkType.ITALIC]?: boolean;
  [MarkType.UNDERLINE]?: boolean;
  [MarkType.STRIKETHROUGH]?: boolean;
  [MarkType.CODE]?: boolean;
};

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText | EmptyText;
    Range: BaseRange & {
      [key: string]: unknown;
    };
  }
}
