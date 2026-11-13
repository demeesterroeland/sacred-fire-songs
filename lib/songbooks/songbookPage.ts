/**
 * The page of one songbook (Story 6.2.11 / G2.2, #514): the songs of a printed book in the order of its pages.
 * Pure helpers (ordering, grouping, links) shared by the server query and the page; no I/O.
 *
 * A source's `page` is free text ("38", "12a", "38–39", "A-12", "p. 38"), so it is compared as a person reads it:
 * numbers as numbers ("2" before "10"), "12" before "12a" before "13", an importer prefix ignored, a missing page last.
 */
import { ROMAN_PAGE, cleanPage, differingOriginalTitle } from '@/lib/songs/versionSources';

/** A song as `song_versions → compositions` returns it; a many-to-one embed is an object, a one-item array is accepted too. */
export interface RawSongbookSong {
  id: string;
  /** Absent in the lean select that only counts songs. */
  title?: string;
  original_author?: string | null;
  authors?: ReadonlyArray<string | null> | null;
  is_public?: boolean | null;
}

export interface RawSongbookVersion {
  id: string;
  created_at?: string | null;
  compositions?: RawSongbookSong | RawSongbookSong[] | null;
}

/** One `song_version_sources` row of the book with its version and song, as `SONGBOOK_PAGE_SELECT` returns it. */
export interface RawSongbookSource {
  id: string;
  page?: string | null;
  original_title?: string | null;
  is_primary?: boolean | null;
  /** `null` when the version (so the song) is not readable for the viewer. */
  song_versions?: RawSongbookVersion | RawSongbookVersion[] | null;
}

/** One row of the page: a song at one page of the book. */
export interface SongbookEntry {
  /** Stable key: the song and its page. */
  key: string;
  songId: string;
  /** The version that is printed here: the one the row links to. */
  versionId: string;
  title: string;
  /** The page without importer prefix; `null` when the book gives none. */
  page: string | null;
  /** Only when it differs from the song's title. */
  originalTitle: string | null;
  authors: string[];
  originalAuthor: string | null;
  isPublic: boolean;
  /** Every `song_version_sources.id` merged into this row, so a link can anchor to any of them. */
  sourceIds: string[];
}

const collators = new Map<string, Intl.Collator>();
function pageCollator(locale: string): Intl.Collator {
  let c = collators.get(locale);
  if (!c) {
    c = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' });
    collators.set(locale, c);
  }
  return c;
}

const ROMAN_VALUES: Record<string, number> = { i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000 };

/** The number of a roman page ("ix" → 9) or of a roman range by its first page ("iv-vi" → 4); `null` for any other page. */
function romanPageValue(page: string): number | null {
  const parts = page.split(/\s*[–—-]\s*/);
  const first = parts[0] ?? '';
  if (!parts.every((part) => ROMAN_PAGE.test(part))) return null;
  let total = 0;
  const digits = [...first.toLowerCase()].map((ch) => ROMAN_VALUES[ch]);
  digits.forEach((value, i) => {
    total += value < (digits[i + 1] ?? 0) ? -value : value;
  });
  return total;
}

/**
 * Natural order of two printed pages: numbers and section pages as the collator reads them, then the roman pages by
 * their value (iv, v, ix, x, xii, not alphabetically); a missing page sorts after every page, and two missing pages
 * are equal.
 */
export function comparePages(a: string | null | undefined, b: string | null | undefined, locale = 'en'): number {
  const pa = cleanPage(a);
  const pb = cleanPage(b);
  if (pa === null || pb === null) return Number(pa === null) - Number(pb === null);
  const ra = romanPageValue(pa);
  const rb = romanPageValue(pb);
  // Roman pages form their own group after the rest, so the order stays total (a collator and a value order never mix).
  if (ra === null || rb === null) return Number(ra !== null) - Number(rb !== null) || pageCollator(locale).compare(pa, pb);
  return ra - rb || pageCollator(locale).compare(pa, pb);
}

const one = <T>(v: T | T[] | null | undefined): T | null => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null));

interface Resolved {
  source: RawSongbookSource;
  version: RawSongbookVersion;
  song: RawSongbookSong;
}

/** Sources whose version and song the viewer can read (row-level security hides the rest, and so does this). */
function readable(sources: ReadonlyArray<RawSongbookSource> | null | undefined): Resolved[] {
  return (sources ?? []).flatMap((source) => {
    const version = one(source.song_versions);
    const song = version ? one(version.compositions) : null;
    return version && song ? [{ source, version, song }] : [];
  });
}

/** Which of several versions on the same page the row links to: the primary source, then the oldest version, then by id. */
function byPreference(a: Resolved, b: Resolved): number {
  return (
    Number(!!b.source.is_primary) - Number(!!a.source.is_primary) ||
    (a.version.created_at ?? '').localeCompare(b.version.created_at ?? '') ||
    a.version.id.localeCompare(b.version.id)
  );
}

