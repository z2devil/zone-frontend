import { BlockElementType } from '@/lib/constants';
import { Descendant, Node } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import {
  estimateNoteBodyHeight,
  estimateNoteCardHeight,
  type MeasureTextLines,
} from './model';

const measureTextLines: MeasureTextLines = (children, _variant, width) => {
  const length = Node.string({ children } as never).length;
  return Math.max(1, Math.ceil((length * 8) / width));
};

describe('note card height model', () => {
  it('keeps an empty paragraph at one line and collapses adjacent margins', () => {
    const content: Descendant[] = [
      {
        type: BlockElementType.PARAGRAPH,
        children: [{ text: '' }],
      },
      {
        type: BlockElementType.PARAGRAPH,
        children: [{ text: '第二段' }],
      },
    ];

    expect(estimateNoteBodyHeight(content, 390, measureTextLines)).toBe(60);
  });

  it('uses percentage image width, aspect ratio and the rendered minimum height', () => {
    const content: Descendant[] = [
      {
        type: BlockElementType.IMAGE,
        width: 50,
        originWidth: 800,
        originHeight: 400,
        children: [{ text: '' }],
      },
    ];

    expect(estimateNoteBodyHeight(content, 400, measureTextLines)).toBe(136);
  });

  it('caps the body while retaining card chrome and banner geometry', () => {
    const measureLongText = vi.fn<MeasureTextLines>(() => 30);
    const content: Descendant[] = [
      {
        type: BlockElementType.PARAGRAPH,
        children: [{ text: '很长的正文' }],
      },
    ];

    expect(
      estimateNoteCardHeight(
        {
          bannerPath: 'zone/image/banner.png',
          content,
        },
        430,
        measureLongText
      )
    ).toBe(750);
  });

  it.each([
    [true, 48],
    [false, 88],
  ])(
    'estimates a collapsible block by its default collapsed state (collapsed=%s)',
    (collapsed, height) => {
      const content = [
        {
          type: BlockElementType.COLLAPSIBLE_BLOCK,
          collapsed,
          children: [
            {
              type: BlockElementType.COLLAPSIBLE_BLOCK_TITLE,
              children: [
                {
                  type: BlockElementType.PARAGRAPH,
                  children: [{ text: '标题' }],
                },
              ],
            },
            {
              type: BlockElementType.COLLAPSIBLE_BLOCK_CONTENT,
              children: [
                {
                  type: BlockElementType.PARAGRAPH,
                  children: [{ text: '正文' }],
                },
              ],
            },
          ],
        },
      ] as Descendant[];

      expect(estimateNoteBodyHeight(content, 390, measureTextLines)).toBe(
        height
      );
    }
  );
});
