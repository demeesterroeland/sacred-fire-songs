/**
 * Every author of a song (Story 6.2.12 / G2.3, #515).
 *
 * `compositions.authors` holds every credit; `original_author` is the display text and the fallback when
 * `authors` is empty. Pure helpers: the song page, its share text and the meta line all use them.
 */
import { formatArtists, parseArtists } from '@/lib/songs/artistUtils';
import { normalizeWhitespace, removeDiacritics } from '@/lib/utils';
import { LOCALE_DATE_TAGS, type Locale, type TranslateFn } from '@/lib/i18n';

export interface AuthorSource {
  /** `compositions.authors`: every credit, may hold blanks and duplicates. */
  authors?: ReadonlyArray<string | null | undefined> | null;
  /** `compositions.original_author`: display text, used when `authors` has no name. */
  originalAuthor?: string | null;
}

/** Trims, collapses spaces, drops blank entries and removes duplicates (case and accent insensitive, first spelling kept). */
export function cleanAuthors(names: ReadonlyArray<string | null | undefined> | null | undefined): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of names ?? []) {
    const name = normalizeWhitespace(raw ?? '');
    if (!name) continue;
    const key = removeDiacritics(name).toLowerCase();
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

/** One author as the meta line shows it: `label` is the (translated) text, `name` the real name the filter knows. */
export interface AuthorLabel {
  name: string;
  label: string;
}

/**
 * The song's real authors with their display label ("traditional" is translated); empty when the song has no
 * author. The label is what the reader sees, `name` is what `?artist=` must carry so the author filter finds the song.
 */
export function songAuthorLabels(song: AuthorSource, t: TranslateFn): AuthorLabel[] {
  return songAuthorNames(song).map((name) => ({
    name,
    label: name.toLowerCase() === 'traditional' ? t('song.traditional') : name,
  }));
}

/** Display names for the menu, the share text and the rehearsal drawer: every author, or the localized no-author label. */
export function songAuthors(song: AuthorSource, t: TranslateFn): string[] {
  const labels = songAuthorLabels(song, t).map((a) => a.label);
  return labels.length > 0 ? labels : [t('song.noArtist')];
}

/** The song list filtered to one author: the one URL format of every author link (name encoded as one value). */
export function authorFilterHref(name: string): string {
  return `/songs?artist=${encodeURIComponent(name)}`;
}

/**
 * `Intl.ListFormat` in the UI language (`LOCALE_DATE_TAGS`), conjunction style: "A and B", "A, B y C".
 * Some ICU builds have no conjunction data for a language (Quechua, `qu`, in Node's default ICU): `Intl.ListFormat`
 * then falls back to a plain comma list ("A, B") and never throws, so every language still gets a joiner.
 */
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

/**
 * The text of the author input on the Add/Edit form: every credit of `authors` joined the way `parseArtists`
 * splits it again ("A, B, C"), else `original_author`. So a catalog song with three authors shows all three.
 */
export function authorInputText(song: AuthorSource): string {
  return formatArtists(songAuthorNames(song));
}

/**
 * The author columns the form saves: `original_author` is the text as typed (display text), `authors` the
 * individual names (`parseArtists`), so the song page, the author filter and the artist index agree after an edit.
 * A single credit like "A & B" is split by the input as well.
 */
export function authorFieldsForSave(input: string): { original_author: string; authors: string[] } {
  return { original_author: input, authors: parseArtists(input) };
}

/** Every author as one phrase in the UI language, or the localized no-author label. */
export function songAuthorsText(song: AuthorSource, t: TranslateFn, locale: Locale | string): string {
  return joinAuthors(songAuthors(song, t), locale);
}
