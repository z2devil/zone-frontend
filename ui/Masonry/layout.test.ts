import { describe, expect, it } from 'vitest';
import { calculateMasonryGeometry, calculateMasonryOverscan } from './layout';

describe('calculateMasonryGeometry', () => {
  it('keeps the configured card width and centers complete columns', () => {
    expect(calculateMasonryGeometry(1000, 430, 20)).toEqual({
      cardWidth: 430,
      columnCount: 2,
      contentOffset: 60,
      contentWidth: 880,
    });
  });

  it('shrinks to a single fluid column below the configured card width', () => {
    expect(calculateMasonryGeometry(320, 430, 20)).toEqual({
      cardWidth: 320,
      columnCount: 1,
      contentOffset: 0,
      contentWidth: 320,
    });
  });

  it('returns an inert geometry before the container has a measurable width', () => {
    expect(calculateMasonryGeometry(0, 430, 20)).toEqual({
      cardWidth: 0,
      columnCount: 1,
      contentOffset: 0,
      contentWidth: 0,
    });
  });
});

describe('calculateMasonryOverscan', () => {
  it('converts the pixel buffer to a lane-aware item count', () => {
    expect(calculateMasonryOverscan(1200, 2, 750)).toBe(4);
    expect(calculateMasonryOverscan(1200, 2, 150)).toBe(16);
  });

  it('keeps a small safety floor and bounds pathological estimates', () => {
    expect(calculateMasonryOverscan(0, 3, 600)).toBe(6);
    expect(calculateMasonryOverscan(1200, 2, 0)).toBe(6);
  });
});
