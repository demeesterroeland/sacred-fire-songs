// Story 6.2.13 (#516): pure rules of the language switch.
import { describe, expect, it } from 'vitest';
import { DICTIONARIES } from '@/lib/i18n';
import {
  languageOptions,
  languageSearch,
  linkedLanguageChoice,
  ORIGINAL_LANGUAGE,
  readableTranslations,
  resolveTranslation,
  translationLabel,
  translationTitle,
  linkedReadingView,
  readingViewOptions,
  viewSearch,
  BOTH_VIEW,
  TRANSLATION_VIEW,
} from '@/lib/songs/translations';
import { versionSearch, versionShareUrl } from '@/lib/songs/versionSwitch';

const t = (k: string) => (DICTIONARIES.en as Record<string, string>)[k] ?? k;
const tNl = (k: string) => (DICTIONARIES.nl as Record<string, string>)[k] ?? k;
const nl = { language: 'nl', title: 'Moeder Aarde', lyrics: 'Zing' };
const en = { language: 'en', title: 'Mother Earth', lyrics: 'Sing' };

describe('languageOptions', () => {
  it('is null without readable translations', () => {
    expect(languageOptions(undefined, t, 'en')).toBeNull();
    expect(languageOptions([], t, 'en')).toBeNull();
    expect(languageOptions([{ language: 'nl', lyrics: '' }, { language: 'en', lyrics: null }], t, 'en')).toBeNull();
  });

  it('lists Original, then the languages by name in the app language', () => {
    expect(languageOptions([nl, en], t, 'en')).toEqual([
      { value: ORIGINAL_LANGUAGE, label: 'Original language' },
      { value: 'nl', label: 'Dutch' },
      { value: 'en', label: 'English' },
    ]);
    expect(languageOptions([en, nl], tNl, 'nl')!.map((o) => o.label)).toEqual(['Oorspronkelijke taal', 'Engels', 'Nederlands']);
  });

  it('labels a regional tag and an unknown tag', () => {
    expect(translationLabel('pt-br', 'en')).toMatch(/Portuguese/);
    expect(translationLabel('zzz', 'en')).toBe('ZZZ');
  });

  it('every app language has a word for the original language', () => {
    for (const locale of Object.keys(DICTIONARIES) as (keyof typeof DICTIONARIES)[]) {
      expect((DICTIONARIES[locale] as Record<string, string>)['song.language.originalLanguage']).toBeTruthy();
    }
  });
});

describe('resolveTranslation', () => {
  it('is the original (null) without a choice, for another song or for an unknown language', () => {
    expect(resolveTranslation([en], null, 's1')).toBeNull();
    expect(resolveTranslation([en], { songId: 's2', language: 'en' }, 's1')).toBeNull();
    expect(resolveTranslation([en], { songId: 's1', language: 'xx' }, 's1')).toBeNull();
    expect(resolveTranslation([en], { songId: 's1', language: ORIGINAL_LANGUAGE }, 's1')).toBeNull();
  });

  it('finds the chosen translation, but not one without lyrics', () => {
    expect(resolveTranslation([nl, en], { songId: 's1', language: 'en' }, 's1')).toBe(en);
    expect(resolveTranslation([{ language: 'en', lyrics: ' ' }], { songId: 's1', language: 'en' }, 's1')).toBeNull();
  });
});

describe('linkedLanguageChoice', () => {
  it('lowercases the tag and ignores blank or overlong values', () => {
    expect(linkedLanguageChoice('s1', 'EN')).toEqual({ songId: 's1', language: 'en' });
    expect(linkedLanguageChoice('s1', ' pt-BR ')).toEqual({ songId: 's1', language: 'pt-br' });
    expect(linkedLanguageChoice('s1', '')).toBeNull();
    expect(linkedLanguageChoice('s1', null)).toBeNull();
    expect(linkedLanguageChoice('s1', 'a'.repeat(36))).toBeNull();
  });
});

