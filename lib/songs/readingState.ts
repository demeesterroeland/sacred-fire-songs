/**
 * What the song page reads (Epic 6.2, Stories 6.2.13 / 6.2.14, #516 / #517): Original · Translation · Both. Pure (no
 * React, no I/O), so the page and the Gherkin steps run the same rules.
 *
 *  - The view switch shows for a song with at least one translation with lyrics; without one the page reads the
 *    original and shows no switch (and takes no space), whatever the address says.
 *  - "Translation" and "Both" use the language chosen in the language switch; without a (valid) choice the first
 *    language of that switch (by name in the app language). The language switch lists languages only (one
 *    "Original" on screen) and shows next to Translation / Both with two or more languages.
 *  - Address: the original has no parameters; Translation and Both write `?lang=<tag>&view=translation|both`, the
 *    language always explicit, so a shared link does not depend on the reader's app language. A link with `?lang=`
 *    and no view (from before #517) opens that translation; an unknown `?view=` counts as none. Values that do not
 *    match what is read are replaced in the address (`staleReadingSearch`).
 *  - A translation alone is shown as stored: not transposed, its own chords (if any) for the Chords switch, no
 *    source line. In Both the original is on screen with its chords, so Chords, transpose and the source line follow
 *    the original; the translator is named whenever a translation is shown.
 */
import { hasChords } from '@/lib/chordProParsing';
import type { Locale } from '@/lib/i18n';
import { canTranspose } from '@/lib/reader/transpose';
import { versionHasChords } from '@/lib/songs/versionFlags';
import {
  BOTH_VIEW,
  LANGUAGE_PARAM,
  ORIGINAL_VIEW,
  TRANSLATION_VIEW,
  VIEW_PARAM,
  resolveTranslation,
  sortedTranslations,
  type LanguageChoice,
  type ReadingView,
  type SongTranslation,
} from '@/lib/songs/translations';

export interface ReadingStateInput {
  songId: string | undefined;
  translations: ReadonlyArray<SongTranslation> | null | undefined;
  /** The language chosen (tap or `?lang=`), `null` = none. */
  languageChoice: LanguageChoice | null;
  /** The view asked for (tap or `?view=`), `null` = none asked. */
  view: ReadingView | null;
  /** The version being shown. */
  version: { content_chordpro?: string | null } | null | undefined;
  role: string | null | undefined;
  /** The reader's transpose shift. */
  semitones: number;
  /** The app language: orders the languages, so it picks the default one. */
  locale: Locale;
}

export interface ReadingState {
  /** The view in effect. */
  view: ReadingView;
  /** The translation on screen (Translation or Both), else `null`. */
  translation: SongTranslation | null;
  /** Its tag, or `null` on the original. */
  language: string | null;
  /** The language "Translation" and "Both" open from here (read, chosen or linked, else the first), or `null`. */
  translationLanguage: string | null;
  /** The original and the translation together. */
  showBoth: boolean;
  /** The original text is on screen (alone or in Both). */
  readsOriginal: boolean;
  /** The text on screen has chords: the Chords switch applies. */
  shownHasChords: boolean;
  mayTranspose: boolean;
  /** Semitones applied to the original (0 when it may not be transposed). */
  shift: number;
  /** The source line of the version (book · page · compiler). */
  showSource: boolean;
  /** "Translated by …", or `null`. */
  translator: string | null;
  /** The Original · Translation · Both switch: the song has a translation with lyrics. */
  viewSwitchVisible: boolean;
  /** The language switch: Translation or Both, with two or more languages. */
  languageSwitchVisible: boolean;
}

function effectiveView(input: ReadingStateInput, hasTranslation: boolean, chosen: SongTranslation | null): ReadingView {
  if (!hasTranslation) return ORIGINAL_VIEW;
  if (input.view) return input.view;
  // No view asked: a `?lang=` link from before #517 opens that translation alone.
  return chosen ? TRANSLATION_VIEW : ORIGINAL_VIEW;
}

export function readingState(input: ReadingStateInput): ReadingState {
  const languages = sortedTranslations(input.translations, input.locale);
  const chosen = resolveTranslation(input.translations, input.languageChoice, input.songId);
  const view = effectiveView(input, languages.length > 0, chosen);
  const translationToRead = chosen ?? languages[0] ?? null;
  const translation = view === ORIGINAL_VIEW ? null : translationToRead;
  const showBoth = view === BOTH_VIEW;
  const readsOriginal = !translation || showBoth;
  const shownHasChords = readsOriginal ? versionHasChords(input.version) : hasChords(translation?.lyrics ?? '');
  const mayTranspose = canTranspose(input.role) && shownHasChords && readsOriginal;
  return {
    view,
    translation,
    language: translation?.language ?? null,
    translationLanguage: translationToRead?.language ?? null,
    showBoth,
    readsOriginal,
    shownHasChords,
    mayTranspose,
    shift: mayTranspose ? input.semitones : 0,
    showSource: readsOriginal,
    translator: translation?.translator?.trim() || null,
    viewSwitchVisible: languages.length > 0,
    languageSwitchVisible: !!translation && languages.length >= 2,
  };
}

/**
 * The query part for `view` in `language`: `?lang=` and `?view=` replaced, every other parameter kept. The original
 * (or no language to read) has neither.
 */
export function readingSearch(currentSearch: string, view: ReadingView, language: string | null): string {
  const params = new URLSearchParams(currentSearch);
  params.delete(LANGUAGE_PARAM);
  params.delete(VIEW_PARAM);
  if (view !== ORIGINAL_VIEW && language) {
    params.append(LANGUAGE_PARAM, language);
    params.append(VIEW_PARAM, view);
  }
  const search = params.toString();
  return search ? `?${search}` : '';
}

/** The query part after a tap on the view switch; the language being read (or last read) stays. */
export function viewChangeSearch(currentSearch: string, view: ReadingView, language: string | null): string {
  return readingSearch(currentSearch, view, language);
}

/**
 * The query part after a tap on the language switch, and the view it leaves: another language keeps Translation or
 * Both; from the original (the switch is not shown there, but a caller may) it opens the translation alone.
 */
export function languageChangeSearch(
  currentSearch: string,
  language: string,
  view: ReadingView
): { search: string; view: ReadingView } {
  const next = view === ORIGINAL_VIEW ? TRANSLATION_VIEW : view;
  return { search: readingSearch(currentSearch, next, language), view: next };
}

/**
 * The address to put in place when its `?lang=` / `?view=` do not match what is read (an unknown view or language, a
 * view on a song without translation, `?view=original`, an old `?lang=` link), else `null`.
 */
export function staleReadingSearch(currentSearch: string, state: Pick<ReadingState, 'view' | 'language'>): string | null {
  const clean = readingSearch(currentSearch, state.view, state.language);
  const now = new URLSearchParams(currentSearch);
  const next = new URLSearchParams(clean);
  const same = (key: string) => now.getAll(key).join('\u0000') === next.getAll(key).join('\u0000');
  return same(LANGUAGE_PARAM) && same(VIEW_PARAM) ? null : clean;
}
