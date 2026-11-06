// Story 6.1.10 / G2.5 (#394): auto-scroll maths (L2, pure logic).
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SCROLL_SPEED,
  MAX_FRAME_MS,
  SCROLL_SPEEDS,
  clampSpeed,
  endBelowFold,
  isAtBottom,
  speedBy,
  stepScroll,
} from '@/lib/reader/autoScroll';

describe('speed levels', () => {
  it('has 5 increasing levels and a default in the middle', () => {
    expect(SCROLL_SPEEDS).toHaveLength(5);
    for (let i = 1; i < SCROLL_SPEEDS.length; i++) expect(SCROLL_SPEEDS[i]).toBeGreaterThan(SCROLL_SPEEDS[i - 1]);
    expect(DEFAULT_SCROLL_SPEED).toBe(3);
  });
  it('clamps to 1..5 and steps by one', () => {
    expect(clampSpeed(0)).toBe(1);
    expect(clampSpeed(9)).toBe(5);
    expect(clampSpeed(Number.NaN)).toBe(DEFAULT_SCROLL_SPEED);
    expect(speedBy(5, 1)).toBe(5);
    expect(speedBy(1, -1)).toBe(1);
    expect(speedBy(3, 1)).toBe(4);
    expect(speedBy(3, -1)).toBe(2);
  });
});

describe('stepScroll', () => {
  it('moves whole pixels and carries the remainder to the next frame', () => {
    // level 1 = 10 px/s → 16 ms is 0.16 px: nothing yet, remainder kept
    const a = stepScroll(0, 16, 1);
    expect(a.px).toBe(0);
    expect(a.carry).toBeCloseTo(SCROLL_SPEEDS[0] * 0.016, 5);
    // after enough frames a whole pixel is released
    let carry = 0;
    let total = 0;
    for (let i = 0; i < 100; i++) {
      const s = stepScroll(carry, 16, 1);
      carry = s.carry;
      total += s.px;
    }
    expect(total).toBe(Math.floor(SCROLL_SPEEDS[0] * 1.6));
  });
  it('faster levels move farther in the same time', () => {
    expect(stepScroll(0, 1000, 5).px).toBeGreaterThan(stepScroll(0, 1000, 1).px);
  });
  it('caps a long frame (tab was in the background) so the page never jumps', () => {
    expect(stepScroll(0, 60_000, 3).px).toBe(Math.floor((SCROLL_SPEEDS[2] * MAX_FRAME_MS) / 1000));
  });
  it('ignores negative time', () => {
    expect(stepScroll(0.2, -50, 3)).toEqual({ px: 0, carry: 0.2 });
  });
});

describe('isAtBottom', () => {
  it('is true within a pixel of the end', () => {
    expect(isAtBottom(1000, 800, 1800)).toBe(true);
    expect(isAtBottom(999.4, 800, 1800)).toBe(true);
    expect(isAtBottom(500, 800, 1800)).toBe(false);
  });
});

describe('endBelowFold', () => {
  it('is false when the end of the lyrics fits in the first screen', () => {
    expect(endBelowFold({ endBottom: 600, viewportTop: 0, viewportHeight: 800, scrollTop: 0 })).toBe(false);
  });
  it('is true when the end of the lyrics is below the fold', () => {
    expect(endBelowFold({ endBottom: 1500, viewportTop: 0, viewportHeight: 800, scrollTop: 0 })).toBe(true);
  });
  it('does not depend on how far the page is already scrolled', () => {
    expect(endBelowFold({ endBottom: 600 - 500, viewportTop: 0, viewportHeight: 800, scrollTop: 500 })).toBe(false);
    expect(endBelowFold({ endBottom: 1500 - 500, viewportTop: 0, viewportHeight: 800, scrollTop: 500 })).toBe(true);
  });
  it('measures inside a scroll container that starts below the page top', () => {
    // main area starts at y=64 and is 736 high; lyrics end 900 below the container top
    expect(endBelowFold({ endBottom: 64 + 900, viewportTop: 64, viewportHeight: 736, scrollTop: 0 })).toBe(true);
    expect(endBelowFold({ endBottom: 64 + 700, viewportTop: 64, viewportHeight: 736, scrollTop: 0 })).toBe(false);
  });
  it('treats a one-pixel overflow as fitting', () => {
    expect(endBelowFold({ endBottom: 801, viewportTop: 0, viewportHeight: 800, scrollTop: 0 })).toBe(false);
    expect(endBelowFold({ endBottom: 802, viewportTop: 0, viewportHeight: 800, scrollTop: 0 })).toBe(true);
  });
});
