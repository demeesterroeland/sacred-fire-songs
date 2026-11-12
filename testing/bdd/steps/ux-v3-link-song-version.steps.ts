// Story 6.2.9 / G1.4 (#512) — docs/testing/ux-v3-link-song-version.feature
//
// @seed steps call fn_link_song_as_version / fn_preview_song_link as the real database roles
// (authenticated with auth.uid()) inside the scenario's rolled-back transaction (support/db.ts),
// so every row a scenario creates is gone afterwards.
import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import { profileIdByEmail, queryAsUser, seedDb } from '../support/db';
import { DICTIONARIES, translateFrom } from '../../../lib/i18n';
import { firstVersion } from '../../../lib/songs/versionOrder';
import { canLinkSongs, linkPreviewLines, songRedirectHref, type SongLinkSummary } from '../../../lib/songs/linkSong';
import { OTHER_MEMBER_ID, SEEDED_EMAILS } from './access-policies.steps';

interface LinkWorld {
  role?: string;
  redirects: Record<string, string>;
  continuedAt?: string;
  summary?: SongLinkSummary;
  first?: string;
  second?: string;
  third?: string;
  firstVersion?: string;
  secondVersion?: string;
  recordingId?: string;
  playlistItemId?: string;
  memberId?: string;
  favouritesId?: string;
  outcome?: { ok: true; data: unknown } | { ok: false; code?: string; message?: string };
}

const worlds = new WeakMap<object, LinkWorld>();
function w(world: object): LinkWorld {
  let s = worlds.get(world);
  if (!s) {
    s = { redirects: {} };
    worlds.set(world, s);
  }
  return s;
}

const t = (key: string, params?: Record<string, string | number>) =>
  translateFrom(DICTIONARIES.en, DICTIONARIES.en, key, params);

// ── @unit ───────────────────────────────────────────────────────────────────

Given('a signed-in {string}', function (role: string) {
  w(this).role = role === 'guest' ? undefined : role;
});

Then(/^the link action is (shown|not shown) in the song menu$/, function (shown: string) {
  assert.equal(canLinkSongs(w(this).role), shown === 'shown');
});

Given('the song {string} was linked into {string}', function (oldId: string, newId: string) {
  w(this).redirects[oldId] = newId;
});

When('{string} is opened', function (url: string) {
  const s = w(this);
  const parsed = new URL(url, 'http://localhost');
  const oldId = parsed.pathname.split('/').pop() ?? '';
  s.continuedAt = songRedirectHref(s.redirects[oldId], parsed.search);
});

Then('it continues at {string}', function (url: string) {
  assert.equal(w(this).continuedAt, url);
});

Given(
  'a preview with {int} versions, {int} recordings, {int} playlist entry and {int} member who favourited both songs',
  function (versions: number, recordings: number, playlistItems: number, merged: number) {
    w(this).summary = {
      source_id: 's',
      source_title: 'B',
      target_id: 't',
      target_title: 'A',
      versions,
      recordings,
      playlist_items: playlistItems,
      favourites: 0,
      favourites_merged: merged,
      categories_added: 0,
      aliases_added: [],
      catalog_slug: 'none',
      catalog_keys_cleared: 0,
      translations: 0,
    };
  }
);

Then(
  'the preview lists {string}, {string}, {string} and {string}',
  function (a: string, b: string, c: string, d: string) {
    const text = linkPreviewLines(w(this).summary!).map((l) => t(l.key, l.params));
    assert.deepEqual(text, [a, b, c, d]);
  }
);

Then('items with nothing to move are left out', function () {
  assert.equal(linkPreviewLines(w(this).summary!).length, 4);
});

// ── @seed helpers ───────────────────────────────────────────────────────────

async function insertSong(title: string, fields: Record<string, unknown> = {}): Promise<string> {
  const db = await seedDb();
  const columns = ['title', 'is_public', ...Object.keys(fields)];
  const values = [title, true, ...Object.values(fields)];
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO public.compositions (${columns.join(', ')})
     VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`,
    values
  );
  return rows[0].id;
}

async function insertVersion(songId: string, fields: Record<string, unknown> = {}): Promise<string> {
  const db = await seedDb();
  const columns = ['composition_id', 'content_chordpro', ...Object.keys(fields)];
  const values = [songId, '[C]Weyo', ...Object.values(fields)];
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO public.song_versions (${columns.join(', ')})
     VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`,
    values
  );
  return rows[0].id;
}

