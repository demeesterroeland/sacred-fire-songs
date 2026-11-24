// Story 6.2.26 / G1.5 (#598), review fix: the queue lists every open suggestion (no limit), only the history is capped,
// so the "To review (n)" tab always matches the badge.
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Call = { status: 'open' | 'history'; limit?: number };
const calls: Call[] = [];
const OPEN = Array.from({ length: 250 }, (_, i) => row(`o${i}`, 'open', `2026-11-${String(20 - (i % 10)).padStart(2, '0')}T10:00:00Z`));
const HISTORY = [row('h1', 'declined', '2026-11-22T10:00:00Z'), row('h2', 'accepted', '2026-11-01T10:00:00Z')];

function row(id: string, status: string, created_at: string) {
  return {
    id, source_id: 's', target_id: 't', source_title: 'A', target_title: 'B', suggested_by: 'u1', note: null, status,
    decision_note: null, reviewed_by: null, reviewed_at: null, reopened_at: null, created_at,
  };
}

function builder() {
  const call: Call = { status: 'history' };
  const b: Record<string, unknown> = {};
  b.select = vi.fn(() => b);
  b.order = vi.fn(() => b);
  b.eq = vi.fn((_c: string, v: string) => {
    if (v === 'open') call.status = 'open';
    return b;
  });
  b.neq = vi.fn(() => b);
  b.limit = vi.fn((n: number) => {
    call.limit = n;
    return b;
  });
  b.then = (resolve: (v: unknown) => unknown) => {
    calls.push({ ...call });
    return Promise.resolve({ data: call.status === 'open' ? OPEN : HISTORY, error: null }).then(resolve);
  };
  return b;
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: (table: string) =>
      table === 'public_profiles'
        ? { select: () => ({ in: () => Promise.resolve({ data: [{ id: 'u1', full_name: 'Anna' }], error: null }) }) }
        : builder(),
  }),
}));

import { getLinkSuggestions, SUGGESTIONS_HISTORY_LIMIT } from '@/lib/suggestions/serverQueries';

beforeEach(() => {
  calls.length = 0;
});

describe('getLinkSuggestions', () => {
  it('reads every open suggestion without a limit and caps only the history', async () => {
    const rows = await getLinkSuggestions();
    const open = calls.find((c) => c.status === 'open')!;
    const history = calls.find((c) => c.status === 'history')!;
    expect(open.limit).toBeUndefined();
    expect(history.limit).toBe(SUGGESTIONS_HISTORY_LIMIT);
    expect(rows.filter((r) => r.status === 'open')).toHaveLength(250);
    expect(rows).toHaveLength(252);
  });

  it('returns the newest first and adds the names', async () => {
    const rows = await getLinkSuggestions();
    const dates = rows.map((r) => r.created_at);
    expect([...dates].sort().reverse()).toEqual(dates);
    expect(rows[0].suggester_name).toBe('Anna');
  });
});
