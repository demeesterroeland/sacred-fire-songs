// Review of PR #482: the New tab never lists other members' private songs, also not for an admin whose RLS reads all.
import { describe, expect, it, vi } from 'vitest';

type Call = [string, ...unknown[]];
const calls: Call[] = [];

function builder() {
  const b: Record<string, unknown> = {};
  for (const m of ['select', 'order', 'limit', 'eq', 'in', 'or', 'gte']) {
    b[m] = (...args: unknown[]) => {
      calls.push([m, ...args]);
      return b;
    };
  }
  b.then = (resolve: (v: unknown) => void) => resolve({ data: [], error: null });
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

import { getUnviewedSongs } from '@/lib/songs/serverQueries';

describe('getUnviewedSongs', () => {
  it('asks only for public songs and the member\'s own', async () => {
    calls.length = 0;
    await getUnviewedSongs('user-1', 50);
    const compositions = calls.findIndex((c) => c[0] === 'from' && c[1] === 'compositions');
    expect(compositions).toBeGreaterThan(-1);
    expect(calls.slice(compositions)).toContainEqual(['or', 'is_public.eq.true,owner_id.eq.user-1']);
  });
});
