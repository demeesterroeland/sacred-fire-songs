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
    expect(track).toContain("current_user in ('anon', 'authenticated')");
  });

  it('checks the catalog key on the old row too, so clearing it counts (review N5)', () => {
    const track = fn(migration, 'fn_track_catalog_edit') ?? '';
    expect(track).toContain('new.catalog_slug is null and old.catalog_slug is null');
    expect(track).toContain('new.catalog_source_id is null and old.catalog_source_id is null');
    expect(track).toContain('for i in 0 .. tg_nargs - 1 loop');
  });

  it('builds the row snapshots only after the early returns (review N3)', () => {
    const track = fn(migration, 'fn_track_catalog_edit') ?? '';
    expect(track).not.toMatch(/new_row jsonb :=/);
    expect(track.indexOf('new_row := to_jsonb(new)')).toBeGreaterThan(track.indexOf('return new; end if;'));
  });

  it('exports the slug of the song a moved version now belongs to, not its uuid (review N4)', () => {
    expect(fn(migration, 'fn_catalog_edits_export')).toContain(
      "case when f = 'composition_id' then to_jsonb(c.catalog_slug) else to_jsonb(v) -> f end"
    );
  });

  it('clears a marker only for the edit the admin downloaded (review S1)', () => {
    const clear = fn(migration, 'fn_clear_catalog_edit') ?? '';
    expect(clear).toContain('fn_clear_catalog_edit(p_kind text, p_id uuid, p_edited_at timestamptz) returns text');
    expect(clear).toContain('where id = p_id and edited_in_app and edited_at = p_edited_at;');
    expect(clear).toContain("'changed'");
    expect(clear).toContain("'not_marked'");
  });

  it('the export and the clear function are admin-only and closed to guests', () => {
    for (const name of ['fn_catalog_edits_export', 'fn_clear_catalog_edit']) {
      expect(fn(migration, name)).toContain('if not public.fn_is_admin() then');
      expect(fn(migration, name)).toContain('security definer');
    }
    for (const sql of [schema, migration]) {
      expect(sql).toContain('revoke all on function public.fn_catalog_edits_export() from public, anon, service_role;');
      expect(sql).toContain('grant execute on function public.fn_catalog_edits_export() to authenticated;');
      expect(sql).toContain(
        'revoke all on function public.fn_clear_catalog_edit(text, uuid, timestamptz) from public, anon, service_role;'
      );
      expect(sql).toContain('grant execute on function public.fn_clear_catalog_edit(text, uuid, timestamptz) to authenticated;');
      // fn_is_admin() reads auth.uid(), so the service role would be refused anyway (review S2).
      expect(sql).not.toMatch(/grant execute on function public\.fn_(catalog_edits_export|clear_catalog_edit)\([^)]*\) to [^;]*service_role/);
    }
  });
});
