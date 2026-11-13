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
const C = { id: 'bk-c', name: 'Songbook C' };
const mk = (id: string, title: string, songbooks: Song['songbooks'], categories: Song['categories'], over: Partial<Song> = {}): Song =>
  ({ id, title, author: '', songKey: null, color: 'red', createdAt: '2026-01-01T00:00:00Z', songbooks, categories, ...over }) as Song;
const songs = [
  mk('1', 'Alpha', [A], [lang('Spanish', 'espanol')], { hasChords: true }),
  mk('2', 'Bravo', [B], [lang('English', 'english')]),
  mk('3', 'Charlie', [A, B], [lang('English', 'english')], { hasChords: true }),
  mk('4', 'Delta', [], []),
  // chords exist only in book A and B; book C has a melody-only song
  mk('5', 'Echo', [C], [lang('French', 'french')], { hasMelody: true }),
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
    expect(r.displaySongs.map((s) => s.title)).toEqual(['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo']);
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
    expect(r.browseOptionsFor(r.state).songbooks.map((o) => [o.value, o.count])).toEqual([['bk-a', 1], ['bk-b', 1], ['bk-c', 0]]);
    expect(r.browseOptionsFor(r.state).languages.map((o) => [o.value, o.count])).toEqual([['english', 1], ['french', 0], ['espanol', 0]]);
  });

  it('counts for the choice the sheet shows (a draft), not only the committed one', () => {
    const r = run('');
    expect(r.browseOptionsFor({ ...r.state, language: 'english' }).songbooks.map((o) => [o.value, o.count])).toEqual([['bk-a', 1], ['bk-b', 2], ['bk-c', 0]]);
    expect(r.browseOptionsFor({ ...r.state, songbook: 'bk-b' }).languages.map((o) => [o.value, o.count])).toEqual([['english', 2], ['french', 0], ['espanol', 0]]);
  });

  // Finding 1 of the review of #561: the counts followed the APPLIED filters, so options stayed disabled in the sheet
  // after the user switched a filter off there.
  it('counts for the whole draft: chords switched off in the sheet re-enables the book without chord songs', () => {
    const r = run('chords=true');
    expect(r.browseOptionsFor(r.state).songbooks.find((o) => o.value === 'bk-c')?.count).toBe(0);
    const draft = { ...r.state, chords: false };
    expect(r.browseOptionsFor(draft).songbooks.map((o) => [o.value, o.count])).toEqual([['bk-a', 2], ['bk-b', 2], ['bk-c', 1]]);
    expect(r.browseOptionsFor(draft).languages.find((o) => o.value === 'french')?.count).toBe(1);
  });

  it('counts for the draft search text: clearing the search in the sheet counts every song again', () => {
    const r = run('search=alpha');
    expect(r.browseOptionsFor(r.state).songbooks.map((o) => o.count)).toEqual([1, 0, 0]);
    expect(r.browseOptionsFor({ ...r.state, search: '' }).songbooks.map((o) => o.count)).toEqual([2, 2, 1]);
    expect(r.browseOptionsFor({ ...r.state, search: 'echo' }).songbooks.map((o) => o.count)).toEqual([0, 0, 1]);
  });

  it('counts for a draft favourites choice', () => {
    query = '';
    const favoriteIds = new Set(['5']);
    const r = renderHook(() =>
      useSongsFilter({ songs, favoriteIds, viewedSongIds: new Set(), sortBy: 'title', locale: 'en' })
    ).result.current;
    expect(r.browseOptionsFor({ ...r.state, favorites: true }).songbooks.map((o) => o.count)).toEqual([0, 0, 1]);
    expect(r.browseOptionsFor({ ...r.state, favorites: false }).songbooks.map((o) => o.count)).toEqual([2, 2, 1]);
  });
});

describe('useSongsFilter: legacy language links (Story 6.2.24, #569)', () => {
  const withDutch = [
    ...songs,
    mk('6', 'Zonnelied', [A], [lang('Dutch', 'dutch'), { name: 'Fire', slug: 'fire', parent: 'The Elements', parentSlug: 'the-elements' }]),
  ];

  function runWith(q: string, list = withDutch, taxonomy?: { id: string; name: string; slug: string; emoji: null; icon_name: null; children: { id: string; name: string; slug: string; emoji: null; icon_name: null; children: [] }[] }[]) {
    query = q;
    return renderHook(() =>
      useSongsFilter({ songs: list, taxonomy, favoriteIds: new Set(), viewedSongIds: new Set(), sortBy: 'title', locale: 'en' })
    ).result.current;
  }

  it('?category=dutch lists only Dutch songs and selects "dutch" in the Language filter', () => {
    const r = runWith('category=dutch');
    expect(r.displaySongs.map((s) => s.title)).toEqual(['Zonnelied']);
    expect(r.state.language).toBe('dutch');
    expect(r.state.category).toBeUndefined();
    expect(r.hasActiveFilters).toBe(true);
    expect(r.browseOptionsFor(r.state).languages.find((o) => o.value === 'dutch')?.label).toBe('Dutch');
  });

  it('?tag=dutch and ?tags=dutch list only Dutch songs and select "dutch" in the Language filter', () => {
    for (const param of ['tag=dutch', 'tags=dutch']) {
      const r = runWith(param);
      expect(r.displaySongs.map((s) => s.title)).toEqual(['Zonnelied']);
      expect(r.state.language).toBe('dutch');
      expect(r.state.tags).toEqual([]);
    }
  });

  it('?tag=fire,dutch keeps "fire" as a tag and moves "dutch" to the Language filter', () => {
    const r = runWith('tag=fire,dutch');
    expect(r.displaySongs.map((s) => s.title)).toEqual(['Zonnelied']);
    expect(r.state.tags).toEqual(['fire']);
    expect(r.state.language).toBe('dutch');
  });

  it('?category=nature&tag=dutch keeps "nature" in category and moves "dutch" to language', () => {
    const r = runWith('category=nature&tag=dutch');
    expect(r.state.category).toBe('nature');
    expect(r.state.tags).toEqual([]);
    expect(r.state.language).toBe('dutch');
  });

  it('an explicit ?language=espanol takes precedence over a legacy ?category=dutch without zeroing results', () => {
    const r = runWith('category=dutch&language=espanol');
    expect(r.displaySongs.map((s) => s.title)).toEqual(['Alpha']);
    expect(r.state.language).toBe('espanol');
    expect(r.state.category).toBeUndefined();
  });

  it('?category=languages (the parent group) keeps filtering by any language category', () => {
    const r = runWith('category=languages');
    expect(r.displaySongs.map((s) => s.title)).toEqual(['Alpha', 'Bravo', 'Charlie', 'Echo', 'Zonnelied']);
    expect(r.state.category).toBe('languages');
    expect(r.state.language).toBe('');
  });

  it('recognizes a language slug from taxonomy even when no song in the list carries it', () => {
    const taxonomy = [
      {
        id: 'g-lang',
        name: 'Languages',
        slug: 'languages',
        emoji: null,
        icon_name: null,
        children: [{ id: 'c-nl', name: 'Dutch', slug: 'dutch', emoji: null, icon_name: null, children: [] as [] }],
      },
    ];
    const r = runWith('category=dutch', songs, taxonomy);
    expect(r.displaySongs).toEqual([]);
    expect(r.state.language).toBe('dutch');
    expect(r.state.category).toBeUndefined();
  });
});
