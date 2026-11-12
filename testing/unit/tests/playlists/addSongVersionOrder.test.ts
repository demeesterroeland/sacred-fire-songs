// Story 6.1.11 / G2.6 (#395, UXA-048) and 6.2.6 (#509): adding a song to a playlist uses the FIRST version of the
// song page's order (original, variants, translations; each oldest first, `id` tiebreak: lib/songs/versionOrder.ts),
// whichever version the reader is looking at and whatever order the database returns the rows in.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const PLAYLIST = '11111111-1111-4111-8111-111111111111';
const SONG = '22222222-2222-4222-8222-222222222222';
const USER = '33333333-3333-4333-8333-333333333333';
const ORIGINAL = '44444444-4444-4444-8444-444444444444';
const VARIANT = '55555555-5555-4555-8555-555555555555';
const TRANSLATION = '66666666-6666-4666-8666-666666666666';

const calls = vi.hoisted(() => ({
  versions: [] as Array<Record<string, unknown>>,
  versionSelects: [] as string[],
  inserted: [] as unknown[],
  inFilters: [] as unknown[][],
}));

function builder(table: string) {
  const result = (): { data: unknown } => {
    if (table === 'setlists') return { data: { owner_id: USER, is_public: false } };
    if (table === 'song_versions') return { data: calls.versions };
    if (table === 'setlist_items') return { data: [] };
    return { data: null };
  };
  const chain: Record<string, unknown> = {};
  for (const m of ['eq', 'limit', 'order']) chain[m] = () => chain;
  chain.select = (columns: string) => {
    if (table === 'song_versions') calls.versionSelects.push(columns);
    return chain;
  };
  chain.in = (_column: string, values: unknown[]) => {
    calls.inFilters.push(values);
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
  beforeEach(() => {
    calls.versionSelects = [];
    calls.inserted = [];
    calls.inFilters = [];
  });

  it('adds the first version of the song page order, even when a translation is the oldest row', async () => {
    // Database order: the translation was written first, the original last.
    calls.versions = [
      { id: TRANSLATION, created_at: '2026-01-01T00:00:00Z', version_kind: 'translation' },
      { id: VARIANT, created_at: '2026-01-02T00:00:00Z', version_kind: 'variant' },
      { id: ORIGINAL, created_at: '2026-01-03T00:00:00Z', version_kind: 'original' },
    ];
    const { addSongToPlaylist } = await import('@/app/actions/playlistActions');
    const res = await addSongToPlaylist(PLAYLIST, SONG);
    expect(res).toEqual({ added: true });
    expect(calls.versionSelects[0]).toMatch(/created_at/);
    expect(calls.versionSelects[0]).toMatch(/version_kind/);
    expect(calls.inserted).toEqual([{ setlist_id: PLAYLIST, song_version_id: ORIGINAL, order_index: 0 }]);
    // The "already in the playlist" check still covers every version.
    expect([...(calls.inFilters[0] as string[])].sort()).toEqual([ORIGINAL, VARIANT, TRANSLATION].sort());
  });

  it('breaks identical timestamps by id, as the song page does', async () => {
    calls.versions = [
      { id: VARIANT, created_at: '2026-01-01T00:00:00Z', version_kind: 'original' },
      { id: ORIGINAL, created_at: '2026-01-01T00:00:00Z', version_kind: 'original' },
    ];
    const { addSongToPlaylist } = await import('@/app/actions/playlistActions');
    await addSongToPlaylist(PLAYLIST, SONG);
    expect(calls.inserted).toEqual([{ setlist_id: PLAYLIST, song_version_id: ORIGINAL, order_index: 0 }]);
  });
});
