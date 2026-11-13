// @vitest-environment jsdom
// Story 6.2.19 / G5.2 (#522): the song list hook reads ?songbook= and ?language=, lists only those songs and
// counts the options over what the other filters leave.
import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { Song } from '@/lib/songUtils';

let query = '';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/songs',
  useSearchParams: () => new URLSearchParams(query),
}));

import { useSongsFilter } from '@/hooks/useSongsFilter';

const lang = (name: string, slug: string) => ({ name, slug, parent: 'Languages', parentSlug: 'languages' });
const A = { id: 'bk-a', name: 'Songbook A' };
const B = { id: 'bk-b', name: 'Songbook B' };
const mk = (id: string, title: string, songbooks: Song['songbooks'], categories: Song['categories']): Song =>
  ({ id, title, author: '', songKey: null, color: 'red', createdAt: '2026-01-01T00:00:00Z', songbooks, categories }) as Song;
const songs = [
  mk('1', 'Alpha', [A], [lang('Spanish', 'espanol')]),
  mk('2', 'Bravo', [B], [lang('English', 'english')]),
  mk('3', 'Charlie', [A, B], [lang('English', 'english')]),
  mk('4', 'Delta', [], []),
];

function run(q: string) {
  query = q;
  return renderHook(() =>
    useSongsFilter({ songs, favoriteIds: new Set(), viewedSongIds: new Set(), sortBy: 'title', locale: 'en' })
  ).result.current;
}

describe('useSongsFilter: songbook and language', () => {
  it('lists every song without a filter', () => {
    const r = run('');
    expect(r.displaySongs.map((s) => s.title)).toEqual(['Alpha', 'Bravo', 'Charlie', 'Delta']);
    expect(r.hasActiveFilters).toBe(false);
  });

  it('?songbook=bk-b lists only the songs with a version from that book', () => {
    const r = run('songbook=bk-b');
    expect(r.displaySongs.map((s) => s.title)).toEqual(['Bravo', 'Charlie']);
    expect(r.filteredCount).toBe(2);
    expect(r.hasActiveFilters).toBe(true);
  });

  it('?language=espanol lists the Spanish songs', () => {
    expect(run('language=espanol').displaySongs.map((s) => s.title)).toEqual(['Alpha']);
  });

  it('both filters, and a text search, narrow together', () => {
    expect(run('songbook=bk-a&language=english').displaySongs.map((s) => s.title)).toEqual(['Charlie']);
    expect(run('songbook=bk-b&search=bravo').displaySongs.map((s) => s.title)).toEqual(['Bravo']);
  });

  it('counts the options over the songs the text search leaves, but lists every option', () => {
    const r = run('search=charlie');
    expect(r.browseOptionsFor({}).songbooks.map((o) => [o.value, o.count])).toEqual([['bk-a', 1], ['bk-b', 1]]);
    expect(r.browseOptionsFor({}).languages.map((o) => [o.value, o.count])).toEqual([['english', 1], ['espanol', 0]]);
  });

  it('counts for the choice the sheet shows (a draft), not only the committed one', () => {
    const r = run('');
    expect(r.browseOptionsFor({ language: 'english' }).songbooks.map((o) => [o.value, o.count])).toEqual([['bk-a', 1], ['bk-b', 2]]);
    expect(r.browseOptionsFor({ songbook: 'bk-b' }).languages.map((o) => [o.value, o.count])).toEqual([['english', 2], ['espanol', 0]]);
  });
});
