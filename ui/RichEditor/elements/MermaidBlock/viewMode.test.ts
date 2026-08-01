import { describe, expect, it } from 'vitest';
import { getMermaidViewMode } from './viewMode';

describe('getMermaidViewMode', () => {
  it('renders diagrams only for full readonly content', () => {
    expect(getMermaidViewMode({ readOnly: true, summary: false })).toBe(
      'diagram'
    );
    expect(getMermaidViewMode({ readOnly: true, summary: true })).toBe(
      'summary'
    );
    expect(getMermaidViewMode({ readOnly: false, summary: false })).toBe(
      'source'
    );
  });
});
