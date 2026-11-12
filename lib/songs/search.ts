/**
 * The one song search (Story 6.2.18 / G5.1, #521).
 *
 * The song list is fetched whole (row-level security already decides what each visitor may read) and filtered in
 * memory, so this module IS the search: the free-text filter (`songFilterConfig.search`) and `filterSongs` both call
 * it. A query matches, in this order: the title, an alias (`compositions.aliases`), an original title from a songbook
 * (`song_version_sources.original_title`, any version), any author (`songAuthorNames`, #515), a category name, the lyrics
 * of the first version. Case and accents are ignored on both sides. The first field that matches is the reason the
 * song was found; `songMatchHint` turns it into the "matched by …" line when it was not the title.
 */
import type { Song } from '@/lib/songUtils';
import { normalizeWhitespace, removeDiacritics } from '@/lib/utils';
import { songAuthorNames } from '@/lib/songs/authors';
import type { TranslateFn, TranslationKey } from '@/lib/i18n';

/** What the matcher reads: the Song fields below; every list may be missing on rows that never selected it. */
export type SearchableSong = Pick<Song, 'title' | 'author'> &
  Partial<Pick<Song, 'authors' | 'aliases' | 'sourceTitles' | 'content' | 'categories'>>;

export type SearchMatchField = 'title' | 'alias' | 'sourceTitle' | 'author' | 'category' | 'content';

export interface SearchMatch {
  field: SearchMatchField;
  /** The text that matched, with its own spelling and accents (what the hint shows). */
  text: string;
}

/** Why a song was found when its title did not match. Content and category matches need no explanation. */
export interface MatchHint {
  kind: 'alias' | 'sourceTitle' | 'author';
  text: string;
}

/** Trim, collapse spaces, drop accents, lower-case: both the query and every searched text go through this. */
export function foldForSearch(text: string | null | undefined): string {
  return removeDiacritics(normalizeWhitespace(text ?? '')).toLowerCase();
}

const firstContaining = (texts: ReadonlyArray<string | null | undefined> | null | undefined, query: string): string | null => {
  for (const raw of texts ?? []) {
    const text = normalizeWhitespace(raw ?? '');
    if (text && foldForSearch(text).includes(query)) return text;
  }
  return null;
};

/** The first field that contains the query, or `null`. An empty query matches everything with `null` as the reason. */
export function songSearchMatch(song: SearchableSong, rawQuery: string): SearchMatch | null {
  const query = foldForSearch(rawQuery);
  if (!query) return null;

  if (foldForSearch(song.title).includes(query)) return { field: 'title', text: song.title };

  const alias = firstContaining(song.aliases, query);
  if (alias) return { field: 'alias', text: alias };

  const sourceTitle = firstContaining(song.sourceTitles, query);
  if (sourceTitle) return { field: 'sourceTitle', text: sourceTitle };

  // Every individual author first (the hint names that one), then the display text, so what the row shows is searchable too.
  const author = firstContaining(
    [...songAuthorNames({ authors: song.authors, originalAuthor: song.author }), song.author],
    query
  );
  if (author) return { field: 'author', text: author };

  for (const c of song.categories ?? []) {
    if (foldForSearch(c.name).includes(query) || foldForSearch(c.parent).includes(query)) {
      return { field: 'category', text: c.name };
    }
  }

  if (song.content && foldForSearch(song.content).includes(query)) return { field: 'content', text: '' };
  return null;
}

/** True when the query is empty or any searched field contains it. */
export function songMatchesSearch(song: SearchableSong, rawQuery: string): boolean {
  return !foldForSearch(rawQuery) || songSearchMatch(song, rawQuery) !== null;
}

/**
 * The reason to show under the title, or `null`: only an alias, a songbook title or an author the row does not
 * already show (the row's author text is `song.author`). A title, category or lyrics match needs no hint.
 */
export function songMatchHint(song: SearchableSong, rawQuery: string): MatchHint | null {
  const match = songSearchMatch(song, rawQuery);
  if (!match) return null;
  if (match.field === 'alias' || match.field === 'sourceTitle') return { kind: match.field, text: match.text };
  if (match.field === 'author' && !foldForSearch(song.author).includes(foldForSearch(rawQuery))) {
    return { kind: 'author', text: match.text };
  }
  return null;
}

const HINT_KEYS = {
  alias: 'songs.matchAlias',
  sourceTitle: 'songs.matchSourceTitle',
  author: 'songs.matchAuthor',
} as const satisfies Record<MatchHint['kind'], TranslationKey>;

/** The hint as the row shows it, in the UI language: "Matched by alias: Gran Venerable Madre Tierra". */
export function songMatchHintText(song: SearchableSong, rawQuery: string, t: TranslateFn): string | null {
  const hint = songMatchHint(song, rawQuery);
  return hint ? t(HINT_KEYS[hint.kind], { text: hint.text }) : null;
}
