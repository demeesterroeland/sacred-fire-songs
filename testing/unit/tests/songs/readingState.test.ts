// Story 6.2.14 (#517): what the song page reads (Original · Translation · Both), as one pure rule set (L2).
import { describe, expect, it } from 'vitest';
import {
  languageChangeSearch,
  readingSearch,
  readingState,
  staleReadingSearch,
  viewChangeSearch,
  type ReadingStateInput,
} from '@/lib/songs/readingState';
import { BOTH_VIEW, ORIGINAL_VIEW, TRANSLATION_VIEW } from '@/lib/songs/translations';

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
  locale: 'en',
};
const state = (patch: Partial<ReadingStateInput> = {}) => readingState({ ...base, ...patch });
const two = [
  { language: 'nl', lyrics: 'Moeder aarde' },
  { language: 'en', lyrics: 'Mother earth' },
];

describe('readingState: the three views', () => {
  it('Original: the version with its chords, transpose and source line; the view switch shows, the language switch not', () => {
    const s = state({ view: ORIGINAL_VIEW });
    expect(s).toMatchObject({
      view: ORIGINAL_VIEW, translation: null, language: null, showBoth: false, readsOriginal: true, shownHasChords: true,
      mayTranspose: true, shift: 2, showSource: true, translator: null, viewSwitchVisible: true, languageSwitchVisible: false,
    });
  });

  it('Translation: the translation alone, not transposed, its own chords, no source line, the translator', () => {
    const s = state();
    expect(s.translation?.language).toBe('en');
    expect(s).toMatchObject({ view: TRANSLATION_VIEW, language: 'en', showBoth: false, readsOriginal: false, shownHasChords: false, mayTranspose: false, shift: 0, showSource: false, translator: 'Ana', viewSwitchVisible: true });
  });

  it('Both: Chords, transpose and source line follow the original; the translator is named', () => {
    const s = state({ view: BOTH_VIEW });
    expect(s).toMatchObject({ view: BOTH_VIEW, showBoth: true, readsOriginal: true, shownHasChords: true, mayTranspose: true, shift: 2, showSource: true, translator: 'Ana' });
  });

  it('a guest or plain member sees the chords in Both but does not transpose', () => {
    expect(state({ view: BOTH_VIEW, role: 'member' })).toMatchObject({ shownHasChords: true, mayTranspose: false, shift: 0 });
    expect(state({ view: BOTH_VIEW, role: null })).toMatchObject({ mayTranspose: false, shift: 0 });
  });

  it('a translation with chords lets the Chords switch act on it when read alone', () => {
    expect(state({ translations: [{ language: 'en', lyrics: '[G]Mother earth' }] }).shownHasChords).toBe(true);
  });

  it('a translation without a translator names none', () => {
    expect(state({ translations: [{ language: 'en', lyrics: 'Mother earth', translator: ' ' }] }).translator).toBeNull();
  });
});

describe('readingState: which translation', () => {
  it('Translation and Both use the language chosen in the language switch', () => {
    expect(state({ translations: two, languageChoice: { songId: SONG, language: 'nl' } }).language).toBe('nl');
    expect(state({ translations: two, languageChoice: { songId: SONG, language: 'nl' }, view: BOTH_VIEW }).language).toBe('nl');
  });

  it('without a (valid) choice they use the first language of the switch: by name in the app language', () => {
    for (const languageChoice of [null, { songId: SONG, language: 'xx' }, { songId: 'other', language: 'nl' }]) {
      expect(state({ translations: two, languageChoice, view: BOTH_VIEW }).language).toBe('nl'); // Dutch < English
    }
    expect(state({ translations: [{ language: 'de', lyrics: 'Mutter' }, ...two], languageChoice: null, locale: 'nl' }).language).toBe('de'); // Duits < Engels
  });

  it('translationLanguage: what Translation / Both open from the original (the chosen language, else the first)', () => {
    expect(state({ translations: two, view: ORIGINAL_VIEW, languageChoice: { songId: SONG, language: 'en' } })).toMatchObject({ language: null, translationLanguage: 'en' });
    expect(state({ translations: two, view: ORIGINAL_VIEW, languageChoice: null }).translationLanguage).toBe('nl');
    expect(state({ translations: [], view: ORIGINAL_VIEW }).translationLanguage).toBeNull();
  });

  it('the language switch shows only with two or more languages, and not on the original', () => {
    expect(state({ translations: two }).languageSwitchVisible).toBe(true);
    expect(state({ translations: two, view: BOTH_VIEW }).languageSwitchVisible).toBe(true);
    expect(state({ translations: two, view: ORIGINAL_VIEW }).languageSwitchVisible).toBe(false);
    expect(state().languageSwitchVisible).toBe(false); // one language: "Translation" already picks it
  });
});

