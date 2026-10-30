import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { createFakeSupabase, TABLE_COLUMNS, type FakeSupabaseState } from '../../support/fakeSupabase';
import {
  fetchAdminAccess,
  fetchAdminUserDetails,
  fetchAdminUsersList,
  type AdminAccessResult,
} from '@/lib/admin/userQueries';
import {
  filterAndSortUsers,
  getActivityStatus,
  isMusicianRole,
  type AdminRoleFilter,
  type AdminUserFilterOptions,
  type AdminUserSort,
} from '@/lib/admin/userOverview';
import type { AdminUserDetails, AdminUserSummary, UserRole } from '@/lib/admin/types';
import { profileIdByEmail, queryAsUser, seedDb } from '../support/db';
import type { SongBddWorld } from '../support/world';

// ---------------------------------------------------------------------------
// Scenario state (docs/testing/admin-users.feature)
// ---------------------------------------------------------------------------

type Row = Record<string, unknown>;

export interface AdminBddState {
  db: FakeSupabaseState & { tables: Record<string, Row[]> };
  now: Date;
  access?: AdminAccessResult;
  users?: AdminUserSummary[] | null;
  filter: AdminUserFilterOptions;
  details?: AdminUserDetails | null;
  lastSeenStatus?: string;
  /** @seed: id of a playlist inserted inside the scenario transaction. */
  playlistId?: string;
}

const FALLBACK_ADMIN = 'root-admin@test.com';

function state(world: SongBddWorld): AdminBddState {
  world.admin ??= {
    db: { tables: { profiles: [], compositions: [], song_versions: [], setlists: [] }, authUser: null },
    now: new Date(),
    filter: {},
  };
  return world.admin;
}

const idFor = (email: string) => `user:${email}`;
const atNoon = (date: string) => `${date}T12:00:00Z`;
const client = (s: AdminBddState) => createFakeSupabase(s.db).client;

function addProfile(s: AdminBddState, email: string, role: UserRole, extra: Partial<Row> = {}) {
  s.db.tables.profiles.push({
    id: idFor(email),
    email,
    role,
    full_name: null,
    avatar_url: null,
    created_at: atNoon('2026-01-01'),
    last_seen_at: null,
    ...extra,
  });
}

/** Signs in as the first admin profile, creating a separate admin if the table has none. */
function signInAsAdmin(s: AdminBddState) {
  let admin = s.db.tables.profiles.find((p) => p.role === 'admin');
  if (!admin) {
    addProfile(s, FALLBACK_ADMIN, 'admin');
    admin = s.db.tables.profiles.at(-1)!;
  }
  s.db.authUser = { id: admin.id as string };
}

function listed(s: AdminBddState): string[] {
  assert.ok(s.users, 'Expected the users overview to be loaded for an admin');
  return filterAndSortUsers(s.users, s.filter).map((u) => u.email);
}

function userByEmail(s: AdminBddState, email: string): AdminUserSummary {
  const user = s.users?.find((u) => u.email === email);
  assert.ok(user, `Expected ${email} in the users overview`);
  return user;
}

const splitList = (value: string) => value.split(',').map((v) => v.trim()).filter(Boolean);

// ---------------------------------------------------------------------------
// Rule: Only administrators can open the admin area (@unit)
// ---------------------------------------------------------------------------

Given('the signed-in user has the profile role {string}', function (this: SongBddWorld, role: string) {
  const s = state(this);
  addProfile(s, `${role}@test.com`, role as UserRole);
  s.db.authUser = { id: idFor(`${role}@test.com`) };
});

Given('nobody is signed in', function (this: SongBddWorld) {
  const s = state(this);
  addProfile(s, 'admin@test.com', 'admin');
  s.db.authUser = null;
});

When('admin access is checked', async function (this: SongBddWorld) {
  const s = state(this);
  s.access = await fetchAdminAccess(client(s));
});