async function accountId(account: string): Promise<string> {
  return profileIdByEmail(SEEDED_EMAILS[account]);
}

async function link(world: LinkWorld, account: string, fn: string, source: string, target: string) {
  try {
    const rows = await queryAsUser<{ result: unknown }>(
      await accountId(account),
      `SELECT public.${fn}($1, $2) AS result`,
      [source, target]
    );
    world.outcome = { ok: true, data: rows[0]?.result };
  } catch (error) {
    const e = error as { code?: string; message?: string };
    world.outcome = { ok: false, code: e.code, message: e.message };
  }
}

/** queryAsUser rolls its savepoint back, so a link made through it would vanish: re-run it for real. */
async function linkAndKeep(world: LinkWorld, account: string, source: string, target: string) {
  const db = await seedDb();
  const uid = await accountId(account);
  await db.query('SAVEPOINT link_keep');
  try {
    await db.query(`SELECT set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: uid, role: 'authenticated' })]);
    await db.query('SET LOCAL ROLE authenticated');
    const { rows } = await db.query<{ result: unknown }>('SELECT public.fn_link_song_as_version($1, $2) AS result', [
      source,
      target,
    ]);
    await db.query('RESET ROLE');
    await db.query('RELEASE SAVEPOINT link_keep');
    world.outcome = { ok: true, data: rows[0]?.result };
  } catch (error) {
    await db.query('ROLLBACK TO SAVEPOINT link_keep');
    await db.query('RESET ROLE');
    const e = error as { code?: string; message?: string };
    world.outcome = { ok: false, code: e.code, message: e.message };
  }
}

const songIds = (s: LinkWorld) => ({ first: s.first!, second: s.second!, third: s.third! });

async function versionCount(songId: string): Promise<number> {
  const db = await seedDb();
  const { rows } = await db.query<{ n: number }>(
    'SELECT count(*)::int AS n FROM public.song_versions WHERE composition_id = $1',
    [songId]
  );
  return rows[0].n;
}

async function songExists(songId: string): Promise<boolean> {
  const db = await seedDb();
  const { rows } = await db.query('SELECT 1 FROM public.compositions WHERE id = $1', [songId]);
  return rows.length > 0;
}

async function redirectOf(oldId: string): Promise<string | undefined> {
  const db = await seedDb();
  const { rows } = await db.query<{ new_id: string }>('SELECT new_id FROM public.composition_redirects WHERE old_id = $1', [
    oldId,
  ]);
  return rows[0]?.new_id;
}

// ── @seed: fixtures ─────────────────────────────────────────────────────────

Given(
  'songs {string} and {string} with one version each',
  async function (firstTitle: string, secondTitle: string) {
    const s = w(this);
    const db = await seedDb();
    s.first = await insertSong(firstTitle, { aliases: ['Weyo'] });
    s.second = await insertSong(secondTitle, { aliases: ['Weyo wey'] });
    s.firstVersion = await insertVersion(s.first, { version_name: 'Original' });
    s.secondVersion = await insertVersion(s.second, { version_name: 'Songbook B' });
    // One shared category and one only on the second song.
    // Songs map to subcategories only (check_is_subcategory).
    const { rows: parent } = await db.query<{ id: string }>(
      `INSERT INTO public.categories (name, slug) VALUES ('BDD Link Group', 'bdd-link-group') RETURNING id`
    );
    const { rows } = await db.query<{ id: string }>(
      `INSERT INTO public.categories (name, slug, parent_id)
       VALUES ('BDD Link One', 'bdd-link-one', $1), ('BDD Link Two', 'bdd-link-two', $1)
       RETURNING id`,
      [parent[0].id]
    );
    await db.query('INSERT INTO public.song_category_map (song_id, category_id) VALUES ($1, $2), ($3, $2), ($3, $4)', [
      s.first,
      rows[0].id,
      s.second,
      rows[1].id,
    ]);
  }
);

Given('the second song has a take and is in a playlist', async function () {
  const s = w(this);
  const db = await seedDb();
  const member = await accountId('member');
  const { rows: rec } = await db.query<{ id: string }>(
    `INSERT INTO public.user_recordings (user_id, song_version_id, recording_name, storage_path)
     VALUES ($1, $2, 'BDD take', $3) RETURNING id`,
    [member, s.secondVersion, `bdd/link/${s.secondVersion}.webm`]
  );
  s.recordingId = rec[0].id;
  const { rows: list } = await db.query<{ id: string }>(
    `INSERT INTO public.setlists (owner_id, title) VALUES ($1, 'BDD Link Playlist') RETURNING id`,
    [member]
  );
  const { rows: item } = await db.query<{ id: string }>(
    `INSERT INTO public.setlist_items (setlist_id, song_version_id, order_index) VALUES ($1, $2, 0) RETURNING id`,
    [list[0].id, s.secondVersion]
  );
  s.playlistItemId = item[0].id;
});

Given('the second song is private to another member', async function () {
  const s = w(this);
  const db = await seedDb();
  await db.query(
    `INSERT INTO auth.users (id, email) VALUES ($1, 'other-member@example.invalid') ON CONFLICT (id) DO NOTHING`,
    [OTHER_MEMBER_ID]
  );
  await db.query(
    `INSERT INTO public.profiles (id, email, role, full_name) VALUES ($1, 'other-member@example.invalid', 'member', 'Other Member')
     ON CONFLICT (id) DO NOTHING`,
    [OTHER_MEMBER_ID]
  );
  await db.query('UPDATE public.compositions SET is_public = false, owner_id = $2 WHERE id = $1', [s.second, OTHER_MEMBER_ID]);
});

Given(
  /^a third song "([^"]+)" linked into the (first|second) song$/,
  async function (title: string, which: 'first' | 'second') {
    const s = w(this);
    s.third = await insertSong(title);
    await insertVersion(s.third, { version_name: 'Old spelling' });
    await linkAndKeep(s, 'gatekeeper', s.third, songIds(s)[which]);
    assert.ok(s.outcome?.ok, `setup link failed: ${JSON.stringify(s.outcome)}`);
  }
);

Given(/^the (first|second) song is catalogued as "([^"]+)"$/, async function (which: 'first' | 'second', slug: string) {
  const db = await seedDb();
  await db.query('UPDATE public.compositions SET catalog_slug = $2 WHERE id = $1', [songIds(w(this))[which], slug]);
});

Given('both songs have a version from songbook {string}', async function (book: string) {
  const s = w(this);
  await insertVersion(s.first!, { catalog_source_id: book, version_name: 'Book' });
  await insertVersion(s.second!, { catalog_source_id: book, version_name: 'Book' });
});

Given('a member favourited both songs', async function () {
  const s = w(this);
  const db = await seedDb();
  s.memberId = await accountId('member');
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO public.setlists (owner_id, title, is_public) VALUES ($1, 'My Favorites', false) RETURNING id`,
    [s.memberId]
  );
  s.favouritesId = rows[0].id;
  await db.query(
    'INSERT INTO public.setlist_items (setlist_id, song_version_id, order_index) VALUES ($1, $2, 0), ($1, $3, 1)',
    [rows[0].id, s.firstVersion, s.secondVersion]
  );
});

