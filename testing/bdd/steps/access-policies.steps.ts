import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import type { QueryResultRow } from 'pg';
import type { SongBddWorld } from '../support/world';
import { profileIdByEmail, queryAsAnon, queryAsServiceRole, queryAsUser, seedDb } from '../support/db';

/**
 * Steps for docs/testing/access-policies.feature. Every statement runs as the
 * real database role (see testing/bdd/support/db.ts) inside the scenario's
 * rolled-back transaction.
 */

type PlaylistName = "the member's private" | "the member's public" | "the other member's";

export interface AccessBddState {
  otherMemberId: string;
  songVersionId: string;
  playlists: Record<PlaylistName, string>;
  items: Record<PlaylistName, string>;
  songs?: Record<SongName, SongFixture>;
  newUserId?: string;
}

type SongName = "the member's" | "the other member's";
interface SongFixture {
  compositionId: string;
  versionId: string;
}

const OTHER_MEMBER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd3a0b01';
const OTHER_MEMBER_EMAIL = 'other-member@example.invalid';

const SEEDED_EMAILS: Record<string, string> = {
  member: 'roel.de.meester+member@gmail.com',
  gatekeeper: 'roel.de.meester+gatekeeper@gmail.com',
  admin: 'roel.de.meester+admin@gmail.com',
};

function access(world: SongBddWorld): AccessBddState {
  assert.ok(world.access, 'Background did not create the playlist fixtures');
  return world.access;
}

/** Runs `sql` as a guest or as the named account. */
async function queryAs<T extends QueryResultRow>(
  world: SongBddWorld,
  account: string,
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  if (account === 'guest') return queryAsAnon<T>(sql, params);
  const id = account === 'other member' ? access(world).otherMemberId : await profileIdByEmail(SEEDED_EMAILS[account]);
  return queryAsUser<T>(id, sql, params);
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

async function assertRefused(run: () => Promise<unknown>, message: string): Promise<void> {
  await assert.rejects(run, (error: { code?: string }) => error.code === '42501', message);
}

Given('a second plain member account', async function () {
  const db = await seedDb();
  await db.query(`INSERT INTO auth.users (id, email) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`, [
    OTHER_MEMBER_ID,
    OTHER_MEMBER_EMAIL,
  ]);
  await db.query(
    `INSERT INTO public.profiles (id, email, role, full_name) VALUES ($1, $2, 'member', 'Other Member')
     ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name`,
    [OTHER_MEMBER_ID, OTHER_MEMBER_EMAIL]
  );
});

Given('the member owns a private and a public playlist with one song each', async function (this: SongBddWorld) {
  const db = await seedDb();
  const owner = await profileIdByEmail(SEEDED_EMAILS.member);
  const { rows: versions } = await db.query<{ id: string }>('SELECT id FROM public.song_versions ORDER BY id LIMIT 1');
  assert.ok(versions[0], 'Expected seeded song versions. Run the seeds first.');

  const addPlaylist = async (title: string, ownerId: string, isPublic: boolean) => {
    const { rows } = await db.query<{ id: string }>(
      `INSERT INTO public.setlists (owner_id, title, is_public) VALUES ($1, $2, $3) RETURNING id`,
      [ownerId, title, isPublic]
    );
    const { rows: items } = await db.query<{ id: string }>(
      `INSERT INTO public.setlist_items (setlist_id, song_version_id, order_index) VALUES ($1, $2, 0) RETURNING id`,
      [rows[0].id, versions[0].id]
    );
    return { playlist: rows[0].id, item: items[0].id };
  };

  const priv = await addPlaylist('BDD private', owner, false);
  const pub = await addPlaylist('BDD public', owner, true);
  const other = await addPlaylist('BDD other private', OTHER_MEMBER_ID, false);

  this.access = {
    otherMemberId: OTHER_MEMBER_ID,
    songVersionId: versions[0].id,
    playlists: {
      "the member's private": priv.playlist,
      "the member's public": pub.playlist,
      "the other member's": other.playlist,
    },
    items: {
      "the member's private": priv.item,
      "the member's public": pub.item,
      "the other member's": other.item,
    },
  };
});

Given('the other member owns a private playlist with one song', function (this: SongBddWorld) {
  assert.ok(access(this).playlists["the other member's"]);
});

// ── Profile e-mail ────────────────────────────────────────────────────────────

Then('a guest cannot select the email column of profiles', async function () {
  await assertRefused(() => queryAsAnon('SELECT email FROM public.profiles'), 'guest selecting profiles.email');
});

Then('a guest cannot select all columns of profiles', async function () {
  await assertRefused(() => queryAsAnon('SELECT * FROM public.profiles'), 'guest selecting all profile columns');
});

Then('a guest cannot read e-mail addresses through an embedded playlist owner', async function () {
  await assertRefused(
    () =>
      queryAsAnon(`SELECT s.id, p.email FROM public.setlists s JOIN public.profiles p ON p.id = s.owner_id
                    WHERE s.is_public`),
    'guest joining playlists to profile e-mail'
  );
});

Then(
  /^the (member|gatekeeper|admin) account reads one own e-mail address$/,
  async function (this: SongBddWorld, account: string) {
    const id = await profileIdByEmail(SEEDED_EMAILS[account]);
    const rows = await queryAsUser<{ email: string }>(id, 'SELECT email FROM public.profiles WHERE id = $1', [id]);
    assert.deepEqual(rows, [{ email: SEEDED_EMAILS[account] }]);
  }
);

Then(
  /^the (member|gatekeeper|admin) account reads (no|all) other e-mail addresses$/,
  async function (this: SongBddWorld, account: string, expected: string) {
    const db = await seedDb();
    const id = await profileIdByEmail(SEEDED_EMAILS[account]);
    const { rows: everyone } = await db.query<{ count: number }>(
      'SELECT count(*)::int AS count FROM public.profiles WHERE id <> $1',
      [id]
    );
    const rows = await queryAsUser<{ email: string }>(id, 'SELECT email FROM public.profiles WHERE id <> $1', [id]);
    assert.equal(rows.length, expected === 'all' ? everyone[0].count : 0);
  }
);

// ── Public profile fields ─────────────────────────────────────────────────────

Then(
  /^a (guest|member) reads the name and avatar of the member through public_profiles$/,
  async function (this: SongBddWorld, reader: string) {
    const memberId = await profileIdByEmail(SEEDED_EMAILS.member);
    const rows = await queryAs<{ full_name: string; avatar_url: string | null }>(
      this,
      reader,
      'SELECT full_name, avatar_url FROM public.public_profiles WHERE id = $1',
      [memberId]
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0].full_name, 'Local Member');
  }
);

