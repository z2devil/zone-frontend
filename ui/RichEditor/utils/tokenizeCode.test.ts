import { describe, expect, it } from 'vitest';
import { tokenizeCode } from './tokenizeCode';

describe('tokenizeCode', () => {
  it('falls back to plaintext for an unsupported code language', () => {
    expect(() => tokenizeCode('graph TD; A --> B', 'mermaid')).not.toThrow();
    expect(tokenizeCode('graph TD; A --> B', 'mermaid')).toEqual([
      'graph TD; A --> B',
    ]);
  });
});