// ── @seed: actions ──────────────────────────────────────────────────────────

When(
  /^(a gatekeeper|a member|an admin) (links|previews linking) the (first|second) as a version of the (first|second|third)$/,
  async function (who: string, verb: string, source: 'first' | 'second', target: 'first' | 'second' | 'third') {
    const s = w(this);
    const account = who.split(' ').pop()!;
    const ids = songIds(s);
    if (verb === 'links') await linkAndKeep(s, account, ids[source], ids[target]);
    else await link(s, account, 'fn_preview_song_link', ids[source], ids[target]);
  }
);

// ── @seed: outcomes ─────────────────────────────────────────────────────────

Then(/^the first song has (both|\d+) versions$/, async function (n: string) {
  const s = w(this);
  assert.ok(s.outcome?.ok, `link failed: ${JSON.stringify(s.outcome)}`);
  assert.equal(await versionCount(s.first!), n === 'both' ? 2 : Number(n));
  assert.equal(await songExists(s.second!), false, 'the second song is gone');
});

Then('the old link opens the first song', async function () {
  const s = w(this);
  assert.equal(await redirectOf(s.second!), s.first);
  // Guests read redirects too: the old link works for everyone.
  const db = await seedDb();
  await db.query('SAVEPOINT anon_read');
  try {
    await db.query('SET LOCAL ROLE anon');
    const { rows } = await db.query('SELECT new_id FROM public.composition_redirects WHERE old_id = $1', [s.second]);
    assert.equal(rows[0]?.new_id, s.first);
  } finally {
    await db.query('ROLLBACK TO SAVEPOINT anon_read');
  }
});

