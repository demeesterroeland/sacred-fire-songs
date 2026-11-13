// Story 6.2.11 / G2.2 (#514): each songbook select embeds `song_version_sources (` exactly once (a duplicate embed makes
// PostgREST fail the whole query with 42803, like the song selects: songSelectGuard.test.ts).
import { describe, expect, it } from 'vitest';
import { SONGBOOK_LIST_SELECT, SONGBOOK_PAGE_SELECT } from '@/lib/songbooks/songbookSelect';

const EMBED = /song_version_sources(![\w]+)?\s*\(/g;

describe('songbook selects', () => {
  it.each([
    ['page', SONGBOOK_PAGE_SELECT],
    ['list', SONGBOOK_LIST_SELECT],
  ])('the %s select embeds song_version_sources once', (_name, select) => {
    expect(select.match(EMBED)?.length).toBe(1);
  });

  it('the page select asks for everything a row needs', () => {
    for (const col of ['page', 'original_title', 'is_primary', 'attribution', 'compiler', 'is_public', 'original_author', 'authors', 'created_at']) {
      expect(SONGBOOK_PAGE_SELECT).toContain(col);
    }
  });

  it('the list select does not load titles, pages or authors', () => {
    for (const col of ['original_title', 'original_author', 'attribution', 'page']) expect(SONGBOOK_LIST_SELECT).not.toContain(col);
  });
});
