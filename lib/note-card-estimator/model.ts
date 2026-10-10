import { BlockElementType } from '@/lib/constants';
import { Descendant, Element, Text } from 'slate';
import {
  CodeBlockElement,
  CollapsibleBlockElement,
  HeadingElement,
  ImageBlockElement,
  LayoutBlockElement,
  SteamVideoBlockElement,
} from 'types/slate';

export type TextVariant =
  | 'body'
  | 'quote'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6';

export type MeasureTextLines = (
  children: Descendant[],
  variant: TextVariant,
  width: number
) => number;

interface EstimatedBox {
  height: number;
  kind: string;
  marginBottom: number;
  marginTop: number;
}

interface FlowOptions {
  trimEndMargin?: boolean;
  trimStartMargin?: boolean;
}

interface NoteCardEstimateInput {
  bannerPath?: string;
  content: Descendant[];
}

const BODY_LINE_HEIGHT = 24;
const CODE_LINE_HEIGHT = 20.4;
const CARD_PADDING = 20;
const CARD_SECTION_GAP = 12;
const CARD_HEADER_HEIGHT = 28;
const CARD_FOOTER_HEIGHT = 24;
const BODY_BOTTOM_MARGIN = 4;
const MAX_BODY_HEIGHT = 480;

const createBox = (
  kind: EstimatedBox['kind'],
  height: number,
  marginTop = 0,
  marginBottom = marginTop
): EstimatedBox => ({
  height: Math.max(0, height),
  kind,
  marginBottom,
  marginTop,
});

const headingVariant = (type: HeadingElement['type']): TextVariant => {
  switch (type) {
    case BlockElementType.HEADING_1:
      return 'h1';
    case BlockElementType.HEADING_2:
      return 'h2';
    case BlockElementType.HEADING_3:
      return 'h3';
    case BlockElementType.HEADING_4:
      return 'h4';
    case BlockElementType.HEADING_5:
      return 'h5';
    case BlockElementType.HEADING_6:
      return 'h6';
  }
};

const estimateFlow = (
  children: Descendant[],
  width: number,
  measureTextLines: MeasureTextLines,
  options: FlowOptions = {}
) => {
  const { trimEndMargin = false, trimStartMargin = false } = options;
  const boxes = children.map(child =>
    estimateBlockHeight(child, width, measureTextLines)
  );

  let height = 0;
  let previousBox: EstimatedBox | undefined;

  boxes.forEach((box, index) => {
    let marginTop = box.marginTop;
    if (
      previousBox?.kind === BlockElementType.PARAGRAPH &&
      box.kind === BlockElementType.PARAGRAPH
    ) {
      marginTop = Math.max(marginTop, 8);
    }

    if (index === 0) {
      height += trimStartMargin ? 0 : marginTop;
    } else {
      height += Math.max(previousBox?.marginBottom || 0, marginTop);
    }
    height += box.height;
    previousBox = box;
  });

  if (!trimEndMargin) height += previousBox?.marginBottom || 0;
  return height;
};

const estimateImageHeight = (element: ImageBlockElement, width: number) => {
  const percentage = Math.min(100, Math.max(0, element.width ?? 100));
  const imageWidth = (width * percentage) / 100;
  if (!element.originWidth || !element.originHeight) return 128;
  return Math.max(
    128,
    imageWidth * (element.originHeight / element.originWidth)
  );
};