Then('recordings and playlist entries of the second still work', async function () {
  const s = w(this);
  const db = await seedDb();
  const { rows: rec } = await db.query<{ composition_id: string }>(
    `SELECT v.composition_id FROM public.user_recordings r JOIN public.song_versions v ON v.id = r.song_version_id
     WHERE r.id = $1`,
    [s.recordingId]
  );
  assert.equal(rec[0]?.composition_id, s.first);
  const { rows: item } = await db.query<{ composition_id: string }>(
    `SELECT v.composition_id FROM public.setlist_items i JOIN public.song_versions v ON v.id = i.song_version_id
     WHERE i.id = $1`,
    [s.playlistItemId]
  );
  assert.equal(item[0]?.composition_id, s.first);
});

Then("the first song's aliases include {string}", async function (alias: string) {
  const db = await seedDb();
  const { rows } = await db.query<{ aliases: string[] }>('SELECT aliases FROM public.compositions WHERE id = $1', [
    w(this).first,
  ]);
  assert.ok(rows[0].aliases.includes(alias), `aliases: ${rows[0].aliases}`);
  assert.ok(rows[0].aliases.includes('Weyo') && rows[0].aliases.includes('Weyo wey'), 'both songs keep their aliases');
  assert.ok(!rows[0].aliases.includes('Weyo wey yanna'), 'the own title is no alias');
});

Then('the categories of both songs are on the first song', async function () {
  const db = await seedDb();
  const { rows } = await db.query<{ slug: string }>(
    `SELECT c.slug FROM public.song_category_map m JOIN public.categories c ON c.id = m.category_id
     WHERE m.song_id = $1 ORDER BY c.slug`,
    [w(this).first]
  );
  assert.deepEqual(rows.map((r) => r.slug), ['bdd-link-one', 'bdd-link-two']);
});

Then('an audit entry names the gatekeeper and both titles', async function () {
  const s = w(this);
  const gatekeeper = await accountId('gatekeeper');
  const rows = await queryAsUser<{ actor_id: string; source_title: string; target_title: string }>(
    gatekeeper,
    'SELECT actor_id, source_title, target_title FROM public.song_link_audit WHERE source_id = $1',
    [s.second]
  );
  assert.deepEqual(rows, [{ actor_id: gatekeeper, source_title: 'Weyo Wey Yanna (Songbook B)', target_title: 'Weyo wey yanna' }]);
  // Members do not read the audit.
  assert.equal((await queryAsUser(await accountId('member'), 'SELECT 1 FROM public.song_link_audit')).length, 0);
});

Then('the preview counts {int} version to move', function (n: number) {
  const s = w(this);
  assert.ok(s.outcome?.ok, `preview failed: ${JSON.stringify(s.outcome)}`);
  assert.equal((s.outcome.data as SongLinkSummary).versions, n);
});

Then('both songs still exist', async function () {
  const s = w(this);
  assert.ok(await songExists(s.first!));
  assert.ok(await songExists(s.second!));
  assert.equal(await versionCount(s.second!), 1);
});