Then(/^admin access is (granted|denied)$/, function (this: SongBddWorld, decision: string) {
  assert.equal(state(this).access?.authorized, decision === 'granted');
});

Then(
  /^the users overview query returns (the users|nothing)$/,
  async function (this: SongBddWorld, expected: string) {
    const s = state(this);
    const users = await fetchAdminUsersList(client(s));
    if (expected === 'nothing') {
      assert.equal(users, null);
    } else {
      assert.ok(users && users.length === s.db.tables.profiles.length);
    }
  }
);

Then('the user details query returns nothing', async function (this: SongBddWorld) {
  const s = state(this);
  assert.equal(await fetchAdminUserDetails(client(s), idFor('admin@test.com')), null);
});

// ---------------------------------------------------------------------------
// Rule: The users overview lists every registered user (@unit)
// ---------------------------------------------------------------------------

Given('the registered users', function (this: SongBddWorld, table: DataTable) {
  const s = state(this);
  for (const row of table.hashes()) {
    addProfile(s, row.email, row.role as UserRole, {
      full_name: row.name || null,
      created_at: atNoon(row.joined),
      last_seen_at: row['last seen'] ? atNoon(row['last seen']) : null,
    });
  }
});

Given('today is {word}', function (this: SongBddWorld, date: string) {
  state(this).now = new Date(atNoon(date));
});

Given(
  '{string} created {int} songs, submitted {int} versions and created {int} playlists of which {int} is public',
  function (this: SongBddWorld, email: string, songs: number, versions: number, playlists: number, pub: number) {
    const { tables } = state(this).db;
    const owner = idFor(email);
    for (let i = 0; i < songs; i++) {
      tables.compositions.push({ id: `${email}-song-${i}`, title: `Song ${i}`, owner_id: owner, created_at: atNoon('2026-06-01') });
    }
    for (let i = 0; i < versions; i++) {
      tables.song_versions.push({ id: `${email}-v-${i}`, composition_id: 'any', contributor_id: owner, created_at: atNoon('2026-06-01') });
    }
    for (let i = 0; i < playlists; i++) {
      tables.setlists.push({ id: `${email}-pl-${i}`, owner_id: owner, title: `Playlist ${i}`, is_public: i < pub, created_at: atNoon('2026-06-01') });
    }
  }
);

When('the admin loads the users overview', async function (this: SongBddWorld) {
  const s = state(this);
  signInAsAdmin(s);
  s.users = await fetchAdminUsersList(client(s));
  s.filter = {};
});

Then(
  'the overview lists {int} users in this order with these summary details',
  function (this: SongBddWorld, count: number, table: DataTable) {
    const s = state(this);
    const shown = filterAndSortUsers(s.users ?? [], s.filter);
    assert.equal(shown.length, count);
    const actual = shown.map((u) => ({
      email: u.email,
      role: u.role,
      joined: u.created_at.slice(0, 10),
      status: getActivityStatus(u.last_seen_at, s.now),
    }));
    assert.deepEqual(actual, table.hashes());
  }
);

When(/^a user was last seen (?:on (\d{4}-\d{2}-\d{2})|never)$/, function (this: SongBddWorld, date?: string) {
  const s = state(this);
  s.lastSeenStatus = getActivityStatus(date ? atNoon(date) : null, s.now);
});

Then('their status is {string}', function (this: SongBddWorld, status: string) {
  assert.equal(state(this).lastSeenStatus, status);
});

Then(
  '{string} shows {int} songs, {int} versions, {int} playlists and {int} public playlist',
  function (this: SongBddWorld, email: string, songs: number, versions: number, playlists: number, pub: number) {
    const user = userByEmail(state(this), email);
    assert.deepEqual(
      [user.songs_count, user.versions_count, user.playlists_count, user.public_playlists_count],
      [songs, versions, playlists, pub]
    );
  }
);

When('the admin searches for {string}', function (this: SongBddWorld, query: string) {
  state(this).filter.query = query;
});

