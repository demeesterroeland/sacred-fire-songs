import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import type { QueryResultRow } from 'pg';
import type { SongBddWorld } from '../support/world';
import { profileIdByEmail, queryAsAnon, queryAsUser, seedDb } from '../support/db';
import { OTHER_MEMBER_ID, SEEDED_EMAILS } from './access-policies.steps';

/**
 * Steps for docs/testing/songbook-data-model.feature (Story 6.2.1). Fixtures are
 * written by the scenario's superuser connection; access checks run as the real
 * database roles inside the scenario's rolled-back transaction.
 */

export interface SongbookBddState {
  catalogSongId: string;
  catalogVersionId: string;
  privateSongId: string;
  privateVersionId: string;
  legacySongId?: string;
  legacyVersionId?: string;
  variantVersionId?: string;
}

const UNIQUE_VIOLATION = '23505';
const CHECK_VIOLATION = '23514';
const PRIVATE_BOOK = 'bdd-private-book';

function state(world: SongBddWorld): SongbookBddState {
  assert.ok(world.songbook, 'Background did not create the songbook fixtures');
  return world.songbook;
}

async function accountId(account: string): Promise<string> {
  return account === 'other member' ? OTHER_MEMBER_ID : profileIdByEmail(SEEDED_EMAILS[account]);
}

/** Runs `sql` as a guest or as the named account, with row-level security applied. */
async function queryAs<T extends QueryResultRow>(account: string, sql: string, params: unknown[] = []): Promise<T[]> {
  if (account === 'guest') return queryAsAnon<T>(sql, params);
  return queryAsUser<T>(await accountId(account), sql, params);
}

/** A statement counts as allowed only when it returned a row and was not refused. */
async function isAllowed(run: () => Promise<unknown[]>): Promise<boolean> {
  try {
    return (await run()).length > 0;
  } catch (error) {
    if ((error as { code?: string }).code === '42501') return false;
    throw error;
  }
}

/** Runs `sql` in a savepoint so an expected constraint error does not abort the scenario. */
async function assertRejectedWith(code: string, sql: string, params: unknown[], message: string): Promise<void> {
  const db = await seedDb();
  await db.query('SAVEPOINT expect_error');
  try {
    await assert.rejects(db.query(sql, params), (error: { code?: string }) => error.code === code, message);
  } finally {
    await db.query('ROLLBACK TO SAVEPOINT expect_error');
  }
}

