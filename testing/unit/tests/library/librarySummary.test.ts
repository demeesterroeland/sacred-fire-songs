// Validation 2, items 9 and 13: the Library smart cards count what is yours. "My Drafts" is filtered by owner
// (an admin sees every draft through RLS, but their own card must only count their own), and the recordings
// card counts recordings (with their own public/private state), not songs.
import { describe, expect, it } from 'vitest';
import { fetchLibrarySummary, summarizeRecordings } from '@/lib/library/summary';

type Call = { table: string; filters: [string, unknown][] };

/** A thenable query builder that records `.eq()` filters and resolves with canned rows per table. */
function fakeSupabase(rows: Record<string, unknown[]>) {
  const calls: Call[] = [];
  const client = {
    from(table: string) {
      const call: Call = { table, filters: [] };
      calls.push(call);
      const builder: Record<string, unknown> = {
        select: () => builder,
        eq: (col: string, val: unknown) => {
          call.filters.push([col, val]);
          return builder;
        },
        limit: () => builder,
        then: (resolve: (v: unknown) => unknown) => resolve({ data: rows[table] ?? [], error: null }),
      };
      return builder;
    },
  };
  return { client, calls };
}

describe('fetchLibrarySummary', () => {
  it('counts only the signed-in user\'s drafts: the drafts query filters on the owner', async () => {
    const { client, calls } = fakeSupabase({ compositions: [{ title: 'A', is_public: false }] });
    await fetchLibrarySummary(client as never, 'user-1');
    const drafts = calls.filter((c) => c.table === 'compositions' && c.filters.some(([col, v]) => col === 'is_public' && v === false));
    expect(drafts).toHaveLength(1);
    expect(drafts[0].filters).toContainEqual(['owner_id', 'user-1']);
  });

  it('asks for the user\'s own recordings only', async () => {
    const { client, calls } = fakeSupabase({});
    await fetchLibrarySummary(client as never, 'user-1');
    const rec = calls.find((c) => c.table === 'user_recordings');
    expect(rec?.filters).toContainEqual(['user_id', 'user-1']);
  });
});

describe('summarizeRecordings', () => {
  it('counts recordings, split by the recording\'s own visibility, and lists distinct song titles', () => {
    const s = summarizeRecordings([
      { is_public: true, song_versions: { compositions: { title: 'Fire' } } },
      { is_public: false, song_versions: { compositions: { title: 'Fire' } } },
      { is_public: false, song_versions: { compositions: { title: 'Water' } } },
    ]);
    expect(s.total).toBe(3);
    expect(s.public).toBe(1);
    expect(s.private).toBe(2);
    expect(s.titles).toEqual(['Fire', 'Water']);
  });

  it('is empty for no recordings', () => {
    expect(summarizeRecordings([])).toEqual({ total: 0, public: 0, private: 0, titles: [] });
  });
});

// The Home screen's count of "drafts" has the same trap: an admin reads every draft through RLS.
describe('Home getLibrarySummary', () => {
  it('counts only the signed-in user\'s drafts', async () => {
    const { vi } = await import('vitest');
    const calls: Call[] = [];
    const make = (table: string) => {
      const call: Call = { table, filters: [] };
      calls.push(call);
      const builder: Record<string, unknown> = {
        select: () => builder,
        eq: (col: string, val: unknown) => (call.filters.push([col, val]), builder),
        gte: () => builder,
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        then: (resolve: (v: unknown) => unknown) => resolve({ data: [], count: 0, error: null }),
      };
      return builder;
    };
    vi.resetModules();
    vi.doMock('@/lib/supabase/server', () => ({ createClient: async () => ({ from: make }) }));
    const { getLibrarySummary } = await import('@/lib/songs/serverQueries');
    await getLibrarySummary('user-1');
    const drafts = calls.filter((c) => c.table === 'compositions' && c.filters.some(([col, v]) => col === 'is_public' && v === false));
    expect(drafts).toHaveLength(1);
    expect(drafts[0].filters).toContainEqual(['owner_id', 'user-1']);
    vi.doUnmock('@/lib/supabase/server');
  });
});
