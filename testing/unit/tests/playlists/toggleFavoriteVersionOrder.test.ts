// Story 6.2.6 (#509): the favourite is the song's FIRST version in the song page's order (original, variants,
// translations; lib/songs/versionOrder.ts), not simply the oldest row: a translation can be older than the original.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const SONG = '22222222-2222-4222-8222-222222222222';
const USER = '33333333-3333-4333-8333-333333333333';
const ORIGINAL = '44444444-4444-4444-8444-444444444444';
const TRANSLATION = '66666666-6666-4666-8666-666666666666';

const calls = vi.hoisted(() => ({
  versions: [] as Array<Record<string, unknown>>,
  versionSelects: [] as string[],
  eqVersion: [] as unknown[],
  inserted: [] as unknown[],
}));

function builder(table: string) {
  const chain: Record<string, unknown> = {};
  for (const m of ['limit', 'order']) chain[m] = () => chain;
  chain.select = (columns: string) => {
    if (table === 'song_versions') calls.versionSelects.push(columns);
    return chain;
  };
  chain.eq = (column: string, value: unknown) => {
    if (table === 'setlist_items' && column === 'song_version_id') calls.eqVersion.push(value);
    return chain;
  };
  chain.insert = (row: unknown) => {
    if (table === 'setlist_items') calls.inserted.push(row);
    return Object.assign(Promise.resolve({ error: null }), chain);
  };
  chain.single = () => Promise.resolve({ data: { id: 'list' }, error: null });
  chain.maybeSingle = () => Promise.resolve({ data: null });
  chain.then = (resolve: (v: unknown) => unknown) =>
    resolve({ data: table === 'song_versions' ? calls.versions : [] });
  return chain;
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: USER } } }) },
    from: (table: string) => builder(table),
  }),
}));
vi.mock('@/lib/playlists/favorites', () => ({
  FAVORITES_TITLE: 'My Favorites',
  fetchFavoritesSetlistId: async () => 'favorites-list',
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('toggleFavorite', () => {
  beforeEach(() => {
    calls.versionSelects = [];
    calls.eqVersion = [];
    calls.inserted = [];
  });

  it('favourites the original when a translation of the song is older', async () => {
    calls.versions = [
      { id: TRANSLATION, created_at: '2026-01-01T00:00:00Z', version_kind: 'translation' },
      { id: ORIGINAL, created_at: '2026-01-03T00:00:00Z', version_kind: 'original' },
    ];
    const { toggleFavorite } = await import('@/app/actions/toggleFavorite');
    const res = await toggleFavorite(SONG);
    expect(res).toEqual({ success: true, isFavorite: true });
    expect(calls.versionSelects[0]).toMatch(/created_at/);
    expect(calls.versionSelects[0]).toMatch(/version_kind/);
    expect(calls.eqVersion).toEqual([ORIGINAL]);
    expect(calls.inserted).toEqual([{ setlist_id: 'favorites-list', song_version_id: ORIGINAL, order_index: 0 }]);
  });

  it('reports a song without versions', async () => {
    calls.versions = [];
    const { toggleFavorite } = await import('@/app/actions/toggleFavorite');
    expect(await toggleFavorite(SONG)).toEqual({ error: 'Song version not found' });
  });
});