async function insertVersion(compositionId: string, fields: Record<string, unknown> = {}): Promise<string> {
  const db = await seedDb();
  const columns = ['composition_id', 'content_chordpro', ...Object.keys(fields)];
  const values = [compositionId, '[C]Sing', ...Object.values(fields)];
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO public.song_versions (${columns.join(', ')})
     VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`,
    values
  );
  return rows[0].id;
}

// ── Background ────────────────────────────────────────────────────────────────

Given(/^a songbook "([^"]+)" and a songbook "([^"]+)"$/, async function (first: string, second: string) {
  const db = await seedDb();
  for (const id of [first, second]) {
    await db.query(
      `INSERT INTO public.songbooks (id, title, short_name, compiler, community, year, languages, attribution)
       VALUES ($1, $2, $3, 'BDD Compiler', 'BDD Circle', 2001, ARRAY['en','es'], 'CC BY 4.0')`,
      [id, `Book ${id}`, id.toUpperCase()]
    );
  }
});

Given(
  /^a public catalog song "([^"]+)" with a version from "([^"]+)"$/,
  async function (this: SongBddWorld, slug: string, book: string) {
    const db = await seedDb();
    const { rows } = await db.query<{ id: string }>(
      `INSERT INTO public.compositions (title, original_author, is_public, catalog_slug, aliases, authors)
       VALUES ('BDD Catalog Song', 'Author A & Author B', true, $1, ARRAY['Alias One','Alias Two'],
               ARRAY['Author A','Author B'])
       RETURNING id`,
      [slug]
    );
    const versionId = await insertVersion(rows[0].id, { catalog_source_id: book, key: 'Am' });
    await db.query(
      `INSERT INTO public.song_version_sources (song_version_id, songbook_id, original_title, page, source_file, is_primary)
       VALUES ($1, $2, 'Original Title', '12', 'book-a/original-title.cho', true)`,
      [versionId, book]
    );
    await db.query(
      `INSERT INTO public.song_translations (composition_id, language, title, lyrics, translator)
       VALUES ($1, 'nl', 'Vertaalde Titel', 'Zing', 'BDD Translator')`,
      [rows[0].id]
    );
    this.songbook = {
      catalogSongId: rows[0].id,
      catalogVersionId: versionId,
      privateSongId: '',
      privateVersionId: '',
    };
  }
);

Given(
  'a private song of the other member with a version, a source and a translation',
  async function (this: SongBddWorld) {
    const db = await seedDb();
    await db.query(`INSERT INTO public.songbooks (id, title) VALUES ($1, 'BDD Private Book')`, [PRIVATE_BOOK]);
    const { rows } = await db.query<{ id: string }>(
      `INSERT INTO public.compositions (title, owner_id, is_public) VALUES ('BDD Private Song', $1, false) RETURNING id`,
      [OTHER_MEMBER_ID]
    );
    const versionId = await insertVersion(rows[0].id, { contributor_id: OTHER_MEMBER_ID });
    await db.query(
      `INSERT INTO public.song_version_sources (song_version_id, songbook_id, page) VALUES ($1, $2, '3')`,
      [versionId, PRIVATE_BOOK]
    );
    await db.query(
      `INSERT INTO public.song_translations (composition_id, language, title) VALUES ($1, 'de', 'Privat')`,
      [rows[0].id]
    );
    Object.assign(state(this), { privateSongId: rows[0].id, privateVersionId: versionId });
  }
);

// ── Additive migration ────────────────────────────────────────────────────────

Given(
  'a song created with only the columns that existed before the migration',
  async function (this: SongBddWorld) {
    const db = await seedDb();
    const { rows } = await db.query<{ id: string }>(
      `INSERT INTO public.compositions (title, original_author, is_public) VALUES ('BDD Legacy Song', 'Legacy Author', true)
       RETURNING id`
    );
    const { rows: versions } = await db.query<{ id: string }>(
      `INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, key, capo, tuning)
       VALUES ($1, 'Standard', '[G]Legacy', 'G', 2, 'Standard') RETURNING id`,
      [rows[0].id]
    );
    Object.assign(state(this), { legacySongId: rows[0].id, legacyVersionId: versions[0].id });
  }
);

Then('the song reads back with its original title, author and content', async function (this: SongBddWorld) {
  const { legacySongId } = state(this);
  const rows = await queryAsAnon<Record<string, unknown>>(
    `SELECT c.title, c.original_author, v.version_name, v.content_chordpro, v.key, v.capo, v.tuning
       FROM public.compositions c JOIN public.song_versions v ON v.composition_id = c.id
      WHERE c.id = $1`,
    [legacySongId]
  );
  assert.deepEqual(rows, [
    {
      title: 'BDD Legacy Song',
      original_author: 'Legacy Author',
      version_name: 'Standard',
      content_chordpro: '[G]Legacy',
      key: 'G',
      capo: 2,
      tuning: 'Standard',
    },
  ]);
});

Then(/^the version is an "original" version without catalog data$/, async function (this: SongBddWorld) {
  const db = await seedDb();
  const { rows } = await db.query(
    `SELECT version_kind, catalog_source_id, beats, song_note FROM public.song_versions WHERE id = $1`,
    [state(this).legacyVersionId]
  );
  assert.deepEqual(rows, [{ version_kind: 'original', catalog_source_id: null, beats: null, song_note: null }]);
});

Then('the song has no catalog slug, no aliases and no authors', async function (this: SongBddWorld) {
  const db = await seedDb();
  const { rows } = await db.query(`SELECT catalog_slug, aliases, authors FROM public.compositions WHERE id = $1`, [
    state(this).legacySongId,
  ]);
  assert.deepEqual(rows, [{ catalog_slug: null, aliases: [], authors: [] }]);
});

// ── Per-book musical data ─────────────────────────────────────────────────────

Given(
  /^a version with catalog_source_id "([^"]+)", capo (\d+), beats "([^"]+)" and a song note$/,
  async function (this: SongBddWorld, book: string, capo: string, beats: string) {
    const db = await seedDb();
    // The catalog song's first version already comes from this book; give it the variant's data.
    const { rows } = await db.query<{ id: string }>(
      `UPDATE public.song_versions SET capo = $3, beats = $4, song_note = 'Sing softly', version_kind = 'variant'
        WHERE composition_id = $1 AND catalog_source_id = $2 RETURNING id`,
      [state(this).catalogSongId, book, Number(capo), beats]
    );
    assert.equal(rows.length, 1);
    state(this).variantVersionId = rows[0].id;
  }
);

Then('the row is stored with those values and is unique per song and book', async function (this: SongBddWorld) {
  const s = state(this);
  const rows = await queryAsAnon(
    `SELECT catalog_source_id, capo, beats, song_note, key, version_kind FROM public.song_versions WHERE id = $1`,
    [s.variantVersionId]
  );
  assert.deepEqual(rows, [
    { catalog_source_id: 'songbook-a', capo: 5, beats: '8', song_note: 'Sing softly', key: 'Am', version_kind: 'variant' },
  ]);
  await assertRejectedWith(
    UNIQUE_VIOLATION,
    `INSERT INTO public.song_versions (composition_id, content_chordpro, catalog_source_id) VALUES ($1, 'x', 'songbook-a')`,
    [s.catalogSongId],
    'a second version of the same song from the same book'
  );
});

Then(
  /^a version of the same song from "([^"]+)" can be added as a "variant"$/,
  async function (this: SongBddWorld, book: string) {
    const id = await insertVersion(state(this).catalogSongId, { catalog_source_id: book, version_kind: 'variant', capo: 2 });
    assert.ok(id);
  }
);

Then(/^a version of kind "translation" can be added to the catalog song$/, async function (this: SongBddWorld) {
  assert.ok(await insertVersion(state(this).catalogSongId, { version_kind: 'translation', version_name: 'Nederlands' }));
});

Then(/^a version of kind "([^"]+)" is refused$/, async function (this: SongBddWorld, kind: string) {
  await assertRejectedWith(
    CHECK_VIOLATION,
    `INSERT INTO public.song_versions (composition_id, content_chordpro, version_kind) VALUES ($1, 'x', $2)`,
    [state(this).catalogSongId, kind],
    `version kind ${kind}`
  );
});

Then(/^a second song with catalog slug "([^"]+)" is refused$/, async function (slug: string) {
  await assertRejectedWith(
    UNIQUE_VIOLATION,
    `INSERT INTO public.compositions (title, catalog_slug) VALUES ('Duplicate', $1)`,
    [slug],
    'duplicate catalog slug'
  );
});

Then('songs without a catalog slug can be added side by side', async function () {
  const db = await seedDb();
  const { rows } = await db.query(
    `INSERT INTO public.compositions (title) VALUES ('No slug one'), ('No slug two') RETURNING catalog_slug`
  );
  assert.deepEqual(rows, [{ catalog_slug: null }, { catalog_slug: null }]);
});

Then(
  /^the catalog song lists the (aliases|authors) "([^"]+)" and "([^"]+)"$/,
  async function (this: SongBddWorld, column: string, first: string, second: string) {
    const rows = await queryAsAnon<Record<string, string[]>>(`SELECT ${column} FROM public.compositions WHERE id = $1`, [
      state(this).catalogSongId,
    ]);
    assert.deepEqual(rows[0][column], [first, second]);
  }
);

// ── Version sources ───────────────────────────────────────────────────────────

Then(
  /^the catalog version is printed in "([^"]+)" on page "([^"]+)" as "([^"]+)"$/,
  async function (this: SongBddWorld, book: string, page: string, title: string) {
    const rows = await queryAsAnon(
      `SELECT s.songbook_id, s.page, s.original_title, s.is_primary, b.title AS book_title
         FROM public.song_version_sources s JOIN public.songbooks b ON b.id = s.songbook_id
        WHERE s.song_version_id = $1`,
      [state(this).catalogVersionId]
    );
    assert.deepEqual(rows, [
      { songbook_id: book, page, original_title: title, is_primary: true, book_title: `Book ${book}` },
    ]);
  }
);

Then('a second primary source for the catalog version is refused', async function (this: SongBddWorld) {
  await assertRejectedWith(
    UNIQUE_VIOLATION,
    `INSERT INTO public.song_version_sources (song_version_id, songbook_id, is_primary) VALUES ($1, 'songbook-b', true)`,
    [state(this).catalogVersionId],
    'second primary source'
  );
});

Then(/^a second source of the catalog version in "([^"]+)" is refused$/, async function (this: SongBddWorld, book: string) {
  await assertRejectedWith(
    UNIQUE_VIOLATION,
    `INSERT INTO public.song_version_sources (song_version_id, songbook_id, page) VALUES ($1, $2, '99')`,
    [state(this).catalogVersionId, book],
    'second source in the same book'
  );
});

When('the catalog version is deleted', async function (this: SongBddWorld) {
  const db = await seedDb();
  await db.query('DELETE FROM public.song_versions WHERE id = $1', [state(this).catalogVersionId]);
});

Then('no source of the catalog version remains', async function (this: SongBddWorld) {
  const db = await seedDb();
  const { rows } = await db.query('SELECT 1 FROM public.song_version_sources WHERE song_version_id = $1', [
    state(this).catalogVersionId,
  ]);
  assert.deepEqual(rows, []);
});

// ── Translations ──────────────────────────────────────────────────────────────

Given('a Dutch translation of the catalog song', async function (this: SongBddWorld) {
  const db = await seedDb();
  const { rows } = await db.query(`SELECT language FROM public.song_translations WHERE composition_id = $1`, [
    state(this).catalogSongId,
  ]);
  assert.deepEqual(rows, [{ language: 'nl' }]);
});

Then('a second Dutch translation of the catalog song is refused', async function (this: SongBddWorld) {
  await assertRejectedWith(
    UNIQUE_VIOLATION,
    `INSERT INTO public.song_translations (composition_id, language, title) VALUES ($1, 'nl', 'Nog een')`,
    [state(this).catalogSongId],
    'second Dutch translation'
  );
});

Then('an English translation of the catalog song can be added', async function (this: SongBddWorld) {
  const db = await seedDb();
  const { rows } = await db.query(
    `INSERT INTO public.song_translations (composition_id, language, title, lyrics) VALUES ($1, 'en', 'Title', 'Sing')
     RETURNING language`,
    [state(this).catalogSongId]
  );
  assert.deepEqual(rows, [{ language: 'en' }]);
});

Then(/^a translation with language "([^"]+)" is refused$/, async function (this: SongBddWorld, language: string) {
  await assertRejectedWith(
    CHECK_VIOLATION,
    `INSERT INTO public.song_translations (composition_id, language) VALUES ($1, $2)`,
    [state(this).catalogSongId, language],
    `language ${language}`
  );
});

// ── Access ────────────────────────────────────────────────────────────────────

Then(
  /^a (guest|member|admin) can read the songbook, the source and the translation of the catalog song$/,
  async function (this: SongBddWorld, account: string) {
    const s = state(this);
    const books = await queryAs(account, `SELECT id FROM public.songbooks WHERE id = 'songbook-a'`);
    const sources = await queryAs(account, `SELECT id FROM public.song_version_sources WHERE song_version_id = $1`, [
      s.catalogVersionId,
    ]);
    const translations = await queryAs(account, `SELECT id FROM public.song_translations WHERE composition_id = $1`, [
      s.catalogSongId,
    ]);
    assert.equal(books.length, 1, `${account} reading the songbook`);
    assert.equal(sources.length, 1, `${account} reading the source`);
    assert.equal(translations.length, 1, `${account} reading the translation`);
  }
);

Then(
  /^a (guest|member|other member|admin) (can|cannot) read the source and the translation of the private song$/,
  async function (this: SongBddWorld, account: string, result: string) {
    const s = state(this);
    const sources = await queryAs(account, `SELECT id FROM public.song_version_sources WHERE song_version_id = $1`, [
      s.privateVersionId,
    ]);
    const translations = await queryAs(account, `SELECT id FROM public.song_translations WHERE composition_id = $1`, [
      s.privateSongId,
    ]);
    const expected = result === 'can' ? 1 : 0;
    assert.equal(sources.length, expected, `${account} reading the private source`);
    assert.equal(translations.length, expected, `${account} reading the private translation`);
  }
);

Then(
  /^a (guest|member|other member|admin) (can|cannot) read the songbook only cited by the private song$/,
  async function (account: string, result: string) {
    const books = await queryAs(account, `SELECT id FROM public.songbooks WHERE id = $1`, [PRIVATE_BOOK]);
    assert.equal(books.length, result === 'can' ? 1 : 0, `${account} reading the private songbook`);
  }
);

Then(/^a (guest|member|admin) (can|cannot) add a songbook$/, async function (account: string, result: string) {
  const allowed = await isAllowed(() =>
    queryAs(account, `INSERT INTO public.songbooks (id, title) VALUES ('bdd-new-book', 'New') RETURNING id`)
  );
  assert.equal(allowed, result === 'can', `${account} adding a songbook`);
});

Then(
  /^a (guest|member|admin) (can|cannot) add a source to the catalog version$/,
  async function (this: SongBddWorld, account: string, result: string) {
    const allowed = await isAllowed(() =>
      queryAs(
        account,
        `INSERT INTO public.song_version_sources (song_version_id, songbook_id, page) VALUES ($1, 'songbook-b', '7')
         RETURNING id`,
        [state(this).catalogVersionId]
      )
    );
    assert.equal(allowed, result === 'can', `${account} adding a source`);
  }
);

Then(
  /^a (guest|member|admin) (can|cannot) add a translation to the catalog song$/,
  async function (this: SongBddWorld, account: string, result: string) {
    const allowed = await isAllowed(() =>
      queryAs(
        account,
        `INSERT INTO public.song_translations (composition_id, language, title) VALUES ($1, 'fr', 'Titre') RETURNING id`,
        [state(this).catalogSongId]
      )
    );
    assert.equal(allowed, result === 'can', `${account} adding a translation`);
  }
);
