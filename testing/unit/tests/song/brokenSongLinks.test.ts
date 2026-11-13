// #578 — non-UUID ids on [id] routes render not-found; song load error shows translated message.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { isUuid } from '@/lib/validation/uuid';
import { SUPPORTED_LOCALES, DICTIONARIES } from '@/lib/i18n';

const ROOT = path.resolve(__dirname, '../../../..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

describe('isUuid (#578)', () => {
  it('accepts standard 36-char UUIDs case-insensitively', () => {
    expect(isUuid('00000000-0000-4000-8000-000000000000')).toBe(true);
    expect(isUuid('5D384E41-335A-459D-8977-4BC383291C48')).toBe(true);
  });

  it('rejects malformed ids, empty strings, null and undefined', () => {
    for (const bad of ['xyz', '123', 'not-a-uuid', '', null, undefined, '00000000-0000-4000-8000-00000000000g']) {
      expect(isUuid(bad)).toBe(false);
    }
  });
});

describe('[id] routes guard non-UUID parameters with notFound() (#578)', () => {
  const routes = [
    'app/songs/[id]/page.tsx',
    'app/songs/[id]/edit/page.tsx',
    'app/users/[id]/page.tsx',
    'app/recordings/[id]/page.tsx',
    'app/library/playlists/[id]/page.tsx',
    'app/admin/users/[id]/page.tsx',
  ] as const;

  it.each(routes)('%s checks UUID validity and calls notFound()', (rel) => {
    const src = read(rel);
    expect(src).toMatch(/\bnotFound\b/);
    expect(src).toMatch(/\b(isUuid|parseRecordingParam)\b/);
  });
});

describe('SongDetailPage error state (#578)', () => {
  it('never renders raw songError.message and always shows t("song.error.unexpected")', () => {
    const src = read('app/songs/[id]/page.tsx');
    expect(src).not.toMatch(/songError[^;\n]*\.message/);
    expect(src).toContain("t('song.error.loadFailed')");
    expect(src).toContain("t('song.error.unexpected')");
    expect(src).toContain("t('song.error.retry')");
    expect(src).toMatch(/console\.(warn|error)\([^)]*songError/);
  });

  it('has translated song.error.loadFailed, song.error.unexpected and song.error.retry in all 8 locales', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const dict = DICTIONARIES[locale];
      expect(dict['song.error.loadFailed']).toBeTruthy();
      expect(dict['song.error.unexpected']).toBeTruthy();
      expect(dict['song.error.retry']).toBeTruthy();
    }
  });
});
