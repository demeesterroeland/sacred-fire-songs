/**
 * Language switch of the song page (Epic 6.2, Story 6.2.13 / G3.1, #516).
 *
 * A song may have translations in `song_translations` (one per language; lowercase tag, title, lyrics, translator).
 * The switch sits next to the version switch and lists "Original" plus the languages that exist. Pure (no React, no
 * I/O) so the page, the switch and the Gherkin steps share one rule set.
 *
 * Decisions (documented in the design doc):
 *  - A translation belongs to the song, not to one version: it replaces the lyrics of the version being shown, and
 *    that version stays selected. Picking another version returns to the original language; picking a language keeps
 *    the version.
 *  - Deep link `?lang=<tag>`; an unknown tag (or one without lyrics) opens the original language.
 */
import type { TranslateFn } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';
import { languageName } from '@/lib/songs/versionLabels';

/** Query parameter of the language deep link (`/songs/<id>?lang=nl`). */
export const LANGUAGE_PARAM = 'lang';

/** Value of the "Original" segment. Never a language tag (a tag has at most 3 letters before a hyphen). */
export const ORIGINAL_LANGUAGE = 'original';

/** One `song_translations` row as the song page selects it. */
export interface SongTranslation {
  id?: string;
  language: string;
  title?: string | null;
  lyrics?: string | null;
  translator?: string | null;
}

export interface LanguageOption {
  value: string;
  label: string;
}

/** The language the reader chose: it belongs to one song, like the version choice. */
export interface LanguageChoice {
  songId: string | undefined;
  language: string;
}

/** Longest `?lang=` value we accept (the schema allows tags like `de-1996`; 35 is the BCP 47 maximum). */
const MAX_LANGUAGE_PARAM_LENGTH = 35;

const clean = (s: string | null | undefined) => s?.trim() || null;

/** Translations a reader can switch to: a tag and lyrics that are not blank. */
export function readableTranslations(translations: ReadonlyArray<SongTranslation> | null | undefined): SongTranslation[] {
  return (translations ?? []).filter((tr) => !!clean(tr.language) && !!clean(tr.lyrics));
}

/** The label of a language: its name in the app language, else the tag itself in capitals ("LKT"). */
export function translationLabel(language: string, locale: Locale): string {
  return languageName(language, locale) ?? language.toUpperCase();
}

/**
 * Segments of the language switch ("Original" first, then the languages by name in the app language), or `null` when
 * the song has no translation to read: the switch and the space it would take are then left out.
 */
export function languageOptions(
  translations: ReadonlyArray<SongTranslation> | null | undefined,
  t: TranslateFn,
  locale: Locale
): LanguageOption[] | null {
  const readable = readableTranslations(translations);
  if (readable.length === 0) return null;
  const named = readable
    .map((tr) => ({ value: tr.language, label: translationLabel(tr.language, locale) }))
    .sort((a, b) => a.label.localeCompare(b.label, locale) || a.value.localeCompare(b.value));
  return [{ value: ORIGINAL_LANGUAGE, label: t('song.language.originalLanguage') }, ...named];
}

/** The initial choice from `?lang=<tag>`; case does not matter. It goes through `resolveTranslation`. */
export function linkedLanguageChoice(songId: string | undefined, param: string | null | undefined): LanguageChoice | null {
  const language = param?.trim().toLowerCase();
  if (!language || language.length > MAX_LANGUAGE_PARAM_LENGTH) return null;
  return { songId, language };
}

/**
 * The translation to show, or `null` for the original language: no choice, a choice made on another song (client
 * navigation), or a language the song does not (or no longer) offer. Page and switch both use this, so they never
 * disagree.
 */
export function resolveTranslation(
  translations: ReadonlyArray<SongTranslation> | null | undefined,
  choice: LanguageChoice | null,
  songId: string | undefined
): SongTranslation | null {
  if (!choice || choice.songId !== songId) return null;
  return readableTranslations(translations).find((tr) => tr.language === choice.language) ?? null;
}

const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('en').trim();

/** The translated title when it differs from the song's own title (ignoring case and accents), else `null`. */
export function translationTitle(songTitle: string | null | undefined, translation: SongTranslation | null): string | null {
  const title = clean(translation?.title);
  if (!title) return null;
  return fold(title) === fold(songTitle ?? '') ? null : title;
}

/**
 * The query part (`?version=…&lang=…`, or '') after choosing `language` (`null` = original). Other parameters stay,
 * the version included: a language is read on the version being shown.
 */
export function languageSearch(currentSearch: string, language: string | null): string {
  const params = new URLSearchParams(currentSearch);
  params.delete(LANGUAGE_PARAM);
  if (language) params.append(LANGUAGE_PARAM, language);
  const search = params.toString();
  return search ? `?${search}` : '';
}

// ── Story 6.2.14 (#517): the reading view of a translation ────────────────────────────────────────────────────────
//
// With a translation chosen, a second switch (Translation · Both) shows the translation alone or next to the original
// (side by side from md up, line under line on a phone). The language switch keeps the "Original language" segment,
// so original · translation · both are all one tap away without a second "Original" button.
//
// The choice lives in the address (`?view=both`), like `?lang=`: it belongs to the song being read, survives a reload,
// travels with the share link, and a song read alone today does not open in two languages tomorrow (which a per-device
// preference would do). Picking another version returns to the original language, so the view goes with it.

/** Query parameter of the reading view (`/songs/<id>?lang=nl&view=both`). */
export const VIEW_PARAM = 'view';
/** The translation alone (the default; no parameter). */
export const TRANSLATION_VIEW = 'translation';
/** The original and the translation together. */
export const BOTH_VIEW = 'both';
export type ReadingView = typeof TRANSLATION_VIEW | typeof BOTH_VIEW;

/** The view from `?view=`: only `both` (any case) opens both languages. */
export function linkedReadingView(param: string | null | undefined): ReadingView {
  return param?.trim().toLowerCase() === BOTH_VIEW ? BOTH_VIEW : TRANSLATION_VIEW;
}

/** Segments of the Translation · Both switch, in the app language. */
export function readingViewOptions(t: TranslateFn): LanguageOption[] {
  return [
    { value: TRANSLATION_VIEW, label: t('song.translation.view.translation') },
    { value: BOTH_VIEW, label: t('song.translation.view.both') },
  ];
}

/** The query part after choosing a view: `view=both` added, or removed for the translation alone. Other parameters stay. */
export function viewSearch(currentSearch: string, view: ReadingView): string {
  const params = new URLSearchParams(currentSearch);
  params.delete(VIEW_PARAM);
  if (view === BOTH_VIEW) params.append(VIEW_PARAM, BOTH_VIEW);
  const search = params.toString();
  return search ? `?${search}` : '';
}