Then('public_profiles has no e-mail or activity columns', async function () {
  const db = await seedDb();
  const { rows } = await db.query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'public_profiles' ORDER BY column_name`
  );
  assert.deepEqual(
    rows.map((r) => r.column_name),
    ['avatar_url', 'full_name', 'id']
  );
});

Then(/^a (guest|member) cannot write through public_profiles$/, async function (this: SongBddWorld, reader: string) {
  const memberId = await profileIdByEmail(SEEDED_EMAILS.member);
  await assertRefused(
    () => queryAs(this, reader, `UPDATE public.public_profiles SET full_name = 'x' WHERE id = $1 RETURNING id`, [memberId]),
    `${reader} updating public_profiles`
  );
  await assertRefused(
    () => queryAs(this, reader, 'DELETE FROM public.public_profiles WHERE id = $1 RETURNING id', [memberId]),
    `${reader} deleting from public_profiles`
  );
});

Then('the member can read all fields of their own profile', async function () {
  const id = await profileIdByEmail(SEEDED_EMAILS.member);
  const rows = await queryAsUser<{ email: string; role: string }>(id, 'SELECT * FROM public.profiles WHERE id = $1', [id]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].email, SEEDED_EMAILS.member);
  assert.equal(rows[0].role, 'member');
});

Then('the member can update their own name', async function () {
  const id = await profileIdByEmail(SEEDED_EMAILS.member);
  const rows = await queryAsUser(id, `UPDATE public.profiles SET full_name = 'Renamed' WHERE id = $1 RETURNING id`, [id]);
  assert.equal(rows.length, 1);
});

// ── Playlist items: read ──────────────────────────────────────────────────────

Then(
  /^a (guest|member|other member|gatekeeper|admin) (can|cannot) read the items of the member's (public|private) playlist$/,
  async function (this: SongBddWorld, reader: string, result: string, visibility: 'public' | 'private') {
    const playlistId = access(this).playlists[`the member's ${visibility}`];
    const rows = await queryAs(this, reader, 'SELECT id FROM public.setlist_items WHERE setlist_id = $1', [playlistId]);
    assert.equal(rows.length, result === 'can' ? 1 : 0, `${reader} reading items of a ${visibility} playlist`);
  }
);

