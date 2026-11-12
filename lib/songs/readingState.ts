/**
 * What the song page reads (Epic 6.2, Stories 6.2.13 / 6.2.14, #516 / #517): the original, a translation alone, or
 * both together. Pure (no React, no I/O), so the page and the Gherkin steps run the same rules.
 *
 *  - "Both" needs a translation: `?view=both` without a valid `?lang=` reads the original, and the stale view is
 *    dropped from the address (`staleView`) so a later language tap does not open straight in Both.
 *  - A translation alone is shown as stored: not transposed, its own chords (if any) for the Chords switch, no
 *    source line. In Both the original is on screen with its chords, so Chords, transpose and the source line follow
 *    the original; the translator is named whenever a translation is shown.
 *  - Choosing the original language drops the view with the language (`languageChangeSearch`).
 */
import { hasChords } from '@/lib/chordProParsing';
import { canTranspose } from '@/lib/reader/transpose';
import { versionHasChords } from '@/lib/songs/versionFlags';
import {
  BOTH_VIEW,
  TRANSLATION_VIEW,
  languageSearch,
  resolveTranslation,
  viewSearch,
  type LanguageChoice,
  type ReadingView,
  type SongTranslation,
} from '@/lib/songs/translations';

export interface ReadingStateInput {
  songId: string | undefined;
  translations: ReadonlyArray<SongTranslation> | null | undefined;
  /** The language chosen (tap or `?lang=`), `null` = none. */
  languageChoice: LanguageChoice | null;
  /** The view asked for (tap or `?view=`). */
  view: ReadingView;
  /** The version being shown. */
  version: { content_chordpro?: string | null } | null | undefined;
  role: string | null | undefined;
  /** The reader's transpose shift. */
  semitones: number;
}

export interface ReadingState {
  translation: SongTranslation | null;
  /** The original and the translation together. */
  showBoth: boolean;
  /** The view in effect (Both only with a translation). */
  view: ReadingView;
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
  /** The Translation · Both switch. */
  viewSwitchVisible: boolean;
  /** Both was asked for without a translation to show: drop `?view=both`. */
  staleView: boolean;
}

export function readingState(input: ReadingStateInput): ReadingState {
  const translation = resolveTranslation(input.translations, input.languageChoice, input.songId);
  const showBoth = !!translation && input.view === BOTH_VIEW;
  const readsOriginal = !translation || showBoth;
  const shownHasChords = readsOriginal ? versionHasChords(input.version) : hasChords(translation?.lyrics ?? '');
  const mayTranspose = canTranspose(input.role) && shownHasChords && readsOriginal;
  return {
    translation,
    showBoth,
    view: showBoth ? BOTH_VIEW : TRANSLATION_VIEW,
    readsOriginal,
    shownHasChords,
    mayTranspose,
    shift: mayTranspose ? input.semitones : 0,
    showSource: readsOriginal,
    translator: translation?.translator?.trim() || null,
    viewSwitchVisible: !!translation,
    staleView: !translation && input.view === BOTH_VIEW,
  };
}

/**
 * The query part after choosing `language` (`null` = the original), and whether the view goes back to the translation
 * alone: another language keeps the view, the original has none, so `?view=` goes with `?lang=`.
 */
export function languageChangeSearch(currentSearch: string, language: string | null): { search: string; resetView: boolean } {
  const search = languageSearch(currentSearch, language);
  return language ? { search, resetView: false } : { search: viewSearch(search, TRANSLATION_VIEW), resetView: true };
}
