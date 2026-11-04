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

describe('fetchSong', () => {
  beforeEach(() => {
    query.result = { data: null, error: null };
    query.terminal = '';
  });

  it('asks for at most one row, so a missing song is not an error', async () => {
    await fetchSong('missing-id');
    expect(query.terminal).toBe('maybeSingle');
  });

  it('returns null when no song has that id', async () => {
    expect(await fetchSong('missing-id')).toBeNull();
  });

  it('returns the song row when it exists', async () => {
    query.result = { data: { id: 'abc', title: 'Morning Sunrise' }, error: null };
    expect(await fetchSong('abc')).toEqual({ id: 'abc', title: 'Morning Sunrise' });
  });

  it('throws real errors, so the page can offer Retry', async () => {
    const error = { message: 'Failed to fetch' };
    query.result = { data: null, error };
    await expect(fetchSong('abc')).rejects.toBe(error);
  });
});
