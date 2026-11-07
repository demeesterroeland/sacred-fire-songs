// Validation 2, item 8: one noun, "recording", and one verb, "Record", in every language. No user-visible
// "take" (or the old per-language word for it) is left. Code identifiers and database names keep "take".
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { DICTIONARIES, SUPPORTED_LOCALES } from '@/lib/i18n';

const dict = (locale: string) => DICTIONARIES[locale as keyof typeof DICTIONARIES] as Record<string, string>;

/** The word each language used for "take" (a whole word, any case). */
const TAKE_WORD: Record<string, RegExp> = {
  en: /\btakes?\b/i,
  nl: /\b(takes?|gidstake|oefentakes?|takenaam)\b/i,
  es: /\btomas?\b/i,
  it: /\btakes?\b/i,
  ru: /дубл(ь|я|ю|ем|е|и|ей|ям|ями|ях)\b/i,
  qu: /\btoma(kuna|ykikuna|ta|pa|qa|ykita)?\b/i,
  fr: /\bprises?\b(?! en charge)/i,
  pt: /\btakes?\b/i,
};
// "Request Data Take Out" is the English phrase for a data export, not a recording.
const ALLOWED = new Set(['settings.privacy.dataExport']);

describe.each([...SUPPORTED_LOCALES])('Recording naming (%s)', (locale) => {
  it('has no user-visible "take" in any string', () => {
    const hits = Object.entries(dict(locale)).filter(([k, v]) => !ALLOWED.has(k) && TAKE_WORD[locale].test(v));
    expect(hits).toEqual([]);
  });

  it('has no "Record Audio" second name: the recorder toggle is called Record like the Practice tab', () => {
    expect(Object.keys(dict(locale))).not.toContain('recorder.tab.recordAudio');
    expect(dict(locale)['recorder.tab.record']).toBeTruthy();
  });
});

describe('Recording naming (usage)', () => {
  it('the recorder toggle uses the same label as the Practice tab (Record)', () => {
    const recorder = readFileSync('components/song/AudioRecorder.tsx', 'utf8');
    expect(recorder).toContain("t('recorder.tab.record')");
    expect(recorder).not.toContain("recorder.tab.recordAudio");
    expect(dict('en')['recorder.tab.record']).toBe(dict('en')['practice.tab.record']);
  });
});
