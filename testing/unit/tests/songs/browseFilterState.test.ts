// Story 6.2.19 / G5.2 (#522): the filter state carries the songbook and the language (matching: browseFilters.test.ts).
import { describe, expect, it } from 'vitest';
import { isDraftActive, songFilterConfig, type SongFilterState } from '@/lib/songs/filterConfig';

const base: SongFilterState = { status: 'all' };
describe('songbook and language in the filter state', () => {
  it('either one makes the draft active (so "Clear all" and the active dot work)', () => {
    expect(isDraftActive(base)).toBe(false);
    expect(isDraftActive({ ...base, songbook: 'bk-b' })).toBe(true);
    expect(isDraftActive({ ...base, language: 'espanol' })).toBe(true);
    expect(isDraftActive({ ...base, songbook: '', language: '' })).toBe(false);
  });

  it('the engine config does not know the two filters: the hook applies them itself, so it can count without them', () => {
    expect(songFilterConfig.songbook).toBeUndefined();
    expect(songFilterConfig.language).toBeUndefined();
  });
});
