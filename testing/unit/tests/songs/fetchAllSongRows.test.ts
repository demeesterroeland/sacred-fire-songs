// Story 6.2.18 / G5.1 (#521): the whole song list is fetched in pages, because PostgREST silently stops at
// `max_rows` (1000, supabase/config.toml) and search would miss every song after that.
import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchAllSongRows, SONGS_FETCH_PAGE_SIZE } from '@/lib/songs/queries';

const MAX_ROWS = 1000;

/** A client that behaves like PostgREST: `.range()` is honoured but never returns more than `max_rows`. */
function fakeClient(total: number, failOnCall?: number) {
  const rows = Array.from({ length: total }, (_, i) => ({ id: `s${String(i).padStart(5, '0')}` }));
  const ranges: [number, number][] = [];
  const orders: string[] = [];
  const builder = {
    select: () => builder,
    order: (col: string) => {
      orders.push(col);
      return builder;
    },
    range: (from: number, to: number) => {
      ranges.push([from, to]);
      if (failOnCall === ranges.length) return Promise.resolve({ data: null, error: { message: 'boom' } });
      const end = Math.min(to + 1, from + MAX_ROWS);
      return Promise.resolve({ data: rows.slice(from, end), error: null });
    },
  };
  const client = { from: () => builder } as unknown as SupabaseClient;
  return { client, ranges, orders };
}

describe('fetchAllSongRows', () => {
  it('uses pages no bigger than the server row cap', () => {
    expect(SONGS_FETCH_PAGE_SIZE).toBeLessThanOrEqual(MAX_ROWS);
  });

  it('returns every row when the catalog is bigger than max_rows (1000 + n)', async () => {
    const { client, ranges } = fakeClient(1000 + 37);
    const { data, error } = await fetchAllSongRows(client);
    expect(error).toBeNull();
    expect(data).toHaveLength(1037);
    expect(new Set(data.map((r: { id: string }) => r.id)).size).toBe(1037);
    expect(ranges).toEqual([
      [0, 999],
      [1000, 1999],
    ]);
  });

  it('asks for one more page when the last page is exactly full, and stops on the empty one', async () => {
    const { client, ranges } = fakeClient(2000);
    const { data } = await fetchAllSongRows(client);
    expect(data).toHaveLength(2000);
    expect(ranges).toHaveLength(3);
  });

  it('needs a single request for a small catalog and an empty one', async () => {
    const small = fakeClient(12);
    expect((await fetchAllSongRows(small.client)).data).toHaveLength(12);
    expect(small.ranges).toHaveLength(1);
    expect((await fetchAllSongRows(fakeClient(0).client)).data).toEqual([]);
  });

  it('keeps the total order (created_at, id) so pages neither skip nor repeat rows', async () => {
    const { client, orders } = fakeClient(5);
    await fetchAllSongRows(client);
    expect(orders).toEqual(['created_at', 'id']);
  });

  it('reports the error of any page instead of returning a partial list', async () => {
    const { client } = fakeClient(2500, 2);
    const result = await fetchAllSongRows(client);
    expect(result.error).toMatchObject({ message: 'boom' });
    expect(result.data).toEqual([]);
  });
});
