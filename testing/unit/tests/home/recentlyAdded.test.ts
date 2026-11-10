// Story 6.1.28 / G6.3 (#412): the "Recently added" query only returns songs a guest may see.
import { describe, expect, it, vi } from 'vitest';

type Call = [string, ...unknown[]];
const calls: Call[] = [];
let rows: unknown[] = [];

// Chainable, awaitable stand-in for the PostgREST builder: records every call.
function builder() {
  const b: Record<string, unknown> = {};
  for (const m of ['select', 'order', 'limit', 'eq', 'in', 'or']) {
    b[m] = (...args: unknown[]) => {
      calls.push([m, ...args]);
      return b;
    };
  }
  b.then = (resolve: (v: unknown) => void) => resolve({ data: rows, error: null });
  return b;
}
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: (table: string) => {
      calls.push(['from', table]);
      return builder();
    },
  })),
}));

import { getRecentlyAddedSongs } from '@/lib/songs/serverQueries';
import { RECENTLY_ADDED_LIMIT, RECENTLY_ADDED_PHONE_LIMIT, RECENTLY_ADDED_SELECT } from '@/lib/songs/queries';

describe('getRecentlyAddedSongs', () => {
  it('asks for the newest public compositions only, limited to the row size', async () => {
    calls.length = 0;
    rows = [
      {
        id: 's1',
        title: 'Agua',
        original_author: 'Trad.',
        owner_id: 'u1',
        is_public: true,
        created_at: '2026-11-05T00:00:00Z',
        song_versions: [{ key: 'Am', content_chordpro: '', melody_notation: '' }],
        song_category_map: [],
      },
    ];
    const songs = await getRecentlyAddedSongs();

    expect(calls).toContainEqual(['from', 'compositions']);
    expect(calls).toContainEqual(['eq', 'is_public', true]);
    expect(calls).toContainEqual(['order', 'created_at', { ascending: false }]);
    expect(calls).toContainEqual(['limit', RECENTLY_ADDED_LIMIT]);
    expect(RECENTLY_ADDED_LIMIT).toBe(10);
    expect(RECENTLY_ADDED_PHONE_LIMIT).toBe(5);
    expect(songs.map((s) => [s.id, s.title, s.songKey])).toEqual([['s1', 'Agua', 'Am']]);
  });

  it('selects only what a compact row shows (no chordpro, melody or SELECT *)', async () => {
    calls.length = 0;
    rows = [];
    await getRecentlyAddedSongs();
    expect(calls).toContainEqual(['select', RECENTLY_ADDED_SELECT]);
    expect(RECENTLY_ADDED_SELECT).not.toMatch(/\*/);
    expect(RECENTLY_ADDED_SELECT).not.toMatch(/content_chordpro|melody_notation|owner_id/);
    for (const field of ['id', 'title', 'original_author', 'is_public', 'created_at', 'song_versions(key)']) {
      expect(RECENTLY_ADDED_SELECT).toContain(field);
    }
  });

  it('returns an empty list when the query fails (the row is simply hidden)', async () => {
    rows = [];
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValueOnce({
      from: () => {
        const failing: Record<string, unknown> = {};
        for (const m of ['select', 'order', 'limit', 'eq']) failing[m] = () => failing;
        failing.then = (resolve: (v: unknown) => void) => resolve({ data: null, error: { message: 'boom' } });
        return failing;
      },
    } as never);
    expect(await getRecentlyAddedSongs()).toEqual([]);
    spy.mockRestore();
  });
});
