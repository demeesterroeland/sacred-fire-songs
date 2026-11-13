/**
 * Issue #353 – a song id without a row must resolve to "not found" (null), not
 * to an error: the song page renders notFound() for null and "Couldn't load
 * this song" for errors (docs/testing/offline.feature, @unit @songLookup).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const query = vi.hoisted(() => ({ result: { data: null as unknown, error: null as unknown }, terminal: '' }));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => {
    const builder = {
      select: () => builder,
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

  it('returns null when no song has that id', async () => {
    expect(await fetchSong(VALID_ID)).toBeNull();
  });

  it('returns the song row when it exists', async () => {
    query.result = { data: { id: VALID_ID, title: 'Morning Sunrise' }, error: null };
    expect(await fetchSong(VALID_ID)).toEqual({ id: VALID_ID, title: 'Morning Sunrise' });
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
