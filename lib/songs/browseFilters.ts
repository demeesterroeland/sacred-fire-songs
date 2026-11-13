/**
 * Browse by songbook or by language (Story 6.2.19 / G5.2, #522).
 *
 * The song list is fetched whole and filtered in memory (owner decision on #521: no search index in the database), so
 * these two filters are plain predicates over what every `Song` already carries: the books its versions were printed
 * in (`song.songbooks`, from the one `song_version_sources` embed of the list select) and its language categories
 * (the children of the "Languages" group). Pure and framework-free, so the filter sheet, the song list hook and the
 * sibling search stories (#542, #547) share it.
 *
 * Both filters take ONE value (a songbook id, a language slug). Counts per option follow the usual faceted rule:
 * an option counts the songs that match everything else, and the other of these two filters, but never its own
 * choice - so "how many songs would I get if I picked this?" is always what the sheet shows.
 */
import type { Song } from '@/lib/songUtils';
import { bookName, type SourceBook } from '@/lib/songs/versionSources';

/**
 * The name of the group the language categories live under (`categories.name` of the parent). Shared with the row meta
 * line (`songRowMeta`), which shows only the FIRST language of a song, whereas the language filter matches ANY of them.
 */
export const LANGUAGES_PARENT_NAME = 'Languages';
/** Slug of that group. */
export const LANGUAGES_PARENT_SLUG = 'languages';

export interface SongbookRef {
  id: string;
  /** What the sheet shows: the book's title, else its short name. */
  name: string;
}

export interface LanguageRef {
  /** The language category's slug (what the URL carries). */
  slug: string;
  name: string;
}

/** The chosen values; both optional, empty means "no filter". */
export interface BrowseSelection {
  songbook?: string;
  language?: string;
}

/** One entry of a select: the value to store, the label to show and how many songs it would give. */
export interface BrowseOption {
  value: string;
  label: string;
  count: number;
}

/** The shape of a version row as the list select returns it; only the book of each source is read here. */
interface VersionWithSources {
  song_version_sources?:
    | { songbooks?: Partial<SourceBook> | Partial<SourceBook>[] | null }[]
    | null;
}

/** Every distinct book the versions were printed in, in the order first met. Sources without a readable, named book drop out. */
export function songbooksOfVersions(versions: ReadonlyArray<VersionWithSources> | null | undefined): SongbookRef[] {
  const seen = new Set<string>();
  const out: SongbookRef[] = [];
  for (const version of versions ?? []) {
    for (const source of version.song_version_sources ?? []) {
      const raw = Array.isArray(source.songbooks) ? source.songbooks[0] : source.songbooks;
      if (!raw?.id || seen.has(raw.id)) continue;
      const name = bookName({ id: raw.id, title: raw.title, short_name: raw.short_name });
      if (!name) continue;
      seen.add(raw.id);
      out.push({ id: raw.id, name });
    }
  }
  return out;
}

/** The language categories of a song, as `songRowMeta` reads them: a category under the "Languages" group. */
export function songLanguages(song: Pick<Song, 'categories'>): LanguageRef[] {
  const out: LanguageRef[] = [];
  const seen = new Set<string>();
  for (const c of song.categories ?? []) {
    if (c.parent !== LANGUAGES_PARENT_NAME && c.parentSlug !== LANGUAGES_PARENT_SLUG) continue;
    if (!c.slug || seen.has(c.slug)) continue;
    seen.add(c.slug);
    out.push({ slug: c.slug, name: c.name });
  }
  return out;
}

/** True without a songbook filter; else when any version of the song has a source in that book. */
export function matchesSongbook(song: Pick<Song, 'songbooks'>, songbookId: string | null | undefined): boolean {
  if (!songbookId) return true;
  return (song.songbooks ?? []).some((b) => b.id === songbookId);
}

/** True without a language filter; else when the song carries that language category. */
export function matchesLanguage(song: Pick<Song, 'categories'>, languageSlug: string | null | undefined): boolean {
  if (!languageSlug) return true;
  return songLanguages(song).some((l) => l.slug === languageSlug);
}

