import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import type { QueryResultRow } from 'pg';
import type { SongBddWorld } from '../support/world';
import { profileIdByEmail, seedDb } from '../support/db';
import {
  catalogVersionKey,
  formatSkippedReport,
  planCatalogImport,
  type CatalogEditMarker,
  type CatalogImportPlan,
} from '../../../lib/catalog/importContract';
import {
  buildCatalogEditsFile,
  catalogEditsFileName,
  parseCatalogEditsExport,
  type CatalogEditsExport,
  type CatalogEditsFile,
} from '../../../lib/catalog/catalogEdits';

/**
 * Steps for docs/testing/ux-v3-protect-app-edits.feature (Story 6.2.21, #524).
 *
 * @seed steps write as the real database roles inside the scenario's rolled-back transaction.
 * Unlike queryAsUser (support/db.ts), `writeAs` keeps the write: it releases its savepoint and
 * only resets the role and the JWT claims afterwards, so later steps see the result. The JWT role
 * is what the trigger reads (auth.role()); the database role is what row-level security reads.
 */

interface IncomingVersion {
  slug: string;
  source: string;
  content: string;
}

export interface ProtectEditsBddState {
  songId?: string;
  versionId?: string;
  ownVersionId?: string;
  newVersionId?: string;
  exported?: CatalogEditsExport;
  plan?: CatalogImportPlan<IncomingVersion>;
  report?: string;
  existing?: Map<string, CatalogEditMarker>;
  file?: { name: string; body: string };
}

const ACCOUNT_EMAILS: Record<string, string> = {
  member: 'roel.de.meester+member@gmail.com',
  expert: 'roel.de.meester+expert@gmail.com',
  gatekeeper: 'roel.de.meester+gatekeeper@gmail.com',
  admin: 'roel.de.meester+admin@gmail.com',
};

const CORRECTED_LYRICS = '[G]Corrected in the app';
const IMPORTED_LYRICS = '[C]As printed';

function state(world: SongBddWorld): ProtectEditsBddState {
  world.protectEdits ??= {};
  return world.protectEdits;
}

function need<T>(value: T | undefined, what: string): T {
  assert.ok(value !== undefined, `${what} was not set up by an earlier step`);
  return value;
}

type Writer = { claims: 'authenticated' | 'service_role' | 'anon' | null; role: string | null; userId?: string };

async function writerFor(account: string): Promise<Writer> {
  if (account === 'guest') return { claims: 'anon', role: 'anon' };
  if (account === 'importer') return { claims: 'service_role', role: 'service_role' };
  const email = ACCOUNT_EMAILS[account];
  assert.ok(email, `Unknown account ${account}`);
  return { claims: 'authenticated', role: 'authenticated', userId: await profileIdByEmail(email) };
}

/** Runs `sql` as `account` and keeps its effect for the rest of the scenario. */
async function writeAs<T extends QueryResultRow>(account: string, sql: string, params: unknown[] = []): Promise<T[]> {
  const writer = await writerFor(account);
  const db = await seedDb();
  await db.query('SAVEPOINT protect_write');
  try {
    if (writer.claims) {
      await db.query(`SELECT set_config('request.jwt.claims', $1, true)`, [
        JSON.stringify({ sub: writer.userId, role: writer.claims }),
      ]);
    }
    if (writer.role) await db.query(`SET LOCAL ROLE ${writer.role}`);
    const { rows } = await db.query<T>(sql, params);
    await db.query('RESET ROLE');
    await db.query(`SELECT set_config('request.jwt.claims', '', true)`);
    await db.query('RELEASE SAVEPOINT protect_write');
    return rows;
  } catch (error) {
    await db.query('ROLLBACK TO SAVEPOINT protect_write');
    await db.query('RELEASE SAVEPOINT protect_write');
    throw error;
  }
}

async function marker(table: 'compositions' | 'song_versions', id: string) {
  const db = await seedDb();
  const { rows } = await db.query<CatalogEditMarker & { is_now: boolean }>(
    `SELECT edited_in_app, edited_at, edited_fields, edited_at = now() AS is_now FROM public.${table} WHERE id = $1`,
    [id]
  );
  assert.equal(rows.length, 1, `No ${table} row ${id}`);
  return rows[0];
}