describe('readingState: the address and fallbacks', () => {
  it('no view asked: a ?lang= link opens that translation (links from before #517), else the original', () => {
    expect(state({ view: null })).toMatchObject({ view: TRANSLATION_VIEW, language: 'en' });
    expect(state({ view: null, languageChoice: null })).toMatchObject({ view: ORIGINAL_VIEW, translation: null });
    expect(state({ view: null, languageChoice: { songId: SONG, language: 'xx' } })).toMatchObject({ view: ORIGINAL_VIEW });
  });

  it('a song without a readable translation reads the original and shows no switch at all', () => {
    for (const translations of [[], null, [{ language: 'en', lyrics: ' ' }]]) {
      for (const view of [ORIGINAL_VIEW, TRANSLATION_VIEW, BOTH_VIEW, null] as const) {
        expect(state({ translations, view })).toMatchObject({ view: ORIGINAL_VIEW, translation: null, readsOriginal: true, viewSwitchVisible: false, languageSwitchVisible: false });
      }
    }
  });
});

describe('addresses', () => {
  it('readingSearch: the original has no parameters; Translation and Both carry the language and the view', () => {
    expect(readingSearch('?version=v2&lang=en&view=both', ORIGINAL_VIEW, 'en')).toBe('?version=v2');
    expect(readingSearch('?version=v2', TRANSLATION_VIEW, 'en')).toBe('?version=v2&lang=en&view=translation');
    expect(readingSearch('?lang=nl&view=translation', BOTH_VIEW, 'nl')).toBe('?lang=nl&view=both');
    expect(readingSearch('?view=both', BOTH_VIEW, null)).toBe('');
  });

  it('viewChangeSearch keeps the language being read', () => {
    expect(viewChangeSearch('?lang=en&view=translation', BOTH_VIEW, 'en')).toBe('?lang=en&view=both');
    expect(viewChangeSearch('', TRANSLATION_VIEW, 'nl')).toBe('?lang=nl&view=translation');
    expect(viewChangeSearch('?version=v2&lang=en&view=both', ORIGINAL_VIEW, 'en')).toBe('?version=v2');
  });

  it('languageChangeSearch keeps the view (Translation or Both); from the original it opens the translation', () => {
    expect(languageChangeSearch('?lang=en&view=both', 'nl', BOTH_VIEW)).toEqual({ search: '?lang=nl&view=both', view: BOTH_VIEW });
    expect(languageChangeSearch('?version=v2', 'en', ORIGINAL_VIEW)).toEqual({ search: '?version=v2&lang=en&view=translation', view: TRANSLATION_VIEW });
  });

  it('staleReadingSearch: the clean address when ?lang= / ?view= do not match what is read, else null', () => {
    const s = (patch: Partial<ReadingStateInput>) => state(patch);
    // In order: canonical, stale view, unknown language, view without a translation, explicit original, old ?lang= link.
    expect(staleReadingSearch('?lang=en&view=both', s({ view: BOTH_VIEW }))).toBeNull();
    expect(staleReadingSearch('?lang=en&view=side', s({ view: null }))).toBe('?lang=en&view=translation');
    expect(staleReadingSearch('?lang=xx&view=both', s({ view: BOTH_VIEW, languageChoice: { songId: SONG, language: 'xx' } }))).toBe('?lang=en&view=both');
    expect(staleReadingSearch('?version=v2&view=both', s({ view: BOTH_VIEW, translations: [] }))).toBe('?version=v2');
    expect(staleReadingSearch('?view=original&lang=en', s({ view: ORIGINAL_VIEW }))).toBe('');
    expect(staleReadingSearch('?lang=EN', s({ view: null }))).toBe('?lang=en&view=translation');
    expect(staleReadingSearch('', s({ view: null, languageChoice: null }))).toBeNull();
  });
});
