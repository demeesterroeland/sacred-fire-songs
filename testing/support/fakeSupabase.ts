/**
 * In-memory stand-in for the subset of the Supabase JS client used by the
 * admin queries (`from().select().eq().order().maybeSingle()` + `auth.getUser`).
 *
 * Unlike a plain vi.fn() mock it validates every selected column against the
 * real table shape (see TABLE_COLUMNS, mirrored from the local database), so a
 * query that names a non-existent column fails the same way PostgREST does
 * (error code 42703) instead of silently passing.
 *
 * Shared by vitest unit tests (testing/unit/tests) and Cucumber @unit steps
 * (testing/bdd/steps).
 */

import type { AdminQueryClient } from '@/lib/admin/userQueries';

export const TABLE_COLUMNS: Record<string, string[]> = {
  profiles: ['id', 'email', 'role', 'full_name', 'avatar_url', 'created_at', 'last_seen_at'],
  compositions: [
    'id',
    'title',
    'original_author',
    'created_at',
    'owner_id',
    'is_public',
    'has_chords',
    'has_melody',
  ],
  song_versions: [
    'id',
    'composition_id',
    'version_name',
    'content_chordpro',
    'melody_notation',
    'key',
    'capo',
    'tuning',
    'soundcloud_url',
    'youtube_url',
    'spotify_url',
    'contributor_id',
    'vote_count',
    'created_at',
  ],
  setlists: ['id', 'owner_id', 'title', 'description', 'is_public', 'created_at'],
};

/** Embedded relations supported in select strings: `<embed>(cols)` on `<table>` via `<fk>`. */
const EMBEDS: Record<string, Record<string, { table: string; fk: string }>> = {
  song_versions: { compositions: { table: 'compositions', fk: 'composition_id' } },
};

type Row = Record<string, unknown>;
type QueryError = { code: string; message: string };
type Result = { data: unknown; error: QueryError | null };

export interface FakeSupabaseState {
  tables: Partial<Record<keyof typeof TABLE_COLUMNS | string, Row[]>>;
  authUser?: { id: string; email?: string } | null;
  authError?: { message: string } | null;
  /** Force a table query to fail (e.g. simulate a network/RLS error). */
  failingTables?: string[];
}

export interface FakeSupabase {
  /** Typed as the real client subset so it can be passed to the admin queries. */
  client: AdminQueryClient;
  /** Every select string issued, per table, in call order. */
  selects: Array<{ table: string; fields: string }>;
}

function splitTopLevel(fields: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of fields) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

class FakeQuery implements PromiseLike<Result> {
  private filters: Array<[string, unknown]> = [];
  private orderBy: { column: string; ascending: boolean } | null = null;
  private single = false;
  private fields = '*';

  constructor(
    private readonly table: string,
    private readonly state: FakeSupabaseState,
    private readonly log: FakeSupabase['selects']
  ) {}

  select(fields = '*') {
    this.fields = fields;
    this.log.push({ table: this.table, fields });
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push([column, value]);
    return this;
  }

  order(column: string, opts: { ascending?: boolean } = {}) {
    this.orderBy = { column, ascending: opts.ascending ?? true };
    return this;
  }

  maybeSingle() {
    this.single = true;
    return this;
  }

  private columnError(column: string): Result {
    return {
      data: null,
      error: { code: '42703', message: `column ${this.table}.${column} does not exist` },
    };
  }

  private execute(): Result {
    const columns = TABLE_COLUMNS[this.table];
    if (!columns) {
      return { data: null, error: { code: '42P01', message: `relation ${this.table} does not exist` } };
    }
    if (this.state.failingTables?.includes(this.table)) {
      return { data: null, error: { code: 'XX000', message: `simulated failure on ${this.table}` } };
    }

    const requested = this.fields === '*' ? columns : splitTopLevel(this.fields);
    const plain: string[] = [];
    const embeds: Array<{ name: string; cols: string[] }> = [];
    for (const part of requested) {
      const embed = part.match(/^(\w+)\((.*)\)$/);
      if (embed) {
        const [, name, inner] = embed;
        const relation = EMBEDS[this.table]?.[name];
        if (!relation) return this.columnError(name);
        const cols = splitTopLevel(inner);
        const bad = cols.find((c) => !TABLE_COLUMNS[relation.table].includes(c));
        if (bad) return { data: null, error: { code: '42703', message: `column ${relation.table}.${bad} does not exist` } };
        embeds.push({ name, cols });
      } else {
        if (!columns.includes(part)) return this.columnError(part);
        plain.push(part);
      }
    }
    for (const [column] of this.filters) {
      if (!columns.includes(column)) return this.columnError(column);
    }

    let rows = [...(this.state.tables[this.table] ?? [])].filter((row) =>
      this.filters.every(([column, value]) => row[column] === value)
    );

    if (this.orderBy) {
      const { column, ascending } = this.orderBy;
      rows.sort((a, b) => {
        const av = String(a[column] ?? '');
        const bv = String(b[column] ?? '');
        return ascending ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }

    rows = rows.map((row) => {
      const projected: Row = {};
      for (const col of plain) projected[col] = row[col] ?? null;
      for (const { name, cols } of embeds) {
        const relation = EMBEDS[this.table][name];
        const target = (this.state.tables[relation.table] ?? []).find((r) => r.id === row[relation.fk]);
        projected[name] = target ? Object.fromEntries(cols.map((c) => [c, target[c] ?? null])) : null;
      }
      return projected;
    });

    if (this.single) {
      if (rows.length > 1) {
        return { data: null, error: { code: 'PGRST116', message: 'multiple rows returned' } };
      }
      return { data: rows[0] ?? null, error: null };
    }
    return { data: rows, error: null };
  }

  then<TResult1 = Result, TResult2 = never>(
    onfulfilled?: ((value: Result) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }
}

export function createFakeSupabase(state: FakeSupabaseState): FakeSupabase {
  const selects: FakeSupabase['selects'] = [];
  const client = {
    auth: {
      getUser: async () => ({
        data: { user: state.authUser ?? null },
        error: state.authError ?? null,
      }),
    },
    from: (table: string) => new FakeQuery(table, state, selects),
  };
  return { selects, client: client as unknown as AdminQueryClient };
}
