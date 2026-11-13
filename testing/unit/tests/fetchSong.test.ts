/**
 * Issue #353 – a song id without a row must resolve to "not found" (null), not
 * to an error: the song page renders notFound() for null and "Couldn't load
 * this song" for errors (docs/testing/offline.feature, @unit @songLookup).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const query = vi.hoisted(() => ({ result: { data: null as unknown, error: null as unknown }, terminal: '', select: '' }));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => {
    const builder = {
      select: (columns: string) => {
        query.select = columns;
        return builder;
      },
      eq: () => builder,
      single: () => {
        query.terminal = 'single';
        return Promise.resolve(query.result);
      },
      maybeSingle: () => {
        query.terminal = 'maybeSingle';
        // maybeSingle() turns "zero rows" into data: null without an error.
        return Promise.resolve(query.result);
      },
    };
    return { from: () => builder };
  },
}));

import { fetchSong } from '@/lib/songs/fetchSong';
import { SONG_SELECT } from '@/lib/songs/songSelect';

const VALID_ID = '00000000-0000-4000-8000-000000000000';

describe('fetchSong', () => {
  beforeEach(() => {
    query.result = { data: null, error: null };
    query.terminal = '';
  });

  it('returns null without querying Supabase when the id is not a UUID (#578)', async () => {
    expect(await fetchSong('xyz')).toBeNull();
    expect(query.terminal).toBe('');
  });

  it('asks for at most one row, so a missing song is not an error', async () => {
    await fetchSong(VALID_ID);
    expect(query.terminal).toBe('maybeSingle');
  });

  it('asks for each version\'s songbook sources, book, page and compiler (Story 6.2.10, #513)', async () => {
    await fetchSong('abc');
    expect(query.select).toMatch(/song_versions \([\s\S]*song_version_sources \([\s\S]*page[\s\S]*songbooks \([\s\S]*compiler/);
  });

  it('embeds song_version_sources exactly once (a second embed fails every song page with 42803)', async () => {
    await fetchSong('abc');
    expect(query.select.match(/song_version_sources\s*\(/g)).toHaveLength(1);
    expect(SONG_SELECT.match(/song_version_sources\s*\(/g)).toHaveLength(1);
    expect(query.select).toBe(SONG_SELECT);
  });

  // Story 6.2.12 (#515): every author of a co-written song is shown, so the song page must select `authors`.
  it('selects the composition authors[] column next to original_author (#515)', () => {
    const composition = SONG_SELECT.split('song_versions (')[0];
    expect(composition).toMatch(/\boriginal_author\b/);
    expect(composition).toMatch(/\bauthors\b/);
  });

  it('returns null when no song has that id', async () => {
    expect(await fetchSong(VALID_ID)).toBeNull();
  });

  it('returns the song row when it exists', async () => {
    query.result = { data: { id: VALID_ID, title: 'Morning Sunrise' }, error: null };
    expect(await fetchSong(VALID_ID)).toEqual({ id: VALID_ID, title: 'Morning Sunrise' });
  });

  // Story 6.2.8 (#511): each version carries its printed note, so the song page can show "About this song".
  it('selects each version\'s song_note', async () => {
    query.result = { data: null, error: null };
    await fetchSong('abc');
    expect(query.select).toMatch(/\bsong_note\b/);
  });

  it('throws real errors, so the page can offer Retry', async () => {
    const error = { message: 'Failed to fetch' };
    query.result = { data: null, error };
    await expect(fetchSong(VALID_ID)).rejects.toBe(error);
  });
});

describe('fetchSong version order (Story 6.1.11 / G2.6, #395)', () => {
  it('returns song_versions oldest first, so the original comes first in the switch', async () => {
    query.result = {
      data: {
        title: 'T',
        song_versions: [
          { id: 'late', created_at: '2026-03-01T00:00:00Z' },
          { id: 'early', created_at: '2026-01-01T00:00:00Z' },
          { id: 'mid', created_at: '2026-02-01T00:00:00Z' },
        ],
      },
      error: null,
    };
    const song = (await fetchSong(VALID_ID)) as { song_versions: { id: string }[] };
    expect(song.song_versions.map((v) => v.id)).toEqual(['early', 'mid', 'late']);
  });

  it('breaks identical timestamps by id (same order on every read)', async () => {
    const t = '2026-01-01T00:00:00Z';
    query.result = {
      data: { title: 'T', song_versions: [{ id: 'b', created_at: t }, { id: 'a', created_at: t }] },
      error: null,
    };
    const song = (await fetchSong(VALID_ID)) as { song_versions: { id: string }[] };
    expect(song.song_versions.map((v) => v.id)).toEqual(['a', 'b']);
  });

  it('leaves a song without versions untouched', async () => {
    query.result = { data: { title: 'T', song_versions: [] }, error: null };
    const song = (await fetchSong(VALID_ID)) as { song_versions: unknown[] };
    expect(song.song_versions).toEqual([]);
  });
});