// ── Playlist items: write ─────────────────────────────────────────────────────

Then(
  /^a (guest|member|other member|gatekeeper|admin) (can|cannot) (add|change|remove) an item on the member's (public|private) playlist$/,
  async function (
    this: SongBddWorld,
    writer: string,
    result: string,
    action: 'add' | 'change' | 'remove',
    visibility: 'public' | 'private'
  ) {
    const s = access(this);
    const name = `the member's ${visibility}` as const;
    const statements = {
      add: () =>
        queryAs(
          this,
          writer,
          `INSERT INTO public.setlist_items (setlist_id, song_version_id, order_index) VALUES ($1, $2, 9) RETURNING id`,
          [s.playlists[name], s.songVersionId]
        ),
      change: () =>
        queryAs(this, writer, 'UPDATE public.setlist_items SET order_index = 9 WHERE id = $1 RETURNING id', [s.items[name]]),
      remove: () => queryAs(this, writer, 'DELETE FROM public.setlist_items WHERE id = $1 RETURNING id', [s.items[name]]),
    };
    assert.equal(await isAllowed(statements[action]), result === 'can', `${writer} ${action} on ${visibility} playlist`);
  }
);

Then(
  /^a (member|other member|gatekeeper|admin) (can|cannot) move (the member's private|the member's public|the other member's) item to (the member's private|the member's public|the other member's) playlist$/,
  async function (this: SongBddWorld, writer: string, result: string, source: PlaylistName, target: PlaylistName) {
    const s = access(this);
    const allowed = await isAllowed(() =>
      queryAs(this, writer, 'UPDATE public.setlist_items SET setlist_id = $2 WHERE id = $1 RETURNING id', [
        s.items[source],
        s.playlists[target],
      ])
    );
    assert.equal(allowed, result === 'can', `${writer} moving ${source} item to ${target} playlist`);
  }
);

// "the admin account can read every profile and every playlist in the database"
// is defined in admin-users.steps.ts and reused here.

Given('the member and the other member each own a public song with one version', async function (this: SongBddWorld) {
  const db = await seedDb();
  const addSong = async (ownerId: string, title: string): Promise<SongFixture> => {
    const { rows } = await db.query<{ id: string }>(
      `INSERT INTO public.compositions (title, owner_id, is_public) VALUES ($1, $2, true) RETURNING id`,
      [title, ownerId]
    );
    const { rows: versions } = await db.query<{ id: string }>(
      `INSERT INTO public.song_versions (composition_id, content_chordpro, contributor_id)
       VALUES ($1, 'BDD', $2) RETURNING id`,
      [rows[0].id, ownerId]
    );
    return { compositionId: rows[0].id, versionId: versions[0].id };
  };
  const memberId = await profileIdByEmail(SEEDED_EMAILS.member);
  access(this).songs = {
    "the member's": await addSong(memberId, 'BDD member song'),
    "the other member's": await addSong(OTHER_MEMBER_ID, 'BDD other song'),
  };
});

function songs(world: SongBddWorld): Record<SongName, SongFixture> {
  const fixtures = access(world).songs;
  assert.ok(fixtures, 'Background did not create the song fixtures');
  return fixtures;
}

// ── Protected profile fields ──────────────────────────────────────────────────

Then(
  /^the (member|gatekeeper|admin) account is refused changing their own (role|email)$/,
  async function (this: SongBddWorld, account: string, field: 'role' | 'email') {
    const id = await profileIdByEmail(SEEDED_EMAILS[account]);
    const value = field === 'role' ? 'admin' : 'changed@example.invalid';
    await assertRefused(
      () => queryAsUser(id, `UPDATE public.profiles SET ${field} = $2 WHERE id = $1 RETURNING id`, [id, value]),
      `${account} changing their own ${field}`
    );
  }
);

Then('the member is refused inserting a second profile row', async function (this: SongBddWorld) {
  const id = await profileIdByEmail(SEEDED_EMAILS.member);
  const db = await seedDb();
  const spareId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd3a0b02';
  await db.query(`INSERT INTO auth.users (id, email) VALUES ($1, 'spare@example.invalid')`, [spareId]);
  await db.query('DELETE FROM public.profiles WHERE id = $1', [spareId]);
  await assertRefused(
    () =>
      queryAsUser(id, `INSERT INTO public.profiles (id, email, role) VALUES ($1, 'spare@example.invalid', 'admin') RETURNING id`, [
        spareId,
      ]),
    'member inserting a profile row for another auth user'
  );
});

