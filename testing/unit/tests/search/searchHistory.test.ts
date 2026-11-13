// @vitest-environment jsdom
// Story 6.1.29 / G7.1 (#413): recent searches live in localStorage, newest first, capped at 5, never throw.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MAX_RECENT_SEARCHES,
  SEARCH_HISTORY_KEY,
  addRecentSearch,
  clearRecentSearches,
  readRecentSearches,
  removeRecentSearch,
} from '@/lib/search/history';

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('recent searches', () => {
  it('keeps the last 5 searches, newest first', () => {
    expect(MAX_RECENT_SEARCHES).toBe(5);
    for (const term of ['a1', 'b2', 'c3', 'd4', 'e5', 'f6']) addRecentSearch(term);
    expect(readRecentSearches()).toEqual(['f6', 'e5', 'd4', 'c3', 'b2']);
  });

  it('shows only 5 even when an older build stored 8', () => {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(['1', '2', '3', '4', '5', '6', '7', '8']));
    expect(readRecentSearches()).toEqual(['1', '2', '3', '4', '5']);
  });

  it('moves a repeated term to the top, trims it and ignores blanks', () => {
    addRecentSearch('agua');
    addRecentSearch('fuego');
    addRecentSearch('  agua ');
    addRecentSearch('   ');
    expect(readRecentSearches()).toEqual(['agua', 'fuego']);
  });

  it('removes one term or all of them', () => {
    addRecentSearch('agua');
    addRecentSearch('fuego');
    expect(removeRecentSearch('agua')).toEqual(['fuego']);
    expect(readRecentSearches()).toEqual(['fuego']);
    clearRecentSearches();
    expect(readRecentSearches()).toEqual([]);
  });

  it('survives corrupt or non-array data', () => {
    localStorage.setItem(SEARCH_HISTORY_KEY, '{nope');
    expect(readRecentSearches()).toEqual([]);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify({ a: 1 }));
    expect(readRecentSearches()).toEqual([]);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(['ok', 3, null, '']));
    expect(readRecentSearches()).toEqual(['ok']);
  });

  it('never throws when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readRecentSearches()).toEqual([]);
    expect(() => addRecentSearch('agua')).not.toThrow();
    expect(() => removeRecentSearch('agua')).not.toThrow();
    expect(() => clearRecentSearches()).not.toThrow();
  });
});