/** The songs matching both filters. Returns the same array when neither is set. */
export function applyBrowseFilters<T extends Pick<Song, 'songbooks' | 'categories'>>(
  songs: readonly T[],
  selection: BrowseSelection
): readonly T[] {
  if (!selection.songbook && !selection.language) return songs;
  return songs.filter((s) => matchesSongbook(s, selection.songbook) && matchesLanguage(s, selection.language));
}

/** Labels for a chosen value no song carries (a stale URL, a book that is no longer readable). Already translated. */
export interface BrowseFallbackLabels {
  unknownSongbook: string;
  unknownLanguage: string;
}

const byLabel = (locale?: string) => (a: BrowseOption, b: BrowseOption) =>
  a.label.localeCompare(b.label, locale, { sensitivity: 'base' }) || a.value.localeCompare(b.value);

/**
 * The options of both selects.
 *
 * @param all       every song: decides which options exist, so an option never vanishes because it counts 0 right now
 * @param base      the songs that pass every OTHER filter of the list (text search, categories, status, ...): counts come from here
 * @param selection the current choice; the songbook counts honour the language choice and the other way round
 * @param locale    sorts the labels
 * @param fallback  labels of a chosen value that no song has any more; it stays in its list (count 0) so the select never
 *                  shows a blank choice, and shows "Unknown songbook / language" instead of the raw id or slug
 */
export function browseOptions(
  all: readonly Pick<Song, 'songbooks' | 'categories'>[],
  base: readonly Pick<Song, 'songbooks' | 'categories'>[],
  selection: BrowseSelection,
  locale?: string,
  fallback?: BrowseFallbackLabels
): { songbooks: BrowseOption[]; languages: BrowseOption[] } {
  const songbooks = new Map<string, BrowseOption>();
  const languages = new Map<string, BrowseOption>();
  for (const song of all) {
    for (const b of song.songbooks ?? []) if (!songbooks.has(b.id)) songbooks.set(b.id, { value: b.id, label: b.name, count: 0 });
    for (const l of songLanguages(song)) if (!languages.has(l.slug)) languages.set(l.slug, { value: l.slug, label: l.name, count: 0 });
  }
  if (selection.songbook && !songbooks.has(selection.songbook)) {
    songbooks.set(selection.songbook, { value: selection.songbook, label: fallback?.unknownSongbook ?? selection.songbook, count: 0 });
  }
  if (selection.language && !languages.has(selection.language)) {
    languages.set(selection.language, { value: selection.language, label: fallback?.unknownLanguage ?? selection.language, count: 0 });
  }
  for (const song of base) {
    if (matchesLanguage(song, selection.language)) {
      for (const b of song.songbooks ?? []) {
        const option = songbooks.get(b.id);
        if (option) option.count++;
      }
    }
    if (matchesSongbook(song, selection.songbook)) {
      for (const l of songLanguages(song)) {
        const option = languages.get(l.slug);
        if (option) option.count++;
      }
    }
  }
  const sort = byLabel(locale);
  return { songbooks: [...songbooks.values()].sort(sort), languages: [...languages.values()].sort(sort) };
}

/** One row returned by `public.fn_search_filter_counts()`. */
export interface SearchFilterCountRow {
  kind: string;
  value: string;
  label: string;
  song_count: number;
}

/**
 * Splits `fn_search_filter_counts()` rows into sorted Songbook and Language `BrowseOption` lists
 * so `GlobalSearchModal` renders the same `SearchFiltersModal` selects as `/songs` (Story 6.2.25, #570).
 */
export function browseOptionsFromRows(
  rows: readonly SearchFilterCountRow[] | null | undefined,
  locale?: string
): { songbooks: BrowseOption[]; languages: BrowseOption[] } {
  const songbooks: BrowseOption[] = [];
  const languages: BrowseOption[] = [];
  for (const row of rows ?? []) {
    if (!row.value || !row.label) continue;
    const option: BrowseOption = {
      value: row.value,
      label: row.label,
      count: Number(row.song_count) || 0,
    };
    if (row.kind === 'songbook') songbooks.push(option);
    else if (row.kind === 'language') languages.push(option);
  }
  const sort = byLabel(locale);
  return {
    songbooks: songbooks.sort(sort),
    languages: languages.sort(sort),
  };
}

