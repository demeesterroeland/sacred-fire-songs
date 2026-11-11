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
});
