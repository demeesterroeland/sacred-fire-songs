/**
 * Labels for a song's versions (Epic 6.2, Story 6.2.6 / G1.1, #509).
 *
 * A catalog song can have an original, variants printed in other songbooks and translations.
 * The switch names each version after where it comes from: the short name of its (primary)
 * songbook for an original or a variant, the language name (in the app language) for a
 * translation, and the stored `version_name` when neither is known (songs made in the app).
 *
 * Pure (no React, no I/O) so the language switch of the planned translation layer (#516)
 * can reuse it.
 *
 * Language of a translation version: the schema has no language column on `song_versions`
 * (`song_translations.language` belongs to the other storage form), and the importer note
 * says a translation version's `version_name` "names the language". So the language is read
 * from that name (a language name in any app language or its tag), see `translationLanguageTag`.
 */
import { LOCALE_DATE_TAGS, SUPPORTED_LOCALES, type Locale } from '@/lib/i18n';
import type { SongVersionKind } from '@/types';

/** A songbook as embedded in a source row (PostgREST returns one object, or a one-element array). */
interface SongbookName {
  short_name?: string | null;
  title?: string | null;
}

export interface VersionSourceLike {
  is_primary?: boolean | null;
  songbooks?: SongbookName | ReadonlyArray<SongbookName> | null;
}

export interface LabelledVersion {
  id: string;
  version_name?: string | null;
  version_kind?: SongVersionKind | null;
  song_version_sources?: ReadonlyArray<VersionSourceLike> | null;
}

/** Original first, then the variants printed in other books, then the translations. */
const KIND_RANK: Record<SongVersionKind, number> = { original: 0, variant: 1, translation: 2 };

/** Position of a kind in the version order; a missing or unknown kind counts as `original`. */
export function versionKindRank(kind: string | null | undefined): number {
  return KIND_RANK[kind as SongVersionKind] ?? KIND_RANK.original;
}

const clean = (s: string | null | undefined) => s?.trim() || null;

function songbookOf(source: VersionSourceLike): SongbookName | null {
  const book = source.songbooks;
  return (Array.isArray(book) ? book[0] : book) ?? null;
}

/** The songbook name of the primary source (else the first source): short name, else title; null without one. */
export function primarySongbookName(sources: ReadonlyArray<VersionSourceLike> | null | undefined): string | null {
  if (!sources?.length) return null;
  const source = sources.find((s) => s.is_primary) ?? sources[0];
  const book = songbookOf(source);
  return clean(book?.short_name) ?? clean(book?.title);
}

// Languages a translation may be written in: the app languages plus other common ones.
const EXTRA_LANGUAGES = ['de', 'he', 'ar', 'pl', 'sv', 'da', 'no', 'fi', 'tr', 'ja', 'zh', 'ko', 'hi', 'sw', 'la'];
const CANDIDATE_TAGS: readonly string[] = [...SUPPORTED_LOCALES, ...EXTRA_LANGUAGES];

const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('en').trim();

function displayName(tag: string, inLocale: string): string | null {
  try {
    return new Intl.DisplayNames([inLocale], { type: 'language', fallback: 'none' }).of(tag) ?? null;
  } catch {
    return null;
  }
}

let nameIndex: Map<string, string> | null = null;

/** Folded language names (in every app language and in the language itself) and tags → tag. */
function languageIndex(): Map<string, string> {
  if (nameIndex) return nameIndex;
  const index = new Map<string, string>();
  for (const tag of CANDIDATE_TAGS) {
    index.set(fold(tag), tag);
    for (const locale of [...Object.values(LOCALE_DATE_TAGS), tag]) {
      const name = displayName(tag, locale);
      if (name && !index.has(fold(name))) index.set(fold(name), tag);
    }
  }
  return (nameIndex = index);
}

/** The language tag a translation's `version_name` names ("English", "Engels", "nl"), or null when it names none. */
export function translationLanguageTag(versionName: string | null | undefined): string | null {
  const name = clean(versionName);
  return name ? (languageIndex().get(fold(name)) ?? null) : null;
}

function capitalize(text: string, locale: string): string {
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}

/** The name of a language tag in the app language ("Engels" for `en` in Dutch), or null when it is unknown. */
export function languageName(tag: string, locale: Locale): string | null {
  const name = displayName(tag, LOCALE_DATE_TAGS[locale] ?? 'en-US');
  return name && capitalize(name, LOCALE_DATE_TAGS[locale] ?? 'en-US');
}

/**
 * The label of one version before numbering: songbook short name (original, variant), language
 * name in the app language (translation), else the stored `version_name`; null when all are blank.
 */
export function versionBaseLabel(version: LabelledVersion, locale: Locale): string | null {
  if (version.version_kind === 'translation') {
    const tag = translationLanguageTag(version.version_name);
    return (tag && languageName(tag, locale)) || clean(version.version_name);
  }
  return primarySongbookName(version.song_version_sources) ?? clean(version.version_name);
}
