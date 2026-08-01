import { InlineElementType } from '@/lib/constants';
import { clearCache } from '@chenglou/pretext';
import {
  measureRichInlineStats,
  prepareRichInline,
  type PreparedRichInline,
  type RichInlineItem,
} from '@chenglou/pretext/rich-inline';
import { Descendant, Element, Node, Text } from 'slate';
import type {
  MeasureTextLines,
  TextVariant,
} from '@/lib/note-card-estimator/model';

const SANS_FAMILY =
  'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI Variable Display", "Segoe UI", Helvetica, "PingFang SC", "Microsoft YaHei", "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"';
const MONO_FAMILY =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
const CODE_CHROME_WIDTH = 20;

interface TextStyle {
  family: string;
  size: number;
  weight: 400 | 700;
}

interface CachedMeasureTextLines extends MeasureTextLines {
  clear: () => void;
}

const variantStyle = (variant: TextVariant): TextStyle => {
  switch (variant) {
    case 'h1':
      return { family: SANS_FAMILY, size: 18, weight: 700 };
    case 'h2':
      return { family: SANS_FAMILY, size: 16, weight: 700 };
    case 'h3':
    case 'h4':
      return { family: SANS_FAMILY, size: 14, weight: 700 };
    case 'h5':
    case 'h6':
      return { family: SANS_FAMILY, size: 12, weight: 700 };
    case 'quote':
      return { family: SANS_FAMILY, size: 14.4, weight: 400 };
    case 'body':
      return { family: SANS_FAMILY, size: 16, weight: 400 };
  }
};

const toCanvasFont = (
  style: TextStyle,
  marks?: { bold?: boolean; italic?: boolean }
) => {
  const fontStyle = marks?.italic ? 'italic ' : '';
  const weight = marks?.bold ? 700 : style.weight;
  return `${fontStyle}${weight} ${style.size}px ${style.family}`;
};

const appendInlineItems = (
  nodes: Descendant[],
  variant: TextVariant,
  items: RichInlineItem[],
  override?: 'code'
) => {
  const baseStyle = variantStyle(variant);

  nodes.forEach(node => {
    if (Text.isText(node)) {
      const text = node.text || '';
      const style =
        override === 'code'
          ? { family: MONO_FAMILY, size: 14.4, weight: 400 as const }
          : baseStyle;
      items.push({
        font: toCanvasFont(style, node),
        text,
      });
      return;
    }

    if (!Element.isElement(node)) return;

    if (node.type === InlineElementType.CODE_SPAN) {
      const startIndex = items.length;
      appendInlineItems(node.children, variant, items, 'code');
      const firstItem = items[startIndex];
      if (firstItem) firstItem.extraWidth = CODE_CHROME_WIDTH;
      return;
    }

    if (node.type === InlineElementType.LINK) {
      appendInlineItems(node.children, variant, items, override);
      return;
    }

    const text = Node.string(node);
    if (text) {
      items.push({
        font: toCanvasFont(baseStyle),
        text,
      });
    }
  });
};

const fallbackLineCount = (
  children: Descendant[],
  variant: TextVariant,
  width: number
) => {
  const textLength = Node.string({ children } as never).length;
  const averageCharacterWidth = variantStyle(variant).size;
  return Math.max(1, Math.ceil((textLength * averageCharacterWidth) / width));
};

export const createPretextTextMeasurer = (): CachedMeasureTextLines => {
  let preparedCache = new WeakMap<
    Descendant[],
    Map<TextVariant, PreparedRichInline>
  >();

  const measure = ((children, variant, width) => {
    try {
      let variants = preparedCache.get(children);
      if (!variants) {
        variants = new Map();
        preparedCache.set(children, variants);
      }

      let prepared = variants.get(variant);
      if (!prepared) {
        const items: RichInlineItem[] = [];
        appendInlineItems(children, variant, items);
        prepared = prepareRichInline(items);
        variants.set(variant, prepared);
      }

      return measureRichInlineStats(prepared, Math.max(1, width)).lineCount;
    } catch {
      return fallbackLineCount(children, variant, Math.max(1, width));
    }
  }) as CachedMeasureTextLines;

  measure.clear = () => {
    preparedCache = new WeakMap();
    clearCache();
  };

  return measure;
};
