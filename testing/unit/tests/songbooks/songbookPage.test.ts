// Story 6.2.11 / G2.2 (#514): the order, grouping and links of a songbook page (pure, L2).
import { describe, expect, it } from 'vitest';
import {
  buildSongbookDetail,
  buildSongbookEntries,
  buildSongbookList,
  comparePages,
  countSongbookSongs,
  songbookHref,
  songbookIdFromParam,
  songbookSongHref,
  sourceAnchor,
  type RawSongbookSource,
} from '@/lib/songbooks/songbookPage';

let seq = 0;
function src(title: string, page: string | null, over: Partial<RawSongbookSource> & { songId?: string; versionId?: string } = {}): RawSongbookSource {
  seq += 1;
  const songId = over.songId ?? `song-${title}`;
  return {
    id: over.id ?? `src-${seq}`,
    page,
    original_title: over.original_title ?? null,
    is_primary: over.is_primary ?? false,
    song_versions: {
      id: over.versionId ?? `ver-${seq}`,
      created_at: `2026-01-${String(seq % 28 + 1).padStart(2, '0')}T00:00:00Z`,
      compositions: { id: songId, title, original_author: 'Author A', authors: [], is_public: true },
    },
  };
}
const titles = (rows: RawSongbookSource[]) => buildSongbookEntries(rows).map((e) => e.title);
const pages = (rows: RawSongbookSource[]) => buildSongbookEntries(rows).map((e) => e.page);

describe('comparePages', () => {
  const sort = (xs: (string | null)[]) => [...xs].sort((a, b) => comparePages(a, b));
  it('orders numbers as numbers', () => {
    expect(sort(['10', '2', '1', '100', '9'])).toEqual(['1', '2', '9', '10', '100']);
  });
  it('puts a lettered page after its number and before the next', () => {
    expect(sort(['13', '12a', '2', '12', '12b'])).toEqual(['2', '12', '12a', '12b', '13']);
  });
  it('ignores an importer prefix and white space', () => {
    expect(sort(['p. 10', ' 9 ', 'pp. 2–3'])).toEqual(['pp. 2–3', ' 9 ', 'p. 10']);
  });
  it('orders section-page numbers by section then number', () => {
    expect(sort(['A-10', 'A-2', 'A-1', 'B-1'])).toEqual(['A-1', 'A-2', 'A-10', 'B-1']);
  });
  it('orders a range by its first page', () => {
    expect(sort(['40', '38-39', '7'])).toEqual(['7', '38-39', '40']);
  });
  it('orders roman pages as numbers (iv, v, ix, x, xii), after the numbered pages', () => {
    expect(sort(['xii', 'x', 'v', 'ix', 'iv'])).toEqual(['iv', 'v', 'ix', 'x', 'xii']);
    expect(sort(['IV', '3', 'ii', '10', 'xl', 'ix'])).toEqual(['3', '10', 'ii', 'IV', 'ix', 'xl']);
  });
  it('orders a roman range by its first page and keeps the order total', () => {
    expect(sort(['x', 'iv-vi', 'v', 'ix'])).toEqual(['iv-vi', 'v', 'ix', 'x']);
    expect(sort(['xii', 'M-1', 'v', 'ix', 'A-1'])).toEqual(['A-1', 'M-1', 'v', 'ix', 'xii']);
  });
  it('puts a missing page last (null, empty, blank, bare prefix)', () => {
    expect(sort([null, '3', '', '1', '  ', 'p.'])).toEqual(['1', '3', null, '', '  ', 'p.']);
  });
  it('treats equal pages as equal', () => {
    expect(comparePages('12', 'p. 12')).toBe(0);
    expect(comparePages(null, '')).toBe(0);
  });
});

