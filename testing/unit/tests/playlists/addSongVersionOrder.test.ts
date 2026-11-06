// Story 6.1.11 / G2.6 (#395, UXA-048): adding a song to a playlist uses the OLDEST version, with the same
// order and `id` tiebreak as lib/songs/versionOrder.ts, whichever version the reader is looking at.
import { describe, expect, it, vi } from 'vitest';

const PLAYLIST = '11111111-1111-4111-8111-111111111111';
const SONG = '22222222-2222-4222-8222-222222222222';
const USER = '33333333-3333-4333-8333-333333333333';
const OLDEST = '44444444-4444-4444-8444-444444444444';
const NEWER = '55555555-5555-4555-8555-555555555555';

const calls = vi.hoisted(() => ({ versionOrders: [] as Array<[string, unknown]>, inserted: [] as unknown[] }));

function builder(table: string) {
  const result = (): { data: unknown } => {
    if (table === 'setlists') return { data: { owner_id: USER, is_public: false } };
    if (table === 'song_versions') return { data: [{ id: OLDEST }, { id: NEWER }] };
    if (table === 'setlist_items') return { data: [] };
    return { data: null };
  };
  const chain: Record<string, unknown> = {};
  for (const m of ['select', 'eq', 'in', 'limit']) chain[m] = () => chain;
  chain.order = (column: string, opts: unknown) => {
    if (table === 'song_versions') calls.versionOrders.push([column, opts]);
    return chain;
  };
  chain.insert = (row: unknown) => {
    calls.inserted.push(row);
    return Promise.resolve({ error: null });
  };
  chain.maybeSingle = () => Promise.resolve(table === 'setlist_items' ? { data: null } : result());
  chain.then = (resolve: (v: unknown) => unknown) => resolve(result());
  return chain;
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: USER } } }) },
    from: (table: string) => builder(table),
  }),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('addSongToPlaylist', () => {
  it('orders versions by created_at, then id, and adds the oldest one', async () => {
    const { addSongToPlaylist } = await import('@/app/actions/playlistActions');
    const res = await addSongToPlaylist(PLAYLIST, SONG);
    expect(res).toEqual({ added: true });
    expect(calls.versionOrders).toEqual([
      ['created_at', { ascending: true }],
      ['id', { ascending: true }],
    ]);
    expect(calls.inserted).toEqual([{ setlist_id: PLAYLIST, song_version_id: OLDEST, order_index: 0 }]);
  });
});
