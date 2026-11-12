// Story 6.2.14 (#517): what the song page reads (original, translation or both), as one pure rule set (L2).
import { describe, expect, it } from 'vitest';
import { languageChangeSearch, readingState, type ReadingStateInput } from '@/lib/songs/readingState';
import { BOTH_VIEW, TRANSLATION_VIEW } from '@/lib/songs/translations';

const SONG = 'song-1';
const CHORDS = '[G]Pachamama [C]sumaq';
const base: ReadingStateInput = {
  songId: SONG,
  translations: [{ language: 'en', lyrics: 'Mother earth', translator: '  Ana  ' }],
  languageChoice: { songId: SONG, language: 'en' },
  view: TRANSLATION_VIEW,
  version: { content_chordpro: CHORDS },
  role: 'musician',
  semitones: 2,
};
const state = (patch: Partial<ReadingStateInput> = {}) => readingState({ ...base, ...patch });

describe('readingState', () => {
  it('reads the original when no language is chosen: chords and transpose of the version, its source line', () => {
    const s = state({ languageChoice: null });
    expect(s).toMatchObject({ translation: null, showBoth: false, readsOriginal: true, shownHasChords: true, mayTranspose: true, shift: 2, showSource: true, viewSwitchVisible: false });
  });

  it('reads the translation alone: no transpose, chords of the translation text, no source line, the translator', () => {
    const s = state();
    expect(s.translation?.language).toBe('en');
    expect(s).toMatchObject({ showBoth: false, readsOriginal: false, shownHasChords: false, mayTranspose: false, shift: 0, showSource: false, translator: 'Ana', viewSwitchVisible: true, view: TRANSLATION_VIEW });
  });

  it('shows Both only with a translation; then Chords and transpose follow the original, and source + translator are shown', () => {
    const s = state({ view: BOTH_VIEW });
    expect(s).toMatchObject({ showBoth: true, view: BOTH_VIEW, readsOriginal: true, shownHasChords: true, mayTranspose: true, shift: 2, showSource: true, translator: 'Ana', staleView: false });
  });

  it('a guest or plain member sees the chords in Both but does not transpose', () => {
    expect(state({ view: BOTH_VIEW, role: 'member' })).toMatchObject({ shownHasChords: true, mayTranspose: false, shift: 0 });
    expect(state({ view: BOTH_VIEW, role: null })).toMatchObject({ mayTranspose: false, shift: 0 });
  });

  it('?view=both without a valid language reads the original and marks the view as stale (dropped from the address)', () => {
    for (const languageChoice of [null, { songId: SONG, language: 'xx' }, { songId: 'other', language: 'en' }]) {
      const s = state({ languageChoice, view: BOTH_VIEW });
      expect(s).toMatchObject({ translation: null, showBoth: false, view: TRANSLATION_VIEW, readsOriginal: true, staleView: true, viewSwitchVisible: false });
    }
  });

  it('a translation without a translator names none; the translation view is never stale', () => {
    const s = state({ translations: [{ language: 'en', lyrics: 'Mother earth', translator: ' ' }] });
    expect(s.translator).toBeNull();
    expect(s.staleView).toBe(false);
  });

  it('a translation with chords lets the Chords switch act on it when read alone', () => {
    expect(state({ translations: [{ language: 'en', lyrics: '[G]Mother earth' }] }).shownHasChords).toBe(true);
  });
});

describe('languageChangeSearch', () => {
  it('another language keeps the view', () => {
    expect(languageChangeSearch('?lang=en&view=both', 'nl')).toEqual({ search: '?view=both&lang=nl', resetView: false });
  });

  it('choosing the original drops the language and the view', () => {
    expect(languageChangeSearch('?version=v2&lang=en&view=both', null)).toEqual({ search: '?version=v2', resetView: true });
  });
});