When('the admin clears the search and filters on role {string}', function (this: SongBddWorld, role: string) {
  const s = state(this);
  s.filter = { ...s.filter, query: '', role: role as AdminRoleFilter };
});

When('the admin sorts by {string}', function (this: SongBddWorld, sortBy: string) {
  state(this).filter = { sortBy: sortBy as AdminUserSort };
});

Then('only {string} is listed', function (this: SongBddWorld, email: string) {
  assert.deepEqual(listed(state(this)), [email]);
});

Then('{string} are listed', function (this: SongBddWorld, emails: string) {
  assert.deepEqual([...listed(state(this))].sort(), splitList(emails).sort());
});

Then('the first listed users are {string}', function (this: SongBddWorld, emails: string) {
  const expected = splitList(emails);
  assert.deepEqual(listed(state(this)).slice(0, expected.length), expected);
});

Then('no users are listed', function (this: SongBddWorld) {
  assert.deepEqual(listed(state(this)), []);
});

// ---------------------------------------------------------------------------
// Rule: The user detail page shows profile details and contributions (@unit)
// ---------------------------------------------------------------------------

Given(
  '{string} owns the song {string} by {string}',
  function (this: SongBddWorld, email: string, title: string, author: string) {
    state(this).db.tables.compositions.push({
      id: `song:${title}`,
      title,
      original_author: author,
      owner_id: idFor(email),
      created_at: atNoon('2026-06-01'),
    });
  }
);

Given(
  '{string} submitted the version {string} of {string}',
  function (this: SongBddWorld, email: string, name: string, title: string) {
    state(this).db.tables.song_versions.push({
      id: `version:${name}`,
      composition_id: `song:${title}`,
      version_name: name,
      contributor_id: idFor(email),
      created_at: atNoon('2026-06-02'),
    });
  }
);

Given(
  '{string} created the public playlist {string} and the private playlist {string}',
  function (this: SongBddWorld, email: string, publicTitle: string, privateTitle: string) {
    const { tables } = state(this).db;
    tables.setlists.push(
      { id: 'pl:public', owner_id: idFor(email), title: publicTitle, is_public: true, created_at: atNoon('2026-06-03') },
      { id: 'pl:private', owner_id: idFor(email), title: privateTitle, is_public: false, created_at: atNoon('2026-06-04') }
    );
  }
);

When('the admin opens the details of {string}', async function (this: SongBddWorld, email: string) {
  const s = state(this);
  signInAsAdmin(s);
  s.details = await fetchAdminUserDetails(client(s), idFor(email));
});

When('the admin opens the details of an unknown user id', async function (this: SongBddWorld) {
  const s = state(this);
  signInAsAdmin(s);
  s.details = await fetchAdminUserDetails(client(s), 'user:does-not-exist');
});

function details(world: SongBddWorld): AdminUserDetails {
  const d = state(world).details;
  assert.ok(d, 'Expected user details to be returned');
  return d;
}

Then(
  'the details show the email {string}, role {string} and last active {string}',
  function (this: SongBddWorld, email: string, role: string, lastActive: string) {
    const d = details(this);
    assert.equal(d.email, email);
    assert.equal(d.role, role);
    assert.equal(d.last_seen_at?.slice(0, 10), lastActive);
  }
);

Then('the musician status is {string}', function (this: SongBddWorld, expected: string) {
  assert.equal(isMusicianRole(details(this).role) ? 'yes' : 'no', expected);
});

Then('the status is {string}', function (this: SongBddWorld, status: string) {
  assert.equal(getActivityStatus(details(this).last_seen_at, state(this).now), status);
});

Then('the songs added are {string} by {string}', function (this: SongBddWorld, title: string, author: string) {
  assert.deepEqual(
    details(this).contributions.songs.map((s) => [s.title, s.artist]),
    [[title, author]]
  );
});

