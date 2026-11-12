/**
 * Every author of a song (Story 6.2.12 / G2.3, #515).
 *
 * `compositions.authors` holds every credit; `original_author` is the display text and the fallback when
 * `authors` is empty. Pure helpers: the song page, its share text and the meta line all use them.
 */
import { parseArtists } from '@/lib/songs/artistUtils';
import { normalizeWhitespace } from '@/lib/utils';
import { LOCALE_DATE_TAGS, type Locale, type TranslateFn } from '@/lib/i18n';

export interface AuthorSource {
  /** `compositions.authors`: every credit, may hold blanks and duplicates. */
  authors?: ReadonlyArray<string | null | undefined> | null;
  /** `compositions.original_author`: display text, used when `authors` has no name. */
  originalAuthor?: string | null;
}

/** Trims, collapses spaces, drops blank entries and removes duplicates (case-insensitive, first spelling kept). */
export function cleanAuthors(names: ReadonlyArray<string | null | undefined> | null | undefined): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of names ?? []) {
    const name = normalizeWhitespace(raw ?? '');
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }
  return result;
}

/** The names of the song's authors, without display placeholders: `authors`, else `original_author` split. */
export function songAuthorNames(song: AuthorSource): string[] {
  const names = cleanAuthors(song.authors);
  return names.length > 0 ? names : parseArtists(song.originalAuthor);
}

/** Display names for the meta line and the menu: every author, or Traditional when there is none. */
export function songAuthors(song: AuthorSource, t: TranslateFn): string[] {
  const names = songAuthorNames(song).map((a) => (a.toLowerCase() === 'traditional' ? t('song.traditional') : a));
  return names.length > 0 ? names : [t('song.traditional')];
}

/** `Intl.ListFormat` in the UI language (`LOCALE_DATE_TAGS`), conjunction style: "A and B", "A, B y C". */
function authorList(locale: Locale | string): Intl.ListFormat {
  return new Intl.ListFormat(LOCALE_DATE_TAGS[locale as Locale] ?? 'en-US', { style: 'long', type: 'conjunction' });
}

/**
 * The text between each pair of names in the UI language ("A and B" gives " and "; "A, B, C" gives ", " and
 * ", and "). One entry per gap, so the meta line can put the joiner between separate links.
 */
export function authorSeparators(names: readonly string[], locale: Locale | string): string[] {
  if (names.length < 2) return [];
  return authorList(locale)
    .formatToParts([...names])
    .filter((part) => part.type === 'literal')
    .map((part) => part.value);
}

/** The names as one phrase in the UI language: "A and B", "A, B y C". */
export function joinAuthors(names: readonly string[], locale: Locale | string): string {
  return authorList(locale).format([...names]);
}
