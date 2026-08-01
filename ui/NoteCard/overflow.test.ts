import { describe, expect, it } from 'vitest';
import { isContentOverflowing } from './overflow';

describe('isContentOverflowing', () => {
  it('shows the fade only when content exceeds its visible box', () => {
    expect(
      isContentOverflowing({ clientHeight: 480, scrollHeight: 481.1 })
    ).toBe(true);
    expect(
      isContentOverflowing({ clientHeight: 480, scrollHeight: 480.5 })
    ).toBe(false);
  });
});
