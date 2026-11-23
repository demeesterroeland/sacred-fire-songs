// @vitest-environment jsdom
// An admin (or curator) can read every member's setlists, so several setlists titled "My Favorites" are visible.
// Every lookup of the signed-in user's favourites must filter on the owner; otherwise `.maybeSingle()` meets several
// rows, answers with an error and no data, and the heart, the list and the counts come back empty.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

type Row = Record<string, unknown>;
const ME = 'user-admin';
const DB: Record<string, Row[]> = {
  compositions: [],
  setlists: [
    { id: 's-other-1', owner_id: 'user-a', title: 'My Favorites' },
    { id: 's-mine', owner_id: ME, title: 'My Favorites' },
    { id: 's-other-2', owner_id: 'user-b', title: 'My Favorites' },
    { id: 's-mine-2', owner_id: ME, title: 'Road trip' },
  ],
  setlist_items: [
    { setlist_id: 's-other-1', song_versions: { composition_id: 'c-other-1' } },
    { setlist_id: 's-mine', song_versions: { composition_id: 'c1' } },
    { setlist_id: 's-mine', song_versions: { composition_id: 'c2' } },
    { setlist_id: 's-other-2', song_versions: { composition_id: 'c-other-2' } },
  ],
};

/** A thenable query builder over DB that applies `.eq()` filters like the database would, and reproduces `.maybeSingle()`'s error on several rows. */
function fakeClient() {
  return {
    from(table: string) {
      const filters: Array<[string, unknown]> = [];
      let head = false;
      let order = false;
      const rows = () => DB[table].filter((r) => filters.every(([k, v]) => r[k] === v));
      const builder: Record<string, unknown> = {
        select: (_cols: string, opts?: { head?: boolean }) => ((head = !!opts?.head), builder),
        eq: (k: string, v: unknown) => (filters.push([k, v]), builder),
        order: () => ((order = true), builder),
        limit: () => builder,
        maybeSingle: async () => {
          const r = rows();
          // PostgREST: more than one row is an error and no data.
          return r.length > 1 && !order ? { data: null, error: { code: 'PGRST116' } } : { data: r[0] ?? null, error: null };
        },
        then: (resolve: (v: unknown) => unknown) =>
          resolve(head ? { count: rows().length, data: null, error: null } : { data: rows(), error: null }),
      };
      return builder;
    },
  };
}

vi.mock('@/lib/supabase/client', () => ({ createClient: () => fakeClient() }));

import { useFavoritesQuery } from '@/hooks/useFavoritesQuery';
import { useGlobalFilterCounts } from '@/hooks/useGlobalFilterCounts';
import { fetchFavoritesSetlistId } from '@/lib/playlists/favorites';

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>
);
afterEach(() => vi.clearAllMocks());

describe('fetchFavoritesSetlistId', () => {
  it('returns the signed-in user\'s own favourites setlist when several are visible', async () => {
    expect(await fetchFavoritesSetlistId(fakeClient() as never, ME)).toBe('s-mine');
  });
  it('is null for a user who has none', async () => {
    expect(await fetchFavoritesSetlistId(fakeClient() as never, 'user-nobody')).toBeNull();
  });
});

describe('with several "My Favorites" setlists visible', () => {
  it('the hearts (useFavoritesQuery) are the user\'s own favourites', async () => {
    const { result } = renderHook(() => useFavoritesQuery(ME), { wrapper });
    await waitFor(() => expect(result.current.favoriteIds.size).toBe(2));
    expect([...result.current.favoriteIds].sort()).toEqual(['c1', 'c2']);
  });

  it('the count (useGlobalFilterCounts) equals the number of hearts', async () => {
    const { result } = renderHook(() => useGlobalFilterCounts(ME), { wrapper });
    await waitFor(() => expect(result.current.favoritesCount).toBe(2));
  });
});

describe('no title-only lookup of a smart playlist is left', () => {
  it.each(['hooks/useFavoritesQuery.ts', 'hooks/useGlobalFilterCounts.ts', 'app/songs/[id]/page.tsx'])('%s uses the owner-filtered helper', (file) => {
    const src = readFileSync(file, 'utf8');
    expect(src).toContain('fetchFavoritesSetlistId');
    expect(src).not.toMatch(/\.eq\(\s*'title',\s*'My Favorites'\s*\)/);
  });
});