describe('translationTitle', () => {
  it('is shown only when it differs from the song title (case and accents ignored)', () => {
    expect(translationTitle('Mother Earth', en)).toBeNull();
    expect(translationTitle('mother éarth', en)).toBeNull();
    expect(translationTitle('Mother Earth', nl)).toBe('Moeder Aarde');
    expect(translationTitle('Mother Earth', { language: 'fr', title: '  ' })).toBeNull();
    expect(translationTitle('Mother Earth', null)).toBeNull();
  });
});

describe('addresses', () => {
  it('a language is added next to the version and removed again', () => {
    expect(languageSearch('?version=v2', 'en')).toBe('?version=v2&lang=en');
    expect(languageSearch('?version=v2&lang=en', 'nl')).toBe('?version=v2&lang=nl');
    expect(languageSearch('?version=v2&lang=en', null)).toBe('?version=v2');
    expect(languageSearch('?lang=en', null)).toBe('');
  });

  it('choosing a version drops the language (and the recording), the share link can keep it', () => {
    expect(versionSearch('?lang=en&recording=r1', 'v2', false)).toBe('?version=v2');
    expect(versionSearch('?lang=en', 'v1', true)).toBe('');
    expect(versionSearch('?version=v2', 'v2', false, 'en')).toBe('?version=v2&lang=en');
    expect(versionShareUrl('https://x.test/songs/1?lang=en', 'v1', true)).toBe('https://x.test/songs/1');
    expect(versionShareUrl('https://x.test/songs/1', 'v1', true, 'en')).toBe('https://x.test/songs/1?lang=en');
  });
});

describe('readableTranslations', () => {
  it('drops rows without a tag or lyrics', () => {
    expect(readableTranslations([nl, { language: '', lyrics: 'x' }, { language: 'de', lyrics: null }])).toEqual([nl]);
    expect(readableTranslations(null)).toEqual([]);
  });
});

// Story 6.2.14 (#517): the reading view of a translation (translation only, or both languages).
describe('reading view', () => {
  it('reads ?view=both, case-insensitively; anything else is the translation alone', () => {
    expect(linkedReadingView('both')).toBe(BOTH_VIEW);
    expect(linkedReadingView(' BOTH ')).toBe(BOTH_VIEW);
    expect(linkedReadingView(null)).toBe(TRANSLATION_VIEW);
    expect(linkedReadingView('side')).toBe(TRANSLATION_VIEW);
  });

  it('offers Translation and Both, in the app language', () => {
    expect(readingViewOptions(t)).toEqual([
      { value: TRANSLATION_VIEW, label: 'Translation' },
      { value: BOTH_VIEW, label: 'Both' },
    ]);
    expect(readingViewOptions(tNl).map((o) => o.label)).toEqual(['Vertaling', 'Beide']);
  });

  it('sets ?view=both and keeps the other parameters; the translation alone has no parameter', () => {
    expect(viewSearch('?version=v2&lang=nl', BOTH_VIEW)).toBe('?version=v2&lang=nl&view=both');
    expect(viewSearch('?lang=nl&view=both', TRANSLATION_VIEW)).toBe('?lang=nl');
    expect(viewSearch('?view=both', TRANSLATION_VIEW)).toBe('');
  });

  it('a version switch drops the view with the language; the share link carries it only with a language', () => {
    expect(versionSearch('?lang=nl&view=both', 'v2', false)).toBe('?version=v2');
    expect(versionShareUrl('https://x.test/songs/s?x=1', 'v1', true, 'nl', BOTH_VIEW)).toBe('https://x.test/songs/s?x=1&lang=nl&view=both');
    expect(versionShareUrl('https://x.test/songs/s', 'v1', true, null, BOTH_VIEW)).toBe('https://x.test/songs/s');
    expect(versionShareUrl('https://x.test/songs/s', 'v1', true, 'nl', TRANSLATION_VIEW)).toBe('https://x.test/songs/s?lang=nl');
  });
});
