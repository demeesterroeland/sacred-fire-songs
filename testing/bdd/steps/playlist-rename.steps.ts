// #573 — docs/testing/playlist-rename.feature
//
// @seed steps read the catalog of the local database (support/db.ts, rolled-back transaction).
import assert from 'node:assert/strict';
import { Given, Then } from '@cucumber/cucumber';
import { seedDb } from '../support/db';

Given('the playlist rename migration has run', async function () {
  const db = await seedDb();
  const { rows } = await db.query(`SELECT to_regclass('public.playlists') AS t`);
  assert.ok(rows[0].t, 'run the local migrations first: npx supabase migration up');
});

Then('the tables {string} and {string} exist', async function (a: string, b: string) {
  const db = await seedDb();
  for (const name of [a, b]) {
    const { rows } = await db.query(`SELECT to_regclass($1) AS t`, [`public.${name}`]);
    assert.ok(rows[0].t, `table ${name} is missing`);
  }
});

Then('{string} has the column {string}', async function (table: string, column: string) {
  const db = await seedDb();
  const { rowCount } = await db.query(
    `SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [table, column]
  );
  assert.equal(rowCount, 1);
});

Then('the function {string} exists', async function (name: string) {
  const db = await seedDb();
  const { rowCount } = await db.query(
    `SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = $1`,
    [name]
  );
  assert.equal(rowCount, 1);
});

Then('nothing in the public schema carries the old name {string}', async function (word: string) {
  const db = await seedDb();
  const like = `%${word}%`;
  const { rows } = await db.query(
    `SELECT 'relation ' || c.relname AS hit FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname ILIKE $1
     UNION ALL SELECT 'column ' || table_name || '.' || column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND column_name ILIKE $1
     UNION ALL SELECT 'constraint ' || conname FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE n.nspname = 'public' AND (conname ILIKE $1 OR pg_get_constraintdef(c.oid) ILIKE $1)
     UNION ALL SELECT 'function ' || p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND (p.proname ILIKE $1 OR p.prosrc ILIKE $1 OR pg_get_function_arguments(p.oid) ILIKE $1)
     UNION ALL SELECT 'policy ' || tablename || '.' || policyname FROM pg_policies
      WHERE schemaname = 'public' AND (policyname ILIKE $1 OR tablename ILIKE $1 OR qual ILIKE $1 OR with_check ILIKE $1)`,
    [like]
  );
  assert.deepEqual(rows.map((r) => r.hit), []);
});

Then('{string} has {int} policies and {string} has {int} policies', async function (t1: string, n1: number, t2: string, n2: number) {
  const db = await seedDb();
  for (const [table, n] of [[t1, n1], [t2, n2]] as const) {
    const { rows } = await db.query(`SELECT count(*)::int AS c FROM pg_policies WHERE schemaname = 'public' AND tablename = $1`, [table]);
    assert.equal(rows[0].c, n, `${table} policies`);
  }
});
