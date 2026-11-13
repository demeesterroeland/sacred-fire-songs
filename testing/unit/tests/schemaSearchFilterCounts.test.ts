import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Story 6.2.25 (#570): the fresh-install script carries migration 20261113140000_search_filter_counts.sql
 * with the same read-only SECURITY INVOKER function and grants.
 */
const normalise = (sql: string) =>
  sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .replace(/\s+/g, ' ')
    .toLowerCase();

const schema = normalise(readFileSync(join(process.cwd(), 'docs/design/db-schema.sql'), 'utf8'));
const migration = normalise(
  readFileSync(join(process.cwd(), 'supabase/migrations/20261113140000_search_filter_counts.sql'), 'utf8')
);

const fn = (sql: string, name: string) =>
  sql.match(new RegExp(`create or replace function public\\.${name}\\([\\s\\S]*?\\$\\$;`))?.[0];

describe('db-schema.sql: search filter counts (Story 6.2.25)', () => {
  it('fn_search_filter_counts matches the migration, uses SECURITY INVOKER, and pins search_path', () => {
    const inSchema = fn(schema, 'fn_search_filter_counts');
    expect(inSchema).toBeTruthy();
    expect(inSchema).toBe(fn(migration, 'fn_search_filter_counts'));
    expect(inSchema).toContain('security invoker');
    expect(inSchema).toContain("set search_path = ''");
  });

  it('grants execute to anon, authenticated, and service_role only', () => {
    expect(schema).toContain('revoke all on function public.fn_search_filter_counts() from public;');
    expect(schema).toContain(
      'grant execute on function public.fn_search_filter_counts() to anon, authenticated, service_role;'
    );
  });
});