Then('the member is refused upserting their own profile with another role', async function () {
  const id = await profileIdByEmail(SEEDED_EMAILS.member);
  await assertRefused(
    () =>
      queryAsUser(
        id,
        `INSERT INTO public.profiles (id, email, role) VALUES ($1, $2, 'admin')
         ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role RETURNING id`,
        [id, SEEDED_EMAILS.member]
      ),
    'member upserting their own profile'
  );
});

Then('the member cannot change the role of another account', async function (this: SongBddWorld) {
  const id = await profileIdByEmail(SEEDED_EMAILS.member);
  const rows = await queryAsUser(id, `UPDATE public.profiles SET role = 'admin' WHERE id = $1 RETURNING id`, [
    access(this).otherMemberId,
  ]);
  assert.equal(rows.length, 0);
});

Then('a guest is refused changing any profile', async function () {
  const id = await profileIdByEmail(SEEDED_EMAILS.member);
  await assertRefused(
    () => queryAsAnon(`UPDATE public.profiles SET role = 'admin' WHERE id = $1 RETURNING id`, [id]),
    'guest updating a profile'
  );
});

Then('the member can update their own name, avatar and last seen time', async function () {
  const id = await profileIdByEmail(SEEDED_EMAILS.member);
  const rows = await queryAsUser<{ full_name: string; avatar_url: string }>(
    id,
    `UPDATE public.profiles SET full_name = 'New name', avatar_url = 'https://example.invalid/a.png', last_seen_at = now()
      WHERE id = $1 RETURNING full_name, avatar_url`,
    [id]
  );
  assert.deepEqual(rows, [{ full_name: 'New name', avatar_url: 'https://example.invalid/a.png' }]);
});

Then('the admin can change the role of the other member', async function (this: SongBddWorld) {
  const id = await profileIdByEmail(SEEDED_EMAILS.admin);
  const rows = await queryAsUser<{ role: string }>(
    id,
    `UPDATE public.profiles SET role = 'musician' WHERE id = $1 RETURNING role`,
    [access(this).otherMemberId]
  );
  assert.deepEqual(rows, [{ role: 'musician' }]);
});

Then('the gatekeeper cannot change the role of the other member', async function (this: SongBddWorld) {
  const id = await profileIdByEmail(SEEDED_EMAILS.gatekeeper);
  const rows = await queryAsUser(id, `UPDATE public.profiles SET role = 'musician' WHERE id = $1 RETURNING id`, [
    access(this).otherMemberId,
  ]);
  assert.equal(rows.length, 0);
});

Then('the service role can change the role and e-mail of the other member', async function (this: SongBddWorld) {
  const rows = await queryAsServiceRole<{ role: string; email: string }>(
    `UPDATE public.profiles SET role = 'musician', email = 'synced@example.invalid' WHERE id = $1 RETURNING role, email`,
    [access(this).otherMemberId]
  );
  assert.deepEqual(rows, [{ role: 'musician', email: 'synced@example.invalid' }]);
});

const NEW_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd3a0b03';
const NEW_USER_EMAIL = 'new-registration@example.invalid';

When('a new auth user registers asking for the admin role in their metadata', async function () {
  const db = await seedDb();
  await db.query(`INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES ($1, $2, $3)`, [
    NEW_USER_ID,
    NEW_USER_EMAIL,
    JSON.stringify({ role: 'admin' }),
  ]);
});

Then('the new profile has the member role and the registered e-mail', async function () {
  const db = await seedDb();
  const { rows } = await db.query('SELECT role, email FROM public.profiles WHERE id = $1', [NEW_USER_ID]);
  assert.deepEqual(rows, [{ role: 'member', email: NEW_USER_EMAIL }]);
});

// ── Categories ────────────────────────────────────────────────────────────────

