// Story 6.1.33 / G9.1 (#417) — docs/testing/ux-v2-data-hygiene.feature
import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { isTestFixtureTitle } from '../../../lib/seed/dataHygiene';
import { seedDb } from '../support/db';

Given('the local seed is applied', async function () {
  const db = await seedDb();
  const { rows } = await db.query<{ n: number }>('SELECT count(*)::int AS n FROM public.setlists');
  assert.ok(rows[0].n > 0, 'the seed inserts playlists');
});

Then('no playlist title contains {string} or {string}', async function (a: string, b: string) {
  const db = await seedDb();
  const { rows } = await db.query<{ title: string }>(
    'SELECT title FROM public.setlists WHERE title ILIKE $1 OR title ILIKE $2',
    [`%${a}%`, `%${b}%`],
  );
  const offending = rows.map((r) => r.title).filter(isTestFixtureTitle);
  assert.deepEqual(offending, [], 'playlists left behind by tests');
});
