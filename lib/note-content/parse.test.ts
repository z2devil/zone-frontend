import { describe, expect, it } from 'vitest';
import { BlockElementType } from '@/lib/constants';
import { normalizeNoteContent, parseNoteContent } from './parse';

describe('parseNoteContent', () => {
  it('upgrades legacy Mermaid code blocks without changing their source', () => {
    const content = JSON.stringify([
      {
        type: BlockElementType.CODE_BLOCK,
        language: 'mermaid',
        children: [
          {
            type: BlockElementType.CODE_LINE_BLOCK,
            children: [{ text: 'flowchart TD' }],
          },
          {
            type: BlockElementType.CODE_LINE_BLOCK,
            children: [{ text: 'A --> B' }],
          },
        ],
      },
    ]);

    expect(parseNoteContent(content)).toEqual([
      {
        type: BlockElementType.MERMAID,
        children: [
          {
            type: BlockElementType.CODE_LINE_BLOCK,
            children: [{ text: 'flowchart TD' }],
          },
          {
            type: BlockElementType.CODE_LINE_BLOCK,
            children: [{ text: 'A --> B' }],
          },
        ],
      },
    ]);
  });

  it('normalizes nested legacy blocks and rejects invalid content', () => {
    const normalized = normalizeNoteContent([
      {
        type: BlockElementType.BLOCK_QUOTE,
        children: [
          {
            type: BlockElementType.CODE_BLOCK,
            language: 'MERMAID',
            children: [{ text: 'sequenceDiagram' }],
          },
        ],
      },
    ]);

    expect(normalized?.[0]).toMatchObject({
      type: BlockElementType.BLOCK_QUOTE,
      children: [
        {
          type: BlockElementType.MERMAID,
          children: [
            {
              type: BlockElementType.CODE_LINE_BLOCK,
              children: [{ text: 'sequenceDiagram' }],
            },
          ],
        },
      ],
    });
    expect(parseNoteContent('not-json')).toBeNull();
    expect(normalizeNoteContent([])).toBeNull();
  });
});
