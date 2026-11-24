import { describe, expect, it } from 'vitest';
import { roundSongCount } from '@/lib/songs/songSearchCount';

describe('roundSongCount (#657)', () => {
  it('rounds a large library down to the hundred', () => {
    expect(roundSongCount(1001)).toBe(1000);
    expect(roundSongCount(1499)).toBe(1400);
    expect(roundSongCount(200)).toBe(200);
  });

  it('rounds a small library down to the ten', () => {
    expect(roundSongCount(99)).toBe(90);
    expect(roundSongCount(15)).toBe(10);
  });

  it('keeps a very small count as it is', () => {
    expect(roundSongCount(7)).toBe(7);
    expect(roundSongCount(1)).toBe(1);
  });

  it('returns null when there is nothing to count or the count is unknown', () => {
    expect(roundSongCount(0)).toBeNull();
    expect(roundSongCount(null)).toBeNull();
    expect(roundSongCount(undefined)).toBeNull();
    expect(roundSongCount(-3)).toBeNull();
    expect(roundSongCount(Number.NaN)).toBeNull();
  });
});