const fieldList = (list: string) => list.split(',').map((f) => f.trim());

// ── Fixtures ──────────────────────────────────────────────────────────────────

async function createCatalogSong(world: SongBddWorld, slug: string, source: string): Promise<void> {
  const db = await seedDb();
  const memberId = await profileIdByEmail(ACCOUNT_EMAILS.member);
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO public.compositions (title, original_author, is_public, owner_id, catalog_slug, aliases, authors)
     VALUES ('BDD Protect Song', 'Author A', true, $1, $2, ARRAY['Alias One'], ARRAY['Author A'])
     RETURNING id`,
    [memberId, slug]
  );
  const { rows: versions } = await db.query<{ id: string }>(
    `INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, key, capo, tuning,
                                       contributor_id, catalog_source_id, beats, song_note)
     VALUES ($1, 'Book A', $2, 'C', 0, 'Standard', $3, $4, '4', 'A note') RETURNING id`,
    [rows[0].id, IMPORTED_LYRICS, memberId, source]
  );
  Object.assign(state(world), { songId: rows[0].id, versionId: versions[0].id });
}

Given(
  /^a public catalog song "([^"]+)" with version "([^"]+)" owned by the member$/,
  async function (this: SongBddWorld, slug: string, source: string) {
    await createCatalogSong(this, slug, source);
  }
);

Given('a catalog version corrected in the app', async function (this: SongBddWorld) {
  await createCatalogSong(this, 'bdd-protect-song', 'songbook-a');
  await writeAs('member', `UPDATE public.song_versions SET content_chordpro = $2 WHERE id = $1`, [
    state(this).versionId,
    CORRECTED_LYRICS,
  ]);
});

Given('the member added a version of their own without a catalog key', async function (this: SongBddWorld) {
  const memberId = await profileIdByEmail(ACCOUNT_EMAILS.member);
  const rows = await writeAs<{ id: string }>(
    'member',
    `INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id, version_kind)
     VALUES ($1, 'My own', '[D]Mine', $2, 'variant') RETURNING id`,
    [state(this).songId, memberId]
  );
  state(this).ownVersionId = rows[0].id;
});

// ── App edits ─────────────────────────────────────────────────────────────────

When('the member changes the lyrics, key and capo of the catalog version in the app', async function (this: SongBddWorld) {
  await writeAs('member', `UPDATE public.song_versions SET content_chordpro = $2, key = 'G', capo = 2 WHERE id = $1`, [
    state(this).versionId,
    CORRECTED_LYRICS,
  ]);
});

When(
  'the member changes the beats, song note, tuning and YouTube link of the catalog version in the app',
  async function (this: SongBddWorld) {
    await writeAs(
      'member',
      `UPDATE public.song_versions
          SET beats = '3', song_note = 'A corrected note', tuning = 'DADGAD', youtube_url = 'https://youtu.be/abc'
        WHERE id = $1`,
      [state(this).versionId]
    );
  }
);

When('the member saves the catalog version in the app without changing it', async function (this: SongBddWorld) {
  await writeAs(
    'member',
    `UPDATE public.song_versions
        SET content_chordpro = content_chordpro, key = key, capo = capo, beats = beats, song_note = song_note
      WHERE id = $1`,
    [state(this).versionId]
  );
});

When('the member changes the lyrics of their own version in the app', async function (this: SongBddWorld) {
  await writeAs('member', `UPDATE public.song_versions SET content_chordpro = '[E]Changed' WHERE id = $1`, [
    need(state(this).ownVersionId, 'own version'),
  ]);
});

When(
  'the importer updates the lyrics of the catalog version and the song title as service_role',
  async function (this: SongBddWorld) {
    await writeAs('importer', `UPDATE public.song_versions SET content_chordpro = '[A]Reprinted' WHERE id = $1`, [
      state(this).versionId,
    ]);
    await writeAs('importer', `UPDATE public.compositions SET title = 'BDD Reprinted Title' WHERE id = $1`, [
      state(this).songId,
    ]);
  }
);

When(
  'a data migration without a signed-in user changes the lyrics of the catalog version',
  async function (this: SongBddWorld) {
    const db = await seedDb();
    await db.query(`UPDATE public.song_versions SET content_chordpro = '[B]Migrated' WHERE id = $1`, [
      state(this).versionId,
    ]);
  }
);

When(/^the admin changes the title, aliases and authors of the catalog song in the app$/, async function (this: SongBddWorld) {
  await writeAs(
    'admin',
    `UPDATE public.compositions
        SET title = 'BDD Protect Song (corrected)', aliases = ARRAY['Alias One','Alias Two'],
            authors = ARRAY['Author A','Author B']
      WHERE id = $1`,
    [state(this).songId]
  );
});

When("the member's app recomputes the chord and melody flags of the catalog song", async function (this: SongBddWorld) {
  await writeAs('member', `UPDATE public.compositions SET has_chords = true, has_melody = true WHERE id = $1`, [
    state(this).songId,
  ]);
});

When(
  'a security definer function moves the catalog version to another song for the admin',
  async function (this: SongBddWorld) {
    const db = await seedDb();
    const { rows } = await db.query<{ id: string }>(
      `INSERT INTO public.compositions (title, is_public) VALUES ('BDD Target Song', true) RETURNING id`
    );
    // Stands in for a function like fn_link_song_as_version: runs as its owner, for a signed-in user.
    await db.query(
      `CREATE FUNCTION public.bdd_move_version(p_version uuid, p_target uuid) RETURNS void
       LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
         UPDATE public.song_versions SET composition_id = p_target, version_kind = 'variant' WHERE id = p_version
       $$`
    );
    await db.query(`GRANT EXECUTE ON FUNCTION public.bdd_move_version(uuid, uuid) TO authenticated`);
    await writeAs('admin', `SELECT public.bdd_move_version($1, $2)`, [state(this).versionId, rows[0].id]);
  }
);

// ── Tampering ─────────────────────────────────────────────────────────────────

/** Runs a write that the database may refuse (42501); either way it must not change the marker. */
async function tryWrite(account: string, sql: string, params: unknown[]): Promise<void> {
  try {
    await writeAs(account, sql, params);
  } catch (error) {
    assert.equal((error as { code?: string }).code, '42501', String(error));
  }
}

When('the member tries to clear the edit marker of the catalog version', async function (this: SongBddWorld) {
  await tryWrite(
    'member',
    `UPDATE public.song_versions SET edited_in_app = false, edited_at = NULL, edited_fields = '{}' WHERE id = $1`,
    [state(this).versionId]
  );
});

When('the member tries to clear the edit marker of the catalog song', async function (this: SongBddWorld) {
  await tryWrite(
    'member',
    `UPDATE public.compositions SET edited_in_app = false, edited_at = NULL, edited_fields = '{}' WHERE id = $1`,
    [state(this).songId]
  );
});

When('the member adds a version that claims to be edited in the app', async function (this: SongBddWorld) {
  const memberId = await profileIdByEmail(ACCOUNT_EMAILS.member);
  const rows = await writeAs<{ id: string }>(
    'member',
    `INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id, version_kind,
                                       edited_in_app, edited_at, edited_fields)
     VALUES ($1, 'Claimed', '[F]Claimed', $2, 'variant', true, now(), ARRAY['content_chordpro']) RETURNING id`,
    [state(this).songId, memberId]
  );
  state(this).newVersionId = rows[0].id;
});

// ── Markers ───────────────────────────────────────────────────────────────────

Then('the catalog version is marked as edited in the app now', async function (this: SongBddWorld) {
  const row = await marker('song_versions', need(state(this).versionId, 'catalog version'));
  assert.equal(row.edited_in_app, true);
  assert.equal(row.is_now, true, 'edited_at is the time of the edit');
});

Then('the catalog song is marked as edited in the app now', async function (this: SongBddWorld) {
  const row = await marker('compositions', need(state(this).songId, 'catalog song'));
  assert.equal(row.edited_in_app, true);
  assert.equal(row.is_now, true, 'edited_at is the time of the edit');
});

Then(/^its edited fields are "([^"]+)"$/, async function (this: SongBddWorld, list: string) {
  const row = await marker('song_versions', need(state(this).versionId, 'catalog version'));
  assert.deepEqual(row.edited_fields, fieldList(list));
});

Then(/^its song edited fields are "([^"]+)"$/, async function (this: SongBddWorld, list: string) {
  const row = await marker('compositions', need(state(this).songId, 'catalog song'));
  assert.deepEqual(row.edited_fields, fieldList(list));
});

const assertUnmarked = (row: CatalogEditMarker) =>
  assert.deepEqual(
    { edited_in_app: row.edited_in_app, edited_at: row.edited_at, edited_fields: row.edited_fields },
    { edited_in_app: false, edited_at: null, edited_fields: [] }
  );

Then('the catalog version is not marked as edited', async function (this: SongBddWorld) {
  assertUnmarked(await marker('song_versions', need(state(this).versionId, 'catalog version')));
});

Then('the catalog song is not marked as edited', async function (this: SongBddWorld) {
  assertUnmarked(await marker('compositions', need(state(this).songId, 'catalog song')));
});

Then('their own version is not marked as edited', async function (this: SongBddWorld) {
  assertUnmarked(await marker('song_versions', need(state(this).ownVersionId, 'own version')));
});

Then('the new version is not marked as edited', async function (this: SongBddWorld) {
  assertUnmarked(await marker('song_versions', need(state(this).newVersionId, 'new version')));
});

Then('the catalog version is still marked as edited', async function (this: SongBddWorld) {
  const row = await marker('song_versions', need(state(this).versionId, 'catalog version'));
  assert.equal(row.edited_in_app, true);
  assert.deepEqual(row.edited_fields, ['content_chordpro']);
});

Then('the catalog song is still marked as edited', async function (this: SongBddWorld) {
  const row = await marker('compositions', need(state(this).songId, 'catalog song'));
  assert.equal(row.edited_in_app, true);
  assert.deepEqual(row.edited_fields, ['aliases', 'authors', 'title']);
});

// ── Importer contract ─────────────────────────────────────────────────────────

/** Reads the markers of every version of the given songs, keyed like the contract helper. */
async function readMarkers(account: string, slugs: string[]): Promise<Map<string, CatalogEditMarker>> {
  const rows = await writeAs<CatalogEditMarker & { catalog_slug: string; catalog_source_id: string }>(
    account,
    `SELECT c.catalog_slug, v.catalog_source_id, v.edited_in_app, v.edited_at::text AS edited_at, v.edited_fields
       FROM public.song_versions v JOIN public.compositions c ON c.id = v.composition_id
      WHERE c.catalog_slug = ANY($1) AND v.catalog_source_id IS NOT NULL`,
    [slugs]
  );
  return new Map(rows.map((r) => [catalogVersionKey(r.catalog_slug, r.catalog_source_id), r]));
}

When('an importer that follows the contract runs again', async function (this: SongBddWorld) {
  const incoming: IncomingVersion[] = [
    { slug: 'bdd-protect-song', source: 'songbook-a', content: IMPORTED_LYRICS },
    { slug: 'bdd-protect-song', source: 'songbook-b', content: '[Am]From book B' },
  ];
  const existing = await readMarkers('importer', ['bdd-protect-song']);
  const plan = planCatalogImport(incoming, existing, (row) => catalogVersionKey(row.slug, row.source));
  for (const row of plan.write) {
    await writeAs(
      'importer',
      `INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, catalog_source_id, version_kind)
       SELECT c.id, $2, $3, $2, 'variant' FROM public.compositions c WHERE c.catalog_slug = $1
       ON CONFLICT (composition_id, catalog_source_id) DO UPDATE SET content_chordpro = EXCLUDED.content_chordpro`,
      [row.slug, row.source, row.content]
    );
  }
  Object.assign(state(this), { plan, report: formatSkippedReport(plan.skipped) });
});

Then('the correction stays and is reported as skipped', async function (this: SongBddWorld) {
  const { versionId, plan, report, songId } = state(this);
  const db = await seedDb();
  const { rows } = await db.query<{ content_chordpro: string; edited_in_app: boolean }>(
    `SELECT content_chordpro, edited_in_app FROM public.song_versions WHERE id = $1`,
    [versionId]
  );
  assert.deepEqual(rows[0], { content_chordpro: CORRECTED_LYRICS, edited_in_app: true });
  assert.deepEqual(
    need(plan, 'import plan').skipped.map((s) => [s.key, s.editedFields]),
    [['bdd-protect-song/songbook-a', ['content_chordpro']]]
  );
  assert.match(need(report, 'report'), /bdd-protect-song\/songbook-a \(edited .*: content_chordpro\)/);
  // The unedited row was still imported, and the importer's write did not mark it.
  const { rows: written } = await db.query<{ content_chordpro: string; edited_in_app: boolean }>(
    `SELECT content_chordpro, edited_in_app FROM public.song_versions WHERE composition_id = $1 AND catalog_source_id = 'songbook-b'`,
    [songId]
  );
  assert.deepEqual(written, [{ content_chordpro: '[Am]From book B', edited_in_app: false }]);
});

// ── Export and clearing ───────────────────────────────────────────────────────

async function exportAs(account: string): Promise<CatalogEditsExport> {
  const rows = await writeAs<{ data: unknown }>(account, `SELECT public.fn_catalog_edits_export() AS data`);
  return parseCatalogEditsExport(rows[0].data);
}

When('the admin exports the catalog edits', async function (this: SongBddWorld) {
  state(this).exported = await exportAs('admin');
});

Then(
  /^the export lists song "([^"]+)" with its new title, aliases and authors$/,
  function (this: SongBddWorld, slug: string) {
    const song = need(state(this).exported, 'export').songs.find((s) => s.song_id === state(this).songId);
    assert.ok(song, 'the corrected song is listed');
    assert.equal(song.catalog_slug, slug);
    assert.deepEqual(song.edited_fields, ['aliases', 'authors', 'title']);
    assert.deepEqual(song.values, {
      title: 'BDD Protect Song (corrected)',
      aliases: ['Alias One', 'Alias Two'],
      authors: ['Author A', 'Author B'],
    });
    assert.ok(song.edited_at);
  }
);

Then(
  /^the export lists version "([^"]+)" of "([^"]+)" with its new lyrics, key and capo$/,
  function (this: SongBddWorld, source: string, slug: string) {
    const version = need(state(this).exported, 'export').versions.find((v) => v.version_id === state(this).versionId);
    assert.ok(version, 'the corrected version is listed');
    assert.equal(version.catalog_slug, slug);
    assert.equal(version.catalog_source_id, source);
    assert.deepEqual(version.edited_fields, ['capo', 'content_chordpro', 'key']);
    assert.deepEqual(version.values, { capo: 2, content_chordpro: CORRECTED_LYRICS, key: 'G' });
  }
);

Then('the export lists no unedited rows', async function (this: SongBddWorld) {
  const exported = need(state(this).exported, 'export');
  const db = await seedDb();
  const versionIds = exported.versions.map((v) => v.version_id);
  const songIds = exported.songs.map((s) => s.song_id);
  const { rows } = await db.query<{ n: number }>(
    `SELECT (SELECT count(*) FROM public.song_versions WHERE id = ANY($1) AND NOT edited_in_app)
          + (SELECT count(*) FROM public.compositions WHERE id = ANY($2) AND NOT edited_in_app) AS n`,
    [versionIds, songIds]
  );
  assert.equal(Number(rows[0].n), 0);
});

Then(/^the (guest|member|expert|gatekeeper) cannot export the catalog edits$/, async function (account: string) {
  await assert.rejects(
    exportAs(account),
    (error: { code?: string }) => error.code === '42501',
    `${account} must not read the export`
  );
});

When('the admin marks the catalog version as taken over', async function (this: SongBddWorld) {
  const rows = await writeAs<{ cleared: boolean }>('admin', `SELECT public.fn_clear_catalog_edit('version', $1) AS cleared`, [
    state(this).versionId,
  ]);
  assert.equal(rows[0].cleared, true);
});

Then('the admin export no longer lists it', async function (this: SongBddWorld) {
  const exported = await exportAs('admin');
  assert.equal(exported.versions.some((v) => v.version_id === state(this).versionId), false);
});

Then('the member cannot mark the catalog version as taken over', async function (this: SongBddWorld) {
  await assert.rejects(
    writeAs('member', `SELECT public.fn_clear_catalog_edit('version', $1)`, [state(this).versionId]),
    (error: { code?: string }) => error.code === '42501'
  );
});

// ── @unit: the contract and the file, without a database ──────────────────────

Given(
  /^the catalog holds version "([^"]+)" of "([^"]+)" corrected in the app$/,
  function (this: SongBddWorld, source: string, slug: string) {
    const s = state(this);
    s.existing ??= new Map();
    s.existing.set(catalogVersionKey(slug, source), {
      edited_in_app: true,
      edited_at: '2026-11-12T10:00:00+00:00',
      edited_fields: ['content_chordpro', 'key'],
    });
  }
);

Given(
  /^the catalog holds version "([^"]+)" of "([^"]+)" that nobody edited$/,
  function (this: SongBddWorld, source: string, slug: string) {
    const s = state(this);
    s.existing ??= new Map();
    s.existing.set(catalogVersionKey(slug, source), { edited_in_app: false, edited_at: null, edited_fields: [] });
  }
);

When('an importer plans to write both versions again', function (this: SongBddWorld) {
  const s = state(this);
  const incoming: IncomingVersion[] = [...need(s.existing, 'catalog').keys()].map((key) => {
    const [slug, source] = key.split('/');
    return { slug, source, content: IMPORTED_LYRICS };
  });
  s.plan = planCatalogImport(incoming, need(s.existing, 'catalog'), (row) => catalogVersionKey(row.slug, row.source));
  s.report = formatSkippedReport(s.plan.skipped);
});

Then(/^it writes version "([^"]+)" of "([^"]+)"$/, function (this: SongBddWorld, source: string, slug: string) {
  assert.deepEqual(
    need(state(this).plan, 'plan').write.map((r) => catalogVersionKey(r.slug, r.source)),
    [catalogVersionKey(slug, source)]
  );
});

Then(
  /^it skips version "([^"]+)" of "([^"]+)" and reports its edited fields$/,
  function (this: SongBddWorld, source: string, slug: string) {
    const key = catalogVersionKey(slug, source);
    assert.deepEqual(need(state(this).plan, 'plan').skipped.map((r) => r.key), [key]);
    assert.ok(need(state(this).report, 'report').includes(`${key} (edited 2026-11-12T10:00:00+00:00: content_chordpro, key)`));
  }
);

Given(
  /^an export with a corrected song "([^"]+)" and a corrected version "([^"]+)" of "([^"]+)"$/,
  function (this: SongBddWorld, slug: string, source: string, versionSlug: string) {
    state(this).exported = {
      songs: [
        {
          song_id: 's1',
          catalog_slug: slug,
          title: 'Corrected',
          edited_at: '2026-11-12T10:00:00+00:00',
          edited_fields: ['title'],
          values: { title: 'Corrected' },
        },
      ],
      versions: [
        {
          song_id: 's1',
          version_id: 'v1',
          catalog_slug: versionSlug,
          catalog_source_id: source,
          title: 'Corrected',
          version_name: 'Book A',
          edited_at: '2026-11-12T11:00:00+00:00',
          edited_fields: ['key'],
          values: { key: 'G' },
        },
      ],
    };
  }
);

When('the admin downloads it', function (this: SongBddWorld) {
  const exportedAt = new Date('2026-11-12T12:00:00Z');
  const s = state(this);
  s.file = {
    name: catalogEditsFileName(exportedAt),
    body: JSON.stringify(buildCatalogEditsFile(need(s.exported, 'export'), exportedAt), null, 2),
  };
});

Then(/^the file is JSON named "([^"]+)"$/, function (this: SongBddWorld, name: string) {
  assert.equal(need(state(this).file, 'file').name, name);
});

Then(
  /^it holds the song "([^"]+)" and the version "([^"]+)" of "([^"]+)" with their changed values$/,
  function (this: SongBddWorld, slug: string, source: string, versionSlug: string) {
    const file = JSON.parse(need(state(this).file, 'file').body) as CatalogEditsFile;
    assert.equal(file.format, 'sacred-fire-songs/catalog-edits');
    assert.deepEqual(file.songs.map((s) => [s.catalog_slug, s.values]), [[slug, { title: 'Corrected' }]]);
    assert.deepEqual(
      file.versions.map((v) => [v.catalog_slug, v.catalog_source_id, v.values]),
      [[versionSlug, source, { key: 'G' }]]
    );
  }
);
