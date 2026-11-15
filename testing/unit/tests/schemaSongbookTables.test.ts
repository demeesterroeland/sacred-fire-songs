import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Story 6.2.1 (#504): the fresh-install script must carry the songbook data model of
 * migration 20261111150000_songbook_data_model.sql, with the same access rules.
 */
const stripComments = (sql: string) =>
  sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .replace(/\s+/g, ' ')
    .toLowerCase();

const schema = stripComments(readFileSync(join(process.cwd(), 'docs/design/db-schema.sql'), 'utf8'));
const migration = stripComments(
  readFileSync(join(process.cwd(), 'supabase/migrations/20261111150000_songbook_data_model.sql'), 'utf8')
);

const policies = (sql: string) => (sql.match(/create policy[\s\S]*?;/g) ?? []).map((p) => p.trim());
const on = (sql: string, table: string) => policies(sql).filter((p) => p.includes(`on public.${table} `));

const NEW_TABLES = ['songbooks', 'song_version_sources', 'song_translations'];

/** The function definition and its trigger, from `create or replace function public.<name>` up to the trigger's `execute function`. */
const guard = (sql: string, name: string) => {
  const match = sql.match(
    new RegExp(`create or replace function public\\.${name}\\(\\)[\\s\\S]*?execute function public\\.${name}\\(\\);`)
  );
  return match?.[0];
};

const CATALOG_GUARDS = [
  ['fn_guard_catalog_slug', 'trg_guard_catalog_slug', 'compositions', 'catalog_slug'],
  ['fn_guard_catalog_source_id', 'trg_guard_catalog_source_id', 'song_versions', 'catalog_source_id'],
];

describe('db-schema.sql: songbook data model (Story 6.2.1)', () => {
  it.each([
    ['compositions', 'catalog_slug text unique'],
    ['compositions', 'aliases text[] not null default'],
    ['compositions', 'authors text[] not null default'],
    ['song_versions', 'catalog_source_id text'],
    ['song_versions', "version_kind text not null default 'original'"],
    ['song_versions', 'beats text'],
    ['song_versions', 'song_note text'],
  ])('%s has %s', (_table, column) => {
    expect(schema).toContain(column);
  });

  it('a version is unique per song and catalog source', () => {
    expect(schema).toMatch(/unique index[^;]*on public\.song_versions \(composition_id, catalog_source_id\)/);
  });

  it.each(NEW_TABLES)('%s is created with row-level security', (table) => {
    expect(schema).toMatch(new RegExp(`create table (if not exists )?public\\.${table} \\(`));
    expect(schema).toContain(`alter table public.${table} enable row level security`);
  });

  it.each(NEW_TABLES)('%s has the same policies as the migration and none open to everyone', (table) => {
    expect(on(schema, table)).toEqual(on(migration, table));
    expect(on(schema, table).filter((p) => /(using|with check) \(true\)/.test(p))).toEqual([]);
  });

  it.each(NEW_TABLES)('%s is written by admins only', (table) => {
    const writes = on(schema, table).filter((p) => !/ for select /.test(p));
    expect(writes.length).toBeGreaterThan(0);
    for (const policy of writes) expect(policy).toContain('fn_is_admin()');
  });

  it.each(CATALOG_GUARDS)('%s guards the catalog key like the migration', (fn, trigger, table, column) => {
    const definition = guard(schema, fn);
    expect(definition).toBeDefined();
    expect(definition).toEqual(guard(migration, fn));
    expect(definition).toContain(`create trigger ${trigger} before insert or update on public.${table}`);
    expect(definition).toContain(`new.${column} is not null`);
    expect(definition).toContain('public.fn_is_admin()');
  });

  it.each([
    ['catalog_slug', "catalog_slug <> '' and catalog_slug = btrim(catalog_slug)"],
    ['catalog_source_id', "catalog_source_id <> '' and catalog_source_id = btrim(catalog_source_id)"],
    ['songbooks.id', "id <> '' and id = btrim(id)"],
    ['song_translations.language', 'language = lower(language)'],
  ])('%s has the strict check of the migration', (_column, check) => {
    expect(schema).toContain(check);
    expect(migration).toContain(check);
  });

  it('a cited songbook cannot be deleted', () => {
    for (const sql of [schema, migration]) {
      expect(sql).toContain('references public.songbooks(id) on update cascade on delete restrict');
    }
  });
});
