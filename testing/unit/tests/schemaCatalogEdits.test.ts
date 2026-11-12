import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Story 6.2.21 (#524): the fresh-install script must carry the catalog edit markers, the
 * trigger, the export and the clear function of migration
 * 20261112160000_protect_catalog_app_edits.sql, unchanged.
 */
const normalize = (sql: string) =>
  sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .replace(/\s+/g, ' ')
    .toLowerCase();

const schema = normalize(readFileSync(join(process.cwd(), 'docs/design/db-schema.sql'), 'utf8'));
const migration = normalize(
  readFileSync(join(process.cwd(), 'supabase/migrations/20261112160000_protect_catalog_app_edits.sql'), 'utf8')
);

const fn = (sql: string, name: string) =>
  sql.match(new RegExp(`create or replace function public\\.${name}\\([\\s\\S]*?\\$\\$;`))?.[0];
const trigger = (sql: string, table: string) =>
  sql.match(new RegExp(`create trigger trg_track_catalog_edit before insert or update on public\\.${table}[^;]*;`))?.[0];

describe('db-schema.sql: catalog edit markers (Story 6.2.21)', () => {
  it.each(['compositions', 'song_versions'])('%s has the three marker columns', (table) => {
    const create = schema.match(new RegExp(`create table public\\.${table} \\([\\s\\S]*?\\);`))?.[0] ?? '';
    expect(create).toContain('edited_in_app boolean not null default false');
    expect(create).toContain('edited_at timestamptz');
    expect(create).toContain("edited_fields text[] not null default '{}'");
  });

  it.each(['fn_track_catalog_edit', 'fn_catalog_edits_export', 'fn_clear_catalog_edit'])(
    '%s matches the migration',
    (name) => {
      expect(fn(schema, name)).toBeDefined();
      expect(fn(schema, name)).toEqual(fn(migration, name));
    }
  );

  it.each(['compositions', 'song_versions'])('the %s trigger tracks the same columns as the migration', (table) => {
    expect(trigger(schema, table)).toBeDefined();
    expect(trigger(schema, table)).toEqual(trigger(migration, table));
  });

  it('only signed-in app users mark rows, and only catalog rows', () => {
    const track = fn(migration, 'fn_track_catalog_edit') ?? '';
    expect(track).toContain("coalesce(auth.role(), '') <> 'authenticated'");
    expect(track).toContain('new_row ->> tg_argv[0] is null');
    expect(track).toContain("current_user in ('anon', 'authenticated')");
  });

  it('the export and the clear function are admin-only and closed to guests', () => {
    for (const name of ['fn_catalog_edits_export', 'fn_clear_catalog_edit']) {
      expect(fn(migration, name)).toContain('if not public.fn_is_admin() then');
      expect(fn(migration, name)).toContain('security definer');
    }
    expect(schema).toContain('revoke all on function public.fn_catalog_edits_export() from public, anon;');
    expect(schema).toContain('revoke all on function public.fn_clear_catalog_edit(text, uuid) from public, anon;');
  });
});