const REFUSALS: Record<string, { code: string; message?: RegExp }> = {
  'not allowed': { code: '42501' },
  invalid: { code: '22023', message: /itself/ },
  'not found': { code: 'P0002' },
  'already linked': { code: '22023', message: /already linked/ },
};

function assertRefused(s: LinkWorld, reason: string) {
  const expected = REFUSALS[reason];
  assert.ok(s.outcome && !s.outcome.ok, `expected a refusal, got ${JSON.stringify(s.outcome)}`);
  assert.equal(s.outcome.code, expected.code, s.outcome.message);
  if (expected.message) assert.match(s.outcome.message ?? '', expected.message);
}

Then(/^the link is refused as (not allowed|invalid|not found)$/, function (reason: string) {
  assertRefused(w(this), reason);
});

Then('the old link of the third song opens the first song', async function () {
  const s = w(this);
  assert.ok(s.outcome?.ok, `link failed: ${JSON.stringify(s.outcome)}`);
  assert.equal(await redirectOf(s.third!), s.first);
  assert.equal(await redirectOf(s.second!), s.first);
});

Then('linking the second song again is refused as already linked', async function () {
  const s = w(this);
  await link(s, 'gatekeeper', 'fn_link_song_as_version', s.second!, s.first!);
  assertRefused(s, 'already linked');
});

Then(/^the first song has catalog slug "([^"]+)"$/, async function (slug: string) {
  const s = w(this);
  assert.ok(s.outcome?.ok, `link failed: ${JSON.stringify(s.outcome)}`);
  const db = await seedDb();
  const { rows } = await db.query<{ catalog_slug: string }>('SELECT catalog_slug FROM public.compositions WHERE id = $1', [
    s.first,
  ]);
  assert.equal(rows[0].catalog_slug, slug);
});

Then('catalog slug {string} resolves to the first song', async function (slug: string) {
  const s = w(this);
  const rows = await queryAsUser<{ id: string }>(
    await accountId('gatekeeper'),
    'SELECT public.fn_song_id_for_catalog_slug($1) AS id',
    [slug]
  );
  assert.equal(rows[0].id, s.first);
});

Then('only one of them has catalog source {string}', async function (book: string) {
  const db = await seedDb();
  const { rows } = await db.query<{ n: number }>(
    'SELECT count(*)::int AS n FROM public.song_versions WHERE composition_id = $1 AND catalog_source_id = $2',
    [w(this).first, book]
  );
  assert.equal(rows[0].n, 1);
});

Then('the member has the first song once in their favourites', async function () {
  const s = w(this);
  const db = await seedDb();
  const { rows } = await db.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM public.setlist_items i
     JOIN public.song_versions v ON v.id = i.song_version_id AND v.composition_id = $2
     WHERE i.setlist_id = $1`,
    [s.favouritesId, s.first]
  );
  assert.equal(rows[0].n, 1);
});

Then("the favourite points at the first song's first version", async function () {
  const s = w(this);
  const db = await seedDb();
  const { rows: versions } = await db.query<{ id: string; created_at: string; version_kind: string }>(
    'SELECT id, created_at::text, version_kind FROM public.song_versions WHERE composition_id = $1',
    [s.first]
  );
  const { rows } = await db.query<{ song_version_id: string }>(
    'SELECT song_version_id FROM public.setlist_items WHERE setlist_id = $1',
    [s.favouritesId]
  );
  // The same "first version" the heart toggles (lib/songs/versionOrder.ts).
  assert.equal(rows[0].song_version_id, firstVersion(versions)?.id);
});

Then('its own version stays first and the moved one is a variant', async function () {
  const s = w(this);
  const db = await seedDb();
  const { rows } = await db.query<{ id: string; created_at: string; version_kind: string }>(
    'SELECT id, created_at::text, version_kind FROM public.song_versions WHERE composition_id = $1',
    [s.first]
  );
  assert.equal(firstVersion(rows)?.id, s.firstVersion);
  assert.equal(rows.find((r) => r.id === s.secondVersion)?.version_kind, 'variant');
});