Then('the versions submitted are {string} of {string}', function (this: SongBddWorld, name: string, title: string) {
  assert.deepEqual(
    details(this).contributions.versions.map((v) => [v.name, v.song_title, v.song_id]),
    [[name, title, `song:${title}`]]
  );
});

Then('the playlists are {string} of which {int} is public', function (this: SongBddWorld, titles: string, pub: number) {
  const playlists = details(this).contributions.playlists;
  assert.deepEqual(playlists.map((p) => p.title), splitList(titles));
  assert.equal(playlists.filter((p) => p.is_public).length, pub);
});

Then('the user has no songs, versions or playlists', function (this: SongBddWorld) {
  assert.deepEqual(details(this).contributions, { songs: [], versions: [], playlists: [] });
});

Then('no user details are returned', function (this: SongBddWorld) {
  assert.equal(state(this).details, null);
});

// ---------------------------------------------------------------------------
// @seed: local Supabase database (testing/bdd/support/db.ts)
// ---------------------------------------------------------------------------

const SEEDED_EMAILS: Record<string, string> = {
  admin: 'roel.de.meester+admin@gmail.com',
  musician: 'roel.de.meester+expert@gmail.com',
  member: 'roel.de.meester+member@gmail.com',
  gatekeeper: 'roel.de.meester+gatekeeper@gmail.com',
};

Then(/^fn_is_admin\(\) is true for the admin account only$/, async function () {
  for (const [account, email] of Object.entries(SEEDED_EMAILS)) {
    const id = await profileIdByEmail(email);
    const [row] = await queryAsUser<{ is_admin: boolean }>(id, 'SELECT public.fn_is_admin() AS is_admin');
    assert.equal(row.is_admin, account === 'admin', `fn_is_admin() for the ${account} account`);
  }
});

Given('the member owns a private playlist', async function (this: SongBddWorld) {
  const db = await seedDb();
  const owner = await profileIdByEmail(SEEDED_EMAILS.member);
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO public.setlists (owner_id, title, is_public) VALUES ($1, 'BDD private playlist', false) RETURNING id`,
    [owner]
  );
  state(this).playlistId = rows[0].id;
});

Then(
  /^the (admin|musician|gatekeeper|member) account (can|cannot) read that playlist$/,
  async function (this: SongBddWorld, account: string, can: string) {
    const id = await profileIdByEmail(SEEDED_EMAILS[account]);
    const rows = await queryAsUser(id, 'SELECT id FROM public.setlists WHERE id = $1', [state(this).playlistId]);
    assert.equal(rows.length, can === 'can' ? 1 : 0, `${account} reading a member's private playlist`);
  }
);

Then('every column the admin queries rely on exists in the database', async function () {
  const db = await seedDb();
  type ColumnRow = { table_name: string; column_name: string };
  const { rows } = await db.query<ColumnRow>(
    `SELECT table_name, column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ANY($1)`,
    [Object.keys(TABLE_COLUMNS)]
  );
  for (const [table, columns] of Object.entries(TABLE_COLUMNS)) {
    const actual = new Set((rows as ColumnRow[]).filter((r) => r.table_name === table).map((r) => r.column_name));
    const missing = columns.filter((c) => !actual.has(c));
    assert.deepEqual(missing, [], `testing/support/fakeSupabase.ts lists columns missing from public.${table}`);
  }
});

Then('the admin account can read every profile and every playlist in the database', async function () {
  const db = await seedDb();
  const admin = await profileIdByEmail(SEEDED_EMAILS.admin);
  const countSql = `SELECT (SELECT count(*) FROM public.profiles)::int AS profiles,
                           (SELECT count(*) FROM public.setlists)::int AS playlists`;
  type Counts = { profiles: number; playlists: number };
  const {
    rows: [total],
  } = await db.query<Counts>(countSql);
  const [asAdmin] = await queryAsUser<Counts>(admin, countSql);
  assert.ok(total.profiles >= 4, 'Expected the four seeded accounts');
  assert.deepEqual(asAdmin, total);
});
