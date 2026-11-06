// Validation 1 (fix 7): the data migration recomputes has_chords / has_melody with the same rule as
// lib/songs/versionFlags.ts. Needs the local Supabase stack (skipped when it is not running); everything runs
// in one transaction that is rolled back, so the shared database is never changed.
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { hasChords } from '@/lib/chordProParsing';
import { songFlags } from '@/lib/songs/versionFlags';

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const SQL = fs.readFileSync(path.resolve(__dirname, '../../../../supabase/migrations/20261106180000_recompute_song_flags.sql'), 'utf8');

let client: pg.Client | null = null;
async function connect(): Promise<pg.Client | null> {
  const c = new pg.Client({ connectionString: DATABASE_URL, connectionTimeoutMillis: 1500 });
  try {
    await c.connect();
    return c;
  } catch {
    return null;
  }
}

beforeAll(async () => {
  client = await connect();
});
afterAll(async () => {
  await client?.end();
});

const SAMPLES = [
  '[Am]Hello [G]world',
  'Hello world',
  '',
  '[Chorus]\nla la la', // the parser counts "[C" as a chord, and so does the migration
  '{title: x}\nAm   G   F\nSome words here',
  'C  G/B  Am7\nlyrics follow',
  'G (intro)\nwords',
  '(intro)\nwords',
  '| C | G |\nwords',
  'Dsus4 Cadd9\nwords',
  'Just words about a Chord and an A song',
  'A\nB',
  'Gb  Ab\nx',
  '   \n\t\nwords',
  'Am\r\nLyrics',
];

describe.skipIf(process.env.CI === 'true')('recompute_song_flags migration', () => {
  it('the chord rule in SQL gives the same answer as hasChords() on a corpus', async (ctx) => {
    if (!client) return ctx.skip();
    await client.query('begin');
    try {
      await client.query(SQL.slice(0, SQL.indexOf('with calc as'))); // only the pg_temp helper
      for (const text of SAMPLES) {
        const { rows } = await client.query('select pg_temp.sfs_has_chords($1) as r', [text]);
        expect(rows[0].r, JSON.stringify(text)).toBe(hasChords(text));
      }
    } finally {
      await client.query('rollback');
    }
  });

  it('fixes a song whose flags disagree with its versions, leaves the others alone, and is idempotent', async (ctx) => {
    if (!client) return ctx.skip();
    await client.query('begin');
    try {
      const ins = async (title: string, chords: boolean, melody: boolean) =>
        (await client!.query<{ id: string }>(
          `insert into public.compositions (title, original_author, is_public, has_chords, has_melody)
           values ($1, 'migration test', false, $2, $3) returning id`,
          [title, chords, melody],
        )).rows[0].id;
      const ver = (id: string, content: string, extra: Record<string, string | null> = {}) =>
        client!.query(
          `insert into public.song_versions (composition_id, version_name, content_chordpro, youtube_url, melody_notation)
           values ($1, 'v', $2, $3, $4)`,
          [id, content, extra.youtube ?? null, extra.notation ?? null],
        );

      // Original has chords, Simplified is lyrics-only, flags wrongly say "no".
      const wrong = await ins('flags wrong', false, false);
      await ver(wrong, '[Am]Hello [G]world');
      await ver(wrong, 'Hello world');
      // Flags say "yes" but no version has them.
      const stale = await ins('flags stale', true, true);
      await ver(stale, 'Hello world');
      // Melody only through a notation on the second version.
      const notation = await ins('flags notation', false, false);
      await ver(notation, 'Hello');
      await ver(notation, 'World', { notation: 'C D E' });
      // Already right.
      const right = await ins('flags right', true, false);
      await ver(right, 'C  G\nwords');
      // No versions at all.
      const empty = await ins('flags empty', true, true);

      const flagsOf = async (id: string) =>
        (await client!.query('select has_chords, has_melody from public.compositions where id = $1', [id])).rows[0];

      await client!.query(SQL);
      expect(await flagsOf(wrong)).toEqual({ has_chords: true, has_melody: false });
      expect(await flagsOf(stale)).toEqual({ has_chords: false, has_melody: false });
      expect(await flagsOf(notation)).toEqual({ has_chords: false, has_melody: true });
      expect(await flagsOf(right)).toEqual({ has_chords: true, has_melody: false });
      expect(await flagsOf(empty)).toEqual({ has_chords: false, has_melody: false });

      // The TypeScript rule agrees with the SQL rule.
      expect(songFlags([{ content_chordpro: '[Am]Hello [G]world' }, { content_chordpro: 'Hello world' }])).toEqual({
        has_chords: true,
        has_melody: false,
      });

      // Second run: nothing differs, nothing is written.
      const second = await client!.query(SQL);
      expect(Array.isArray(second) ? second.at(-1)?.rowCount : second.rowCount).toBe(0);
    } finally {
      await client.query('rollback');
    }
  });
});
