import assert from 'node:assert/strict';
import { Given, Then } from '@cucumber/cucumber';
import type { QueryResultRow } from 'pg';
import type { SongBddWorld } from '../support/world';
import { profileIdByEmail, queryAsAnon, queryAsUser, seedDb } from '../support/db';

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