describe('buildSongbookEntries', () => {
  it('lists songs by page, then title', () => {
    const rows = [src('Song C', '20'), src('Song A', '3'), src('Song B', '11'), src('Song Z', null), src('Song Y', '3')];
    expect(titles(rows)).toEqual(['Song A', 'Song Y', 'Song B', 'Song C', 'Song Z']);
  });

  it('does not depend on the order PostgREST returned', () => {
    const rows = [src('Song B', '5'), src('Song A', '5'), src('Song C', null), src('Song D', null)];
    expect(titles(rows)).toEqual(titles([...rows].reverse()));
  });

  it('shows the page without an importer prefix, null without one', () => {
    expect(pages([src('A', 'p. 38'), src('B', ' '), src('C', null)])).toEqual(['38', null, null]);
  });

  it('lists a song once per distinct page and links each row to its own version', () => {
    const rows = [src('Song A', '30', { songId: 's1', versionId: 'v2' }), src('Song A', '4', { songId: 's1', versionId: 'v1' })];
    const entries = buildSongbookEntries(rows);
    expect(entries.map((e) => [e.page, e.versionId])).toEqual([['4', 'v1'], ['30', 'v2']]);
  });

  it('lists two versions on the same page once; the primary source wins, else the oldest version', () => {
    const a = src('Song A', '4', { songId: 's1', versionId: 'v-new' });
    const b = src('Song A', 'p. 4', { songId: 's1', versionId: 'v-old' });
    (a.song_versions as { created_at: string }).created_at = '2026-05-01T00:00:00Z';
    (b.song_versions as { created_at: string }).created_at = '2026-01-01T00:00:00Z';
    let [only, ...rest] = buildSongbookEntries([a, b]);
    expect(rest).toEqual([]);
    expect(only.versionId).toBe('v-old');
    expect(only.sourceIds.sort()).toEqual([a.id, b.id].sort());
    a.is_primary = true;
    [only, ...rest] = buildSongbookEntries([a, b]);
    expect(only.versionId).toBe('v-new');
  });

  it('merges a song printed twice without a page into one row', () => {
    const rows = [src('Song A', null, { songId: 's1' }), src('Song A', '  ', { songId: 's1' })];
    expect(buildSongbookEntries(rows)).toHaveLength(1);
  });

  it('keeps two different songs with the same title and page apart', () => {
    expect(buildSongbookEntries([src('Rise Up', '4', { songId: 's1' }), src('Rise Up', '4', { songId: 's2' })])).toHaveLength(2);
  });

  it('shows the original title only when it differs from the title', () => {
    const rows = [src('Rise Up', '1', { original_title: 'Subir' }), src('Rise Up', '2', { original_title: 'rise up!' }), src('Rise Up', '3')];
    expect(buildSongbookEntries(rows).map((e) => e.originalTitle)).toEqual(['Subir', null, null]);
  });

  it('carries the authors and visibility', () => {
    const row = src('Song A', '1');
    const comp = (row.song_versions as { compositions: { authors: string[]; is_public: boolean } }).compositions;
    comp.authors = ['Author A', 'Author B'];
    comp.is_public = false;
    const [entry] = buildSongbookEntries([row]);
    expect(entry).toMatchObject({ authors: ['Author A', 'Author B'], originalAuthor: 'Author A', isPublic: false });
  });

  it('skips a source whose version or song is not readable, and tolerates one-item arrays', () => {
    const hidden: RawSongbookSource = { id: 'h', page: '1', is_primary: false, song_versions: null };
    const noSong: RawSongbookSource = { id: 'n', page: '1', is_primary: false, song_versions: { id: 'v', created_at: null, compositions: null } };
    const arr = src('Song A', '2');
    const wrapped = { ...arr, song_versions: [{ ...(arr.song_versions as object), compositions: [(arr.song_versions as { compositions: object }).compositions] }] } as unknown as RawSongbookSource;
    expect(titles([hidden, noSong, wrapped])).toEqual(['Song A']);
  });

  it('returns nothing for no sources', () => {
    expect(buildSongbookEntries([])).toEqual([]);
    expect(buildSongbookEntries(null)).toEqual([]);
  });
});

describe('countSongbookSongs', () => {
  it('counts songs, not printed versions or pages', () => {
    const rows = [src('A', '4', { songId: 's1' }), src('A', '30', { songId: 's1' }), src('B', '5', { songId: 's2' })];
    expect(countSongbookSongs(rows)).toBe(2);
  });
  it('is 0 for nothing readable', () => {
    expect(countSongbookSongs([{ id: 'h', page: null, is_primary: false, song_versions: null }])).toBe(0);
    expect(countSongbookSongs(undefined)).toBe(0);
  });
});

describe('links', () => {
  it('links a row to its version', () => {
    expect(songbookSongHref({ songId: 's1', versionId: 'v1' })).toBe('/songs/s1?version=v1');
  });
  it('escapes a book id and anchors to a source', () => {
    expect(songbookHref('a b/c')).toBe('/songbooks/a%20b%2Fc');
    expect(songbookHref('book-a', 'src-1')).toBe('/songbooks/book-a#source-src-1');
    expect(sourceAnchor('src-1')).toBe('source-src-1');
  });
});

describe('buildSongbookList', () => {
  const book = (id: string, title: string, sources: RawSongbookSource[]) => ({ id, title, song_version_sources: sources });
  it('sorts by title, counts songs, and leaves out books without a readable song', () => {
    const list = buildSongbookList([
      book('b', 'Songbook B', [src('A', '1', { songId: 'x' }), src('B', '2', { songId: 'y' }), src('B', '3', { songId: 'y' })]),
      book('a', 'songbook A', [src('C', '1', { songId: 'z' })]),
      book('c', 'Songbook C', []),
      book('d', 'Songbook D', [{ id: 'h', page: '1', is_primary: false, song_versions: null }]),
    ]);
    expect(list.map((b) => [b.id, b.songCount])).toEqual([['a', 1], ['b', 2]]);
  });
});

describe('buildSongbookDetail', () => {
  it('is null for no book', () => {
    expect(buildSongbookDetail(null)).toBeNull();
    expect(buildSongbookDetail(undefined)).toBeNull();
  });
  it('trims the texts, drops blanks and lists the songs by page', () => {
    const detail = buildSongbookDetail({
      id: 'a', title: 'Songbook A', compiler: ' Compiler A ', community: '  ', attribution: '', year: 1998, languages: ['es', ''],
      song_version_sources: [src('B', '9'), src('A', '2')],
    });
    expect(detail).toMatchObject({ compiler: 'Compiler A', community: null, attribution: null, year: 1998, languages: ['es'], songCount: 2 });
    expect(detail!.entries.map((e) => e.title)).toEqual(['A', 'B']);
  });
  it('is an empty book (not null) when the viewer reads the book but none of its songs', () => {
    expect(buildSongbookDetail({ id: 'a', title: 'Songbook A', song_version_sources: [] })).toMatchObject({ entries: [], songCount: 0 });
  });
});

describe('songbookIdFromParam', () => {
  it('reads the id the link wrote', () => {
    expect(songbookIdFromParam(songbookHref('a b/c').replace('/songbooks/', ''))).toBe('a b/c');
    expect(songbookIdFromParam('book-a')).toBe('book-a');
  });
  it('takes a malformed escape as written instead of failing', () => {
    expect(songbookIdFromParam('100%')).toBe('100%');
  });
});