/**
 * The rows of a songbook page, in page order, then by title, then by song id (so the order never depends on what
 * PostgREST returned). A song printed on several pages is listed once per page, each row linking to the version
 * printed there; versions of one song on the SAME page are one row.
 */
export function buildSongbookEntries(sources: ReadonlyArray<RawSongbookSource> | null | undefined, locale = 'en'): SongbookEntry[] {
  const groups = new Map<string, Resolved[]>();
  for (const r of readable(sources)) {
    const key = `${r.song.id}|${(cleanPage(r.source.page) ?? '').toLowerCase()}`;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  const entries = [...groups.entries()].map(([key, members]): SongbookEntry => {
    const sorted = [...members].sort(byPreference);
    const { source, version, song } = sorted[0];
    return {
      key,
      songId: song.id,
      versionId: version.id,
      title: song.title ?? '',
      page: cleanPage(source.page),
      originalTitle: differingOriginalTitle(source.original_title, song.title ?? ''),
      authors: (song.authors ?? []).filter((a): a is string => !!a && a.trim() !== ''),
      originalAuthor: song.original_author ?? null,
      isPublic: song.is_public !== false,
      sourceIds: sorted.map((m) => m.source.id),
    };
  });
  return entries.sort(
    (a, b) =>
      comparePages(a.page, b.page, locale) ||
      a.title.localeCompare(b.title, locale, { sensitivity: 'base' }) ||
      a.songId.localeCompare(b.songId)
  );
}

/** How many different songs the viewer can read in the book (a song printed twice counts once). */
export function countSongbookSongs(sources: ReadonlyArray<RawSongbookSource> | null | undefined): number {
  return new Set(readable(sources).map((r) => r.song.id)).size;
}

/** The song page at the version printed in the book. */
export function songbookSongHref(entry: Pick<SongbookEntry, 'songId' | 'versionId'>): string {
  return `/songs/${encodeURIComponent(entry.songId)}?version=${encodeURIComponent(entry.versionId)}`;
}

/** The DOM id of the row that holds a source (`songbookHref` anchors to it). */
export const sourceAnchor = (sourceId: string): string => `source-${sourceId}`;

/** The page of a book, optionally scrolled to the row of one source (the source line links with it). */
export function songbookHref(bookId: string, sourceId?: string): string {
  return `/songbooks/${encodeURIComponent(bookId)}${sourceId ? `#${sourceAnchor(sourceId)}` : ''}`;
}

// ── books ───────────────────────────────────────────────────────────────────

/** A `songbooks` row with its nested sources, as `SONGBOOK_PAGE_SELECT` (all fields) or `SONGBOOK_LIST_SELECT` (counting only) returns it. */
export interface RawSongbook {
  id: string;
  title: string;
  short_name?: string | null;
  compiler?: string | null;
  community?: string | null;
  year?: number | null;
  languages?: string[] | null;
  attribution?: string | null;
  song_version_sources?: RawSongbookSource[] | null;
}

export interface SongbookSummary {
  id: string;
  title: string;
  shortName: string | null;
  compiler: string | null;
  year: number | null;
  /** Songs the viewer can read in the book. */
  songCount: number;
}

export interface SongbookDetail extends SongbookSummary {
  community: string | null;
  languages: string[];
  attribution: string | null;
  /** The songs by page. */
  entries: SongbookEntry[];
}

const text = (v: string | null | undefined): string | null => (v && v.trim() ? v.trim() : null);

export function summarizeSongbook(book: RawSongbook): SongbookSummary {
  return {
    id: book.id,
    title: book.title,
    shortName: text(book.short_name),
    compiler: text(book.compiler),
    year: book.year ?? null,
    songCount: countSongbookSongs(book.song_version_sources),
  };
}

/**
 * The books of the list page, by title. A book without a song the viewer can read is left out (an admin reads books no
 * version cites yet): the list is for finding songs.
 */
export function buildSongbookList(books: ReadonlyArray<RawSongbook>, locale = 'en'): SongbookSummary[] {
  return books
    .map(summarizeSongbook)
    .filter((b) => b.songCount > 0)
    .sort((a, b) => a.title.localeCompare(b.title, locale, { sensitivity: 'base' }) || a.id.localeCompare(b.id));
}

/** The page of one book; `null` for no book (unknown, or not readable: the page answers 404). */
export function buildSongbookDetail(book: RawSongbook | null | undefined, locale = 'en'): SongbookDetail | null {
  if (!book) return null;
  return {
    ...summarizeSongbook(book),
    community: text(book.community),
    languages: (book.languages ?? []).filter((l) => !!l),
    attribution: text(book.attribution),
    entries: buildSongbookEntries(book.song_version_sources, locale),
  };
}

/** The book id of a `/songbooks/<id>` URL: the route gives the segment as written (`a%20b`), the id is `a b`. A malformed escape is taken as written. */
export function songbookIdFromParam(param: string): string {
  try {
    return decodeURIComponent(param);
  } catch {
    return param;
  }
}