async function artistsParentId(): Promise<string> {
  const db = await seedDb();
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO public.categories (name, slug, emoji) VALUES ('Artists', 'artists', '👤')
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id`
  );
  return rows[0].id;
}

Then(
  /^a (guest|member|gatekeeper|admin) (can|cannot) add an artist sub-category$/,
  async function (this: SongBddWorld, account: string, result: string) {
    const parentId = await artistsParentId();
    const allowed = await isAllowed(() =>
      queryAs(
        this,
        account,
        `INSERT INTO public.categories (name, slug, emoji, parent_id)
         VALUES ('BDD Artist', 'artist-bdd-artist', '👤', $1) RETURNING id`,
        [parentId]
      )
    );
    assert.equal(allowed, result === 'can', `${account} adding an artist sub-category`);
  }
);

Given('the Artists parent category does not exist', async function () {
  const db = await seedDb();
  await db.query(`DELETE FROM public.song_category_map WHERE category_id IN
    (SELECT id FROM public.categories WHERE parent_id = (SELECT id FROM public.categories WHERE slug = 'artists'))`);
  await db.query(`DELETE FROM public.categories WHERE parent_id = (SELECT id FROM public.categories WHERE slug = 'artists')`);
  await db.query(`DELETE FROM public.categories WHERE slug = 'artists'`);
});

Then('a member can add the Artists parent category', async function (this: SongBddWorld) {
  const rows = await queryAs(
    this,
    'member',
    `INSERT INTO public.categories (name, slug, emoji, parent_id) VALUES ('Artists', 'artists', '👤', NULL) RETURNING id`
  );
  assert.equal(rows.length, 1);
});

Then(
  /^a (guest|member|gatekeeper|admin) (can|cannot) add a category outside the artists group$/,
  async function (this: SongBddWorld, account: string, result: string) {
    const db = await seedDb();
    const { rows: others } = await db.query<{ id: string }>(
      `SELECT id FROM public.categories WHERE parent_id IS NULL AND slug <> 'artists' LIMIT 1`
    );
    assert.ok(others[0], 'Expected a seeded category group');
    const parentId = await artistsParentId();
    const statements = [
      () =>
        queryAs(this, account, `INSERT INTO public.categories (name, slug) VALUES ('BDD Group', 'bdd-group') RETURNING id`),
      () =>
        queryAs(
          this,
          account,
          `INSERT INTO public.categories (name, slug, parent_id) VALUES ('BDD Child', 'artist-bdd-child', $1) RETURNING id`,
          [others[0].id]
        ),
      () =>
        queryAs(
          this,
          account,
          `INSERT INTO public.categories (name, slug, parent_id) VALUES ('BDD Plain', 'plain-bdd', $1) RETURNING id`,
          [parentId]
        ),
    ];
    for (const [index, run] of statements.entries()) {
      assert.equal(await isAllowed(run), result === 'can', `${account} category insert variant ${index}`);
    }
  }
);

Then(
  /^a (member|gatekeeper|admin) (can|cannot) (rename|delete) an existing category$/,
  async function (this: SongBddWorld, account: string, result: string, action: string) {
    const db = await seedDb();
    const { rows } = await db.query<{ id: string }>(
      `INSERT INTO public.categories (name, slug) VALUES ('BDD Fixture', 'bdd-fixture') RETURNING id`
    );
    const sql =
      action === 'rename'
        ? `UPDATE public.categories SET name = 'Renamed' WHERE id = $1 RETURNING id`
        : `DELETE FROM public.categories WHERE id = $1 RETURNING id`;
    const allowed = await isAllowed(() => queryAs(this, account, sql, [rows[0].id]));
    assert.equal(allowed, result === 'can', `${account} ${action} category`);
  }
);

// ── Playlist ownership ────────────────────────────────────────────────────────

Then(
  /^a (member|gatekeeper|admin) is refused changing the owner of the member's (public|private) playlist$/,
  async function (this: SongBddWorld, account: string, visibility: 'public' | 'private') {
    const s = access(this);
    const allowed = await isAllowed(() =>
      queryAs(this, account, 'UPDATE public.setlists SET owner_id = $2 WHERE id = $1 RETURNING id', [
        s.playlists[`the member's ${visibility}`],
        s.otherMemberId,
      ])
    );
    assert.equal(allowed, false, `${account} changing the owner of a ${visibility} playlist`);
  }
);

Then('a gatekeeper is refused upserting the member\'s public playlist with another owner', async function (this: SongBddWorld) {
  const s = access(this);
  await assertRefused(
    () =>
      queryAs(
        this,
        'gatekeeper',
        `INSERT INTO public.setlists (id, owner_id, title, is_public) VALUES ($1, $2, 'BDD public', true)
         ON CONFLICT (id) DO UPDATE SET owner_id = EXCLUDED.owner_id RETURNING id`,
        [s.playlists["the member's public"], s.otherMemberId]
      ),
    'gatekeeper upserting a playlist with another owner'
  );
});

