import { Node } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import { NoteCardHeightEstimator } from '.';
import type { MeasureTextLines } from './model';

describe('NoteCardHeightEstimator', () => {
  it('estimates valid serialized note content with the current card width', () => {
    const measureTextLines = vi.fn<MeasureTextLines>(
      (children, _variant, width) =>
        Math.max(
          1,
          Math.ceil((Node.string({ children } as never).length * 8) / width)
        )
    );
    const estimator = new NoteCardHeightEstimator(measureTextLines);

    expect(
      estimator.estimate(
        {
          _id: 'note-1',
          content: '[{"type":"paragraph","children":[{"text":"一段正文"}]}]',
        },
        430
      )
    ).toBe(148);
    expect(measureTextLines).toHaveBeenCalledWith(
      expect.any(Array),
      'body',
      390
    );
  });

  it('uses the visible fallback content when serialized content is invalid', () => {
    const measureTextLines = vi.fn<MeasureTextLines>(() => 2);
    const estimator = new NoteCardHeightEstimator(measureTextLines);

    expect(
      estimator.estimate({ _id: 'broken-note', content: 'not-json' }, 430)
    ).toBe(172);
    expect(measureTextLines).toHaveBeenCalledTimes(1);
  });
});
