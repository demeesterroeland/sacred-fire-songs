// Story 6.1.33 / G9.1 (#417): demo data holds no E2E / smoke-test playlists.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { isTestFixtureTitle } from '@/lib/seed/dataHygiene';

describe('isTestFixtureTitle', () => {
  it('flags E2E and smoke-test titles', () => {
    expect(isTestFixtureTitle('E2E Admin Playlist')).toBe(true);
    expect(isTestFixtureTitle('Smoke Test Playlist 1793')).toBe(true);
    expect(isTestFixtureTitle('smoke test')).toBe(true);
  });

  it('does not flag real titles or ids that contain the letters', () => {
    expect(isTestFixtureTitle('Ceremony Fire Circle')).toBe(false);
    expect(isTestFixtureTitle('530be2e2-f9ee-42e9')).toBe(false);
  });
});

describe('committed demo seed', () => {
  it('inserts no playlist whose title looks like a test fixture', () => {
    const sql = fs.readFileSync(path.resolve(__dirname, '../../../supabase/seeds/03_songs_random_generated.sql'), 'utf8');
    const block = /INSERT INTO public\.setlists[\s\S]*?;\n/i.exec(sql)?.[0] ?? '';
    expect(block.length).toBeGreaterThan(0);
    const titles = [...block.matchAll(/\(\s*'[0-9a-f-]{36}',\s*'[0-9a-f-]{36}',\s*'((?:[^']|'')*)'/g)].map((m) => m[1]);
    expect(titles.length).toBeGreaterThan(0);
    expect(titles.filter(isTestFixtureTitle)).toEqual([]);
  });
});
