// Story 6.2.18 / G5.1 (#521): the whole song list is fetched in pages, because PostgREST silently stops at
// `max_rows` (1000 in supabase/config.toml, possibly lower on a self-hosted server) and search would miss every song
// after that.
import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchAllSongRows, SONGS_FETCH_PAGE_SIZE } from '@/lib/songs/queries';

type Row = { id: string; created_at: string };
const CURSOR = /^created_at\.lt\.(.+?),and\(created_at\.eq\.(.+?),id\.lt\.(.+)\)$/;

/**
 * A client that behaves like PostgREST for `songsQuery`: newest first on (`created_at`, `id`), the keyset `or()`
 * filter of the cursor, and `limit()` honoured but never more than `maxRows`.
 */
function fakeClient(total: number, opts: { maxRows?: number; failOnCall?: number; onCall?: (call: number, rows: Row[]) => void } = {}) {
  const maxRows = opts.maxRows ?? 1000;
  const rows: Row[] = Array.from({ length: total }, (_, i) => ({
    id: `s${String(i).padStart(5, '0')}`,
    created_at: `2026-01-01T00:00:${String(i % 60).padStart(2, '0')}.${String(i).padStart(6, '0')}+00:00`,
  }));
  const sorted = () =>
    [...rows].sort((a, b) => (a.created_at === b.created_at ? (a.id < b.id ? 1 : -1) : a.created_at < b.created_at ? 1 : -1));
  const calls: { cursor: [string, string] | null; limit: number }[] = [];
  const orders: string[] = [];
  const builder = {
    cursor: null as [string, string] | null,
    select: () => {
      builder.cursor = null;
      return builder;
    },
    order: (col: string) => {
      orders.push(col);
      return builder;
    },
    or: (filter: string) => {
      const m = CURSOR.exec(filter)!;
      builder.cursor = [m[2], m[3]];
      return builder;
    },
    limit: (n: number) => {
      calls.push({ cursor: builder.cursor, limit: n });
      opts.onCall?.(calls.length, rows);
      if (opts.failOnCall === calls.length) return Promise.resolve({ data: null, error: { message: 'boom' } });
      const c = builder.cursor;
      const after = sorted().filter((r) => !c || r.created_at < c[0] || (r.created_at === c[0] && r.id < c[1]));
      return Promise.resolve({ data: after.slice(0, Math.min(n, maxRows)), error: null });
    },
  };
  const client = { from: () => builder } as unknown as SupabaseClient;
  return { client, calls, orders, rows };
}

describe('fetchAllSongRows', () => {
  it('uses pages no bigger than the default server row cap', () => {
    expect(SONGS_FETCH_PAGE_SIZE).toBeLessThanOrEqual(1000);
  });

  it('returns every row when the catalog is bigger than max_rows (1000 + n)', async () => {
    const { client, calls } = fakeClient(1037);
    const { data, error } = await fetchAllSongRows(client);
    expect(error).toBeNull();
    expect(data).toHaveLength(1037);
    expect(new Set(data.map((r) => r.id)).size).toBe(1037);
    expect(calls.map((c) => c.limit)).toEqual([1000, 1000, 1000]);
    expect(calls[0].cursor).toBeNull();
  });

  it('keeps going on short pages: a server with max_rows 500 still yields the whole catalog', async () => {
    const { client, calls } = fakeClient(1234, { maxRows: 500 });
    const { data } = await fetchAllSongRows(client);
    expect(data).toHaveLength(1234);
    expect(new Set(data.map((r) => r.id)).size).toBe(1234);
    expect(calls).toHaveLength(4);
  });

  it('stops on the first empty page; an empty catalog needs one request', async () => {
    const small = fakeClient(12);
    expect((await fetchAllSongRows(small.client)).data).toHaveLength(12);
    expect(small.calls).toHaveLength(2);
    const empty = fakeClient(0);
    expect((await fetchAllSongRows(empty.client)).data).toEqual([]);
    expect(empty.calls).toHaveLength(1);
  });

  it('a song added between two pages neither repeats nor shifts a row (keyset, newest first)', async () => {
    const { client } = fakeClient(1500, {
      onCall: (call, rows) => {
        if (call === 2) rows.push({ id: 'new', created_at: '2027-01-01T00:00:00+00:00' });
      },
    });
    const { data } = await fetchAllSongRows(client);
    expect(data).toHaveLength(1500);
    expect(new Set(data.map((r) => r.id)).size).toBe(1500);
  });

  it('a song deleted between two pages skips no other row', async () => {
    const { client } = fakeClient(1500, {
      onCall: (call, rows) => {
        // The newest song, already on page 1, is deleted before page 2 is asked for.
        if (call !== 2) return;
        const newest = rows.reduce((a, b) => (b.created_at > a.created_at || (b.created_at === a.created_at && b.id > a.id) ? b : a));
        rows.splice(rows.indexOf(newest), 1);
      },
    });
    const { data } = await fetchAllSongRows(client);
    expect(data).toHaveLength(1500);
  });

  it('keeps the total order (created_at, id)', async () => {
    const { client, orders } = fakeClient(5);
    await fetchAllSongRows(client);
    expect(orders.slice(0, 2)).toEqual(['created_at', 'id']);
  });

  it('reports the error of any page instead of returning a partial list', async () => {
    const { client } = fakeClient(2500, { failOnCall: 2 });
    const result = await fetchAllSongRows(client);
    expect(result.error).toMatchObject({ message: 'boom' });
    expect(result.data).toEqual([]);
  });
});
