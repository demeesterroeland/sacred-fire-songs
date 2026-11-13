// Story 6.2.19 / G5.2 (#522): the filter state carries the songbook and the language, and the list config uses them.
import { describe, expect, it } from 'vitest';
import { isDraftActive, songFilterConfig, type SongFilterState } from '@/lib/songs/filterConfig';
import type { Song } from '@/lib/songUtils';

const base: SongFilterState = { status: 'all' };
const song = (over: Partial<Song>): Song =>
  ({ id: 's', title: 'T', author: '', songKey: null, color: 'red', createdAt: '2026-01-01T00:00:00Z', categories: [], songbooks: [], ...over }) as Song;

describe('songbook and language in the filter state', () => {
  it('either one makes the draft active (so "Clear all" and the active dot work)', () => {
    expect(isDraftActive(base)).toBe(false);
    expect(isDraftActive({ ...base, songbook: 'bk-b' })).toBe(true);
    expect(isDraftActive({ ...base, language: 'espanol' })).toBe(true);
    expect(isDraftActive({ ...base, songbook: '', language: '' })).toBe(false);
  });

  it('the list config matches a song of book B and drops a song of book A only', () => {
    const cfg = songFilterConfig.songbook!;
    expect(cfg.isActive('bk-b')).toBe(true);
    expect(cfg.isActive(undefined)).toBe(false);
    expect(cfg.match(song({ songbooks: [{ id: 'bk-b', name: 'Songbook B' }] }), 'bk-b')).toBe(true);
    expect(cfg.match(song({ songbooks: [{ id: 'bk-a', name: 'Songbook A' }] }), 'bk-b')).toBe(false);
  });

  it('the list config matches the language category slug', () => {
    const cfg = songFilterConfig.language!;
    const es = song({ categories: [{ name: 'Spanish', slug: 'espanol', parent: 'Languages', parentSlug: 'languages' }] });
    expect(cfg.isActive('espanol')).toBe(true);
    expect(cfg.match(es, 'espanol')).toBe(true);
    expect(cfg.match(es, 'english')).toBe(false);
  });
});
