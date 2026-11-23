// #603: the share dialog must not promise that shared recordings cannot be downloaded.
// Recipients get a signed URL to the whole file, so they can still save it (hardening: #372).
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DICTIONARIES, SUPPORTED_LOCALES } from '@/lib/i18n';

// The old promise, per locale (removed in #603).
const OLD_PROMISE: Record<string, RegExp> = {
  en: /cannot be downloaded/i,
  nl: /kunnen niet worden gedownload/i,
  es: /no se pueden descargar/i,
  it: /non possono essere scaricate/i,
  ru: /нельзя скачивать/i,
  qu: /mana uraykuchiyta atikunchu/i,
  fr: /ne peuvent pas être téléchargés/i,
  pt: /não podem ser baixadas/i,
};

const read = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), 'utf8');

describe('share dialog copy (#603)', () => {
  it.each([...SUPPORTED_LOCALES])('%s: no "cannot be downloaded" promise, a respect notice instead', (locale) => {
    const dict = DICTIONARIES[locale] as Record<string, string>;
    expect(dict['recording.sharing.cannotDownload'], 'old key is gone').toBeUndefined();
    const notice = dict['recording.sharing.respectNotice'];
    expect(notice, 'respect notice').toBeTruthy();
    expect(dict['recording.sharing.downloadOwnerOnly'], 'owner-only download message').toBeTruthy();
    for (const value of Object.values(dict)) expect(value).not.toMatch(OLD_PROMISE[locale]);
  });

  it('every locale translates the notice (best effort for qu)', () => {
    const en = DICTIONARIES.en as Record<string, string>;
    for (const locale of SUPPORTED_LOCALES.filter((l) => l !== 'en')) {
      const dict = DICTIONARIES[locale] as Record<string, string>;
      expect(dict['recording.sharing.respectNotice'], locale).not.toBe(en['recording.sharing.respectNotice']);
      expect(dict['recording.sharing.downloadOwnerOnly'], locale).not.toBe(en['recording.sharing.downloadOwnerOnly']);
    }
  });

  it('the English notice asks to treat the recording with respect', () => {
    expect((DICTIONARIES.en as Record<string, string>)['recording.sharing.respectNotice']).toMatch(/respect/i);
  });

  it('the share dialog and the take list no longer use the old key', () => {
    expect(read('components/song/RecordingShareModal.tsx')).not.toContain('recording.sharing.cannotDownload');
    expect(read('components/song/RecordingShareModal.tsx')).toContain('recording.sharing.respectNotice');
    expect(read('components/song/RehearsalDrawer.tsx')).not.toContain('recording.sharing.cannotDownload');
  });
});
