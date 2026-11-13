/**
 * Language switch of the song page (Epic 6.2, Story 6.2.13 / G3.1, #516).
 *
 * A song may have translations in `song_translations` (one per language; lowercase tag, title, lyrics, translator).
 * The switch sits next to the version switch and lists the languages that exist; since #517 "Original" is in the view
 * switch (Original · Translation · Both) and this switch picks the language of the translation. Pure (no React, no
 * I/O) so the page, the switches and the Gherkin steps share one rule set.
 *
 * Decisions (documented in the design doc):
 *  - A translation belongs to the song, not to one version: it replaces the lyrics of the version being shown, and
 *    that version stays selected. Picking another version returns to the original language; picking a language keeps
 *    the version.
 *  - Deep link `?lang=<tag>` (with `?view=`, #517); without a view an unknown tag (or one without lyrics) opens the
 *    original language.
 */
import type { TranslateFn } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';
import { languageName } from '@/lib/songs/versionLabels';

/** Query parameter of the language deep link (`/songs/<id>?lang=nl`). */
export const LANGUAGE_PARAM = 'lang';

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
 * The readable translations in the order of the language switch: by name in the app language (then by tag). The first
 * one is what "Translation" and "Both" open when no language was chosen (#517).
 */
export function sortedTranslations(
  translations: ReadonlyArray<SongTranslation> | null | undefined,
  locale: Locale
): SongTranslation[] {
  return readableTranslations(translations)
    .map((tr) => ({ tr, label: translationLabel(tr.language, locale) }))
    .sort((a, b) => a.label.localeCompare(b.label, locale) || a.tr.language.localeCompare(b.tr.language))
    .map(({ tr }) => tr);
}

/**
 * Segments of the language switch: the languages by name in the app language. Since #517 it only picks the language
 * of "Translation" / "Both" ("Original" is in the view switch), so it is `null`, and left out with the space it would
 * take, for fewer than two languages: one language is not a choice.
 */
export function languageOptions(
  translations: ReadonlyArray<SongTranslation> | null | undefined,
  locale: Locale
): LanguageOption[] | null {
  const sorted = sortedTranslations(translations, locale);
  if (sorted.length < 2) return null;
  return sorted.map((tr) => ({ value: tr.language, label: translationLabel(tr.language, locale) }));
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

// ── Story 6.2.14 (#517): the reader switch Original · Translation · Both ──────────────────────────────────────────
//
// A song with at least one translation gets the view switch Original · Translation · Both. "Translation" and "Both" use
// the language picked in the language switch (default: its first language); that switch only lists languages and shows
// only next to Translation / Both with two or more of them, so there is one "Original" on screen. Every state is at
// most two taps away (a view, then a language).
//
// The choice lives in the address (`?lang=nl&view=both`), like `?version=`: it belongs to the song being read, survives
// a reload, travels with the share link, and a song read alone today does not open in two languages tomorrow (which a
// per-device preference would do). The original has no parameters (a clean link). The rules are in `readingState.ts`.

/** Query parameter of the reading view (`/songs/<id>?lang=nl&view=both`). */
export const VIEW_PARAM = 'view';

/** The original alone (the default; no parameter). */
export const ORIGINAL_VIEW = 'original';

/** The translation alone. */
export const TRANSLATION_VIEW = 'translation';

/** The original and the translation together. */
export const BOTH_VIEW = 'both';

export type ReadingView = typeof ORIGINAL_VIEW | typeof TRANSLATION_VIEW | typeof BOTH_VIEW;

const READING_VIEWS: readonly ReadingView[] = [ORIGINAL_VIEW, TRANSLATION_VIEW, BOTH_VIEW];

/** The view from `?view=` (any case), or `null` when there is none or it is not one of the three. */
export function linkedReadingView(param: string | null | undefined): ReadingView | null {
  const view = param?.trim().toLowerCase();
  return READING_VIEWS.find((v) => v === view) ?? null;
}

/** Segments of the Original · Translation · Both switch, in the app language. */
export function readingViewOptions(t: TranslateFn): LanguageOption[] {
  return READING_VIEWS.map((value) => ({ value, label: t(`song.translation.view.${value}`) }));
}
