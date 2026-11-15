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
import { primarySource, type SourceOrderRow } from '@/lib/songs/versionSources';

/** A source row as the label needs it: the `VERSION_SOURCES_SELECT` row, or just `is_primary` and the book. */
export type VersionSourceLike = SourceOrderRow;

export interface LabelledVersion {
  id: string;
  version_name?: string | null;
  version_kind?: SongVersionKind | null;
  song_version_sources?: ReadonlyArray<VersionSourceLike> | null;
}

const clean = (s: string | null | undefined) => s?.trim() || null;

/**
 * The songbook name of the primary source (`primarySource`: the `is_primary` row, else the first after sorting, the
 * same source the source line under the lyrics names): short name, else title; null without one.
 */
export function primarySongbookName(sources: ReadonlyArray<VersionSourceLike> | null | undefined): string | null {
  const source = primarySource(sources);
  if (!source) return null;
  const book = Array.isArray(source.songbooks) ? source.songbooks[0] : source.songbooks;
  return clean(book?.short_name) ?? clean(book?.title);
}

// Languages a translation may be written in: the app languages plus other common ones.
const EXTRA_LANGUAGES = ['de', 'he', 'ar', 'pl', 'sv', 'da', 'no', 'fi', 'tr', 'ja', 'zh', 'ko', 'hi', 'sw', 'la'];
const CANDIDATE_TAGS: readonly string[] = [...SUPPORTED_LOCALES, ...EXTRA_LANGUAGES];

const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('en').trim();

/**
 * `inLocale` when this runtime has display-name data for it, else English. The same locale can be missing from the
 * server's ICU data but present in a browser's (or the other way round, `qu` is the likely case), which would give
 * the server and the browser two different labels for one version; a fixed English fallback keeps the label the same
 * wherever the runtime lacks the locale, and the label is only ever rendered after the song has loaded in the browser.
 */
function namesLocale(inLocale: string): string {
  try {
    return Intl.DisplayNames.supportedLocalesOf([inLocale]).length > 0 ? inLocale : 'en';
  } catch {
    return 'en';
  }
}

function displayName(tag: string, inLocale: string): string | null {
  try {
    return new Intl.DisplayNames([namesLocale(inLocale)], { type: 'language', fallback: 'none' }).of(tag) ?? null;
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

/**
 * Every language name the app recognises, as written (not folded): each candidate tag and its name in every app
 * language and in the language itself. Input of `scripts/db/generate-translation-language-names.ts`, which writes the
 * name list of the translation data migration; `translationLanguageTag` is the authority on the tag of each name.
 */
export function languageNameEntries(): Array<{ name: string; tag: string }> {
  const entries: Array<{ name: string; tag: string }> = [];
  for (const tag of CANDIDATE_TAGS) {
    entries.push({ name: tag, tag });
    for (const locale of [...Object.values(LOCALE_DATE_TAGS), tag]) {
      const name = displayName(tag, locale);
      if (name) entries.push({ name, tag });
    }
  }
  return entries;
}

/**
 * A language tag as importers write it (`nl`, `lkt`, `pt-BR`); `version_name` text such as "Singable" is not one.
 * The language subtag must be lowercase as written: capitalised words such as "New" or "Alt" are valid tags too
 * (Newari, Southern Altai) but here they are words, not languages.
 */
const LANGUAGE_TAG = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;

/** The canonical form of a BCP 47 language tag ("LKT" → "lkt", "pt-br" → "pt-BR"), or null when it is not one. */
function canonicalTag(value: string): string | null {
  if (!LANGUAGE_TAG.test(value)) return null;
  try {
    return Intl.getCanonicalLocales(value)[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * The language tag a translation's `version_name` names, or null when it names none: a language name in any app
 * language ("English", "Engels"), or any BCP 47 style tag ("nl", "lkt", "pt-BR"; written lowercase, see the
 * importing guide). A tag the runtime has no name for still counts, the label then falls back (`versionBaseLabel`).
 */
export function translationLanguageTag(versionName: string | null | undefined): string | null {
  const name = clean(versionName);
  if (!name) return null;
  return languageIndex().get(fold(name)) ?? canonicalTag(name);
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
 * The label of one version before numbering: songbook short name (original, variant); language name in the app
 * language (translation), else, for a translation whose language is not recognised, its songbook, else the stored
 * `version_name`; null when all are blank.
 */
export function versionBaseLabel(version: LabelledVersion, locale: Locale): string | null {
  const book = primarySongbookName(version.song_version_sources);
  if (version.version_kind === 'translation') {
    const tag = translationLanguageTag(version.version_name);
    return (tag && languageName(tag, locale)) || book || clean(version.version_name);
  }
  return book ?? clean(version.version_name);
}
