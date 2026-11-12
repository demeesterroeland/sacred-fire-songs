import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Story 6.2.9 (#512): the fresh-install script carries migration 20261112120000_link_song_as_version.sql
 * with the same tables, functions and access rules.
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
  readFileSync(join(process.cwd(), 'supabase/migrations/20261112120000_link_song_as_version.sql'), 'utf8')
);

const fn = (sql: string, name: string) => sql.match(new RegExp(`create or replace function public\\.${name}\\([\\s\\S]*?\\$\\$;`))?.[0];

const FUNCTIONS = [
  'fn_assert_can_link_song',
  'fn_merge_song_names',
  'fn_song_link_summary',
  'fn_preview_song_link',
  'fn_link_song_as_version',
  'fn_song_id_for_catalog_slug',
];

describe('db-schema.sql: link a song as a version (Story 6.2.9)', () => {
  it.each(['composition_redirects', 'song_link_audit'])('%s exists with row-level security', (table) => {
    expect(schema).toContain(`create table if not exists public.${table} (`);
    expect(schema).toContain(`alter table public.${table} enable row level security`);
  });

  it.each(FUNCTIONS)('%s matches the migration and pins the search path', (name) => {
    const inSchema = fn(schema, name);
    expect(inSchema, name).toBeTruthy();
    expect(inSchema).toBe(fn(migration, name));
    expect(inSchema).toContain("set search_path = ''");
  });

  it('only signed-in users can call the link and preview functions', () => {
    for (const name of ['fn_link_song_as_version', 'fn_preview_song_link']) {
      expect(schema).toContain(`revoke all on function public.${name}(uuid, uuid) from public, anon;`);
      expect(schema).toContain(`grant execute on function public.${name}(uuid, uuid) to authenticated, service_role;`);
    }
    expect(schema).toContain('revoke all on function public.fn_assert_can_link_song(uuid, uuid) from public, anon, authenticated;');
  });

  it('the database checks the gatekeeper / admin role itself', () => {
    expect(fn(schema, 'fn_assert_can_link_song')).toContain("v_role not in ('admin', 'gatekeeper')");
  });

  it('nobody writes redirects or audit rows through the API', () => {
    expect(schema).toContain('revoke insert, update, delete, truncate on public.composition_redirects from anon, authenticated;');
    expect(schema).toContain('revoke insert, update, delete, truncate on public.song_link_audit from anon, authenticated;');
  });
});