const estimateBlockHeight = (
  node: Descendant,
  width: number,
  measureTextLines: MeasureTextLines
): EstimatedBox => {
  const safeWidth = Math.max(1, width);

  if (Text.isText(node)) {
    const lines = Math.max(1, measureTextLines([node], 'body', safeWidth));
    return createBox('text', lines * BODY_LINE_HEIGHT);
  }

  if (!Element.isElement(node)) return createBox('text', BODY_LINE_HEIGHT);

  switch (node.type) {
    case BlockElementType.PARAGRAPH: {
      const lines = Math.max(
        1,
        measureTextLines(node.children, 'body', safeWidth)
      );
      return createBox(node.type, lines * BODY_LINE_HEIGHT, 4);
    }

    case BlockElementType.HEADING_1:
    case BlockElementType.HEADING_2:
    case BlockElementType.HEADING_3:
    case BlockElementType.HEADING_4:
    case BlockElementType.HEADING_5:
    case BlockElementType.HEADING_6: {
      const lines = Math.max(
        1,
        measureTextLines(node.children, headingVariant(node.type), safeWidth)
      );
      return createBox(node.type, lines * BODY_LINE_HEIGHT, 8);
    }

    case BlockElementType.OL_LIST:
    case BlockElementType.UL_LIST:
      return createBox(
        node.type,
        estimateFlow(node.children, safeWidth, measureTextLines),
        8
      );

    case BlockElementType.LIST_ITEM:
      return createBox(
        node.type,
        estimateFlow(node.children, safeWidth - 28, measureTextLines),
        8
      );

    case BlockElementType.BLOCK_QUOTE:
      return createBox(
        node.type,
        estimateFlow(node.children, safeWidth - 20, measureTextLines),
        16
      );

    case BlockElementType.LAYOUT: {
      const layout = node as LayoutBlockElement;
      const height = Math.max(
        0,
        ...layout.children.map(item => {
          const itemWidth = safeWidth * (item.width / 100) - 8;
          return (
            estimateFlow(item.children, itemWidth, measureTextLines, {
              trimEndMargin: true,
              trimStartMargin: true,
            }) + 8
          );
        })
      );
      return createBox(node.type, height, 8);
    }

    case BlockElementType.LAYOUT_ITEM:
      return createBox(
        node.type,
        estimateFlow(node.children, safeWidth, measureTextLines, {
          trimEndMargin: true,
          trimStartMargin: true,
        }) + 8
      );

    case BlockElementType.CODE_BLOCK: {
      const codeBlock = node as CodeBlockElement;
      const lines = Math.max(1, codeBlock.children.length);
      return createBox(node.type, 40 + 32 + lines * CODE_LINE_HEIGHT, 8);
    }

    case BlockElementType.CODE_LINE_BLOCK: {
      const lines = Math.max(
        1,
        measureTextLines(node.children, 'body', safeWidth)
      );
      return createBox(node.type, lines * CODE_LINE_HEIGHT);
    }

    case BlockElementType.IMAGE:
      return createBox(
        node.type,
        estimateImageHeight(node as ImageBlockElement, safeWidth),
        8
      );

    case BlockElementType.VIDEO:
      return createBox(node.type, (safeWidth * 9) / 16, 8);

    case BlockElementType.MUSIC:
      return createBox(node.type, 80, 8);

    case BlockElementType.STEAM_VIDEO: {
      const steamVideo = node as SteamVideoBlockElement;
      return createBox(
        node.type,
        (safeWidth * 9) / 16 + (steamVideo.title ? 20 : 0),
        8
      );
    }

    case BlockElementType.STEAM_WIDGET:
      return createBox(node.type, 190, 8);

    case BlockElementType.WHITE_BOARD:
      return createBox(node.type, 200, 0, 8);

    case BlockElementType.TIP: {
      const textHeight = estimateFlow(
        node.children,
        safeWidth - 52,
        measureTextLines
      );
      return createBox(node.type, Math.max(28, textHeight) + 16, 0, 8);
    }

    case BlockElementType.COLLAPSIBLE_BLOCK: {
      // 与卡片渲染一致：按文档中的默认折叠状态估算
      const [title, content] = (node as CollapsibleBlockElement).children;
      const headerHeight =
        8 +
        Math.max(
          24,
          estimateFlow(title?.children || [], safeWidth - 28, measureTextLines)
        );
      const contentHeight =
        node.collapsed || !content
          ? 0
          : 8 +
            estimateFlow(content.children, safeWidth - 24, measureTextLines);
      return createBox(node.type, headerHeight + contentHeight, 8);
    }

    case BlockElementType.BUTTON:
      return createBox(node.type, 24);

    default:
      return createBox(node.type, 40);
  }
};

export const estimateNoteBodyHeight = (
  content: Descendant[],
  width: number,
  measureTextLines: MeasureTextLines
) =>
  estimateFlow(content, width, measureTextLines, {
    trimStartMargin: true,
  });

export const estimateNoteCardHeight = (
  note: NoteCardEstimateInput,
  cardWidth: number,
  measureTextLines: MeasureTextLines
) => {
  const contentWidth = Math.max(1, cardWidth - CARD_PADDING * 2);
  const bodyHeight = Math.min(
    MAX_BODY_HEIGHT,
    estimateNoteBodyHeight(note.content, contentWidth, measureTextLines)
  );
  const sectionCount = note.bannerPath ? 4 : 3;
  let height =
    CARD_PADDING * 2 +
    CARD_HEADER_HEIGHT +
    CARD_FOOTER_HEIGHT +
    BODY_BOTTOM_MARGIN +
    bodyHeight +
    CARD_SECTION_GAP * (sectionCount - 1);

  if (note.bannerPath) height += contentWidth / 3 + 8;
  return Math.ceil(height);
};
