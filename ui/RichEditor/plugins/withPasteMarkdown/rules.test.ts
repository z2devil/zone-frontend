import { describe, expect, it } from 'vitest';
import { BlockElementType } from '@/lib/constants';
import { remarkElementRules } from './rules';

describe('Markdown code block conversion', () => {
  it('creates a dedicated MermaidBlock for mermaid fences', () => {
    expect(
      remarkElementRules.code.transform({
        type: 'code',
        lang: 'mermaid',
        value: 'flowchart TD\nA --> B',
      })
    ).toEqual({
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
    });
  });

  it('keeps other fenced languages as code blocks', () => {
    expect(
      remarkElementRules.code.transform({
        type: 'code',
        lang: 'typescript',
        value: 'const ok = true;',
      })
    ).toMatchObject({
      type: BlockElementType.CODE_BLOCK,
      language: 'typescript',
    });
  });
});
