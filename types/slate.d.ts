import { BaseEditor, BaseRange } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';
import {
  BlockElementType,
  InlineElementType,
  MarkType,
} from '@/ui/CustomEditor/constans';

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

export type CustomEditor = BaseEditor &
  ReactEditor &
  HistoryEditor & {
    type: ElementType;
    nodeToDecorations?: Map<Element, Range[]>;
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

export type CodeLineElement = {
  type: InlineElementType.CODE_LINE;
  children: CustomText[];
};

export type CodeBlockElement = {
  type: BlockElementType.CODE_BLOCK;
  children: CustomText[];
};

export type LinkElement = {
  type: InlineElementType.LINK;
  url?: string;
  children: CustomText[];
};

export type ImageElement = {
  type: BlockElementType.IMAGE;
  url?: string;
  children: CustomText[];
};

export type ButtonElement = {
  type: BlockElementType.BUTTON;
  children: CustomText[];
};

export type InlineElement = CodeLineElement | LinkElement;

export type BlockElement =
  | ParagraphElement
  | HeadingElement
  | OrderedListElement
  | UnorderedListElement
  | BlockQuoteElement
  | CodeBlockElement
  | ImageElement
  | ButtonElement;

export type CustomElement = InlineElement | BlockElement;

export type CustomText = {
  type?: InlineElementType;
  [MarkType.BOLD]?: boolean;
  [MarkType.ITALIC]?: boolean;
  [MarkType.UNDERLINE]?: boolean;
  [MarkType.STRIKETHROUGH]?: boolean;
  [MarkType.CODE]?: boolean;
  text?: string;
  children?: CustomText[];
};

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
    Range: BaseRange & {
      [key: string]: unknown;
    };
  }
}