Then(
  /^a (member|other member|gatekeeper) (can|cannot) rename the member's (public|private) playlist$/,
  async function (this: SongBddWorld, account: string, result: string, visibility: 'public' | 'private') {
    const allowed = await isAllowed(() =>
      queryAs(this, account, `UPDATE public.setlists SET title = 'Renamed', description = 'D' WHERE id = $1 RETURNING id`, [
        access(this).playlists[`the member's ${visibility}`],
      ])
    );
    assert.equal(allowed, result === 'can', `${account} renaming a ${visibility} playlist`);
  }
);

Then('the member can publish their own private playlist', async function (this: SongBddWorld) {
  const rows = await queryAs(this, 'member', 'UPDATE public.setlists SET is_public = true WHERE id = $1 RETURNING id', [
    access(this).playlists["the member's private"],
  ]);
  assert.equal(rows.length, 1);
});

// ── Song versions ─────────────────────────────────────────────────────────────

async function accountId(world: SongBddWorld, account: string): Promise<string | null> {
  if (account === 'guest') return null;
  return account === 'other member' ? access(world).otherMemberId : profileIdByEmail(SEEDED_EMAILS[account]);
}

Then(
  /^a (guest|member|other member|gatekeeper|admin) (can|cannot) add a version to (the member's|the other member's) song$/,
  async function (this: SongBddWorld, account: string, result: string, song: SongName) {
    const contributor = await accountId(this, account);
    const allowed = await isAllowed(() =>
      queryAs(
        this,
        account,
        `INSERT INTO public.song_versions (composition_id, content_chordpro, contributor_id) VALUES ($1, 'x', $2) RETURNING id`,
        [songs(this)[song].compositionId, contributor]
      )
    );
    assert.equal(allowed, result === 'can', `${account} adding a version to ${song} song`);
  }
);

Then('the member is refused adding a version to their song as the other member', async function (this: SongBddWorld) {
  await assertRefused(
    () =>
      queryAs(
        this,
        'member',
        `INSERT INTO public.song_versions (composition_id, content_chordpro, contributor_id) VALUES ($1, 'x', $2) RETURNING id`,
        [songs(this)["the member's"].compositionId, access(this).otherMemberId]
      ),
    'member adding a version in another name'
  );
});

Then(
  /^a (member|admin) is refused moving the member's version to (the other member's) song$/,
  async function (this: SongBddWorld, account: string, target: SongName) {
    const s = songs(this);
    await assertRefused(
      () =>
        queryAs(this, account, 'UPDATE public.song_versions SET composition_id = $2 WHERE id = $1 RETURNING id', [
          s["the member's"].versionId,
          s[target].compositionId,
        ]),
      `${account} moving a version to another song`
    );
  }
);

Then(
  "the member is refused moving the other member's version they contributed to their own song",
  async function (this: SongBddWorld) {
    const db = await seedDb();
    const s = songs(this);
    const memberId = await profileIdByEmail(SEEDED_EMAILS.member);
    await db.query('UPDATE public.song_versions SET contributor_id = $2 WHERE id = $1', [
      s["the other member's"].versionId,
      memberId,
    ]);
    await assertRefused(
      () =>
        queryAs(this, 'member', 'UPDATE public.song_versions SET composition_id = $2 WHERE id = $1 RETURNING id', [
          s["the other member's"].versionId,
          s["the member's"].compositionId,
        ]),
      'contributor moving a version'
    );
  }
);

Then(
  /^a (member|other member|admin) (can|cannot) edit the content of the member's version$/,
  async function (this: SongBddWorld, account: string, result: string) {
    const allowed = await isAllowed(() =>
      queryAs(
        this,
        account,
        `UPDATE public.song_versions SET content_chordpro = 'edited', key = 'C', capo = 1, tuning = 'Standard',
                youtube_url = 'y', spotify_url = 's', soundcloud_url = 'c', melody_notation = 'm'
          WHERE id = $1 RETURNING id`,
        [songs(this)["the member's"].versionId]
      )
    );
    assert.equal(allowed, result === 'can', `${account} editing version content`);
  }
);
