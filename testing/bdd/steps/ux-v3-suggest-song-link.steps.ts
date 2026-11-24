// Story 6.2.26 / G1.5 (#598) — docs/testing/ux-v3-suggest-song-link.feature
//
// @unit steps run on lib/songs/linkSuggestion.ts. @seed steps call the fn_*_song_link_suggestion functions as the
// real database roles (authenticated with auth.uid(), or anon) inside the scenario's rolled-back transaction
// (support/db.ts), so every row a scenario creates is gone afterwards.
import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import { profileIdByEmail, seedDb } from '../support/db';
import { DICTIONARIES, translateFrom } from '../../../lib/i18n';
import {
  SUGGESTION_ERROR_KEYS,
  SUGGESTION_NOTE_MAX,
  canDecideSuggestion,
  canSuggestLink,
  normalizeNote,
  suggestionError,
  suggestionHints,
  suggestionNotificationText,
  type LinkSuggestion,
  type NoteCheck,
  type SuggestionNotificationType,
} from '../../../lib/songs/linkSuggestion';
import { SEEDED_EMAILS, OTHER_MEMBER_ID } from './access-policies.steps';

type Account = 'member' | 'expert' | 'admin' | 'gatekeeper' | 'gatekeeper2';
const SECOND_GATEKEEPER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd3a0b02';
const EMAILS: Record<Account, string> = {
  ...SEEDED_EMAILS,
  expert: 'expert@sfs.example',
  gatekeeper2: 'other-gatekeeper@example.invalid',
} as Record<Account, string>;

interface SuggestWorld {
  role?: string | null;
  isPublic?: boolean;
  ownsSong?: boolean;
  suggestedByMe?: boolean;
  dbError?: { code: string; message: string };
  note?: NoteCheck;
  rows?: LinkSuggestion[];
  hintRow?: LinkSuggestion;
  bellText?: string;
  songs: Record<string, string>;
  current?: string;
  bySuggester: Record<string, string>;
  removedTitle?: string;
  staysTitle?: string;
  outcome?: { ok: true; data: unknown } | { ok: false; code?: string; message?: string };
  previewSummary?: { versions: number };
}

const worlds = new WeakMap<object, SuggestWorld>();
function w(world: object): SuggestWorld {
  let s = worlds.get(world);
  if (!s) {
    s = { songs: {}, bySuggester: {} };
    worlds.set(world, s);
  }
  return s;
}

const t = (key: string, params?: Record<string, string | number>) =>
  translateFrom(DICTIONARIES.en, DICTIONARIES.en, key, params);

// ── @unit ───────────────────────────────────────────────────────────────────

Given(/^a signed-in "([^"]+)" on a (public|private) song(?: (they own|of someone else))?$/, function (role: string, visibility: string, owner?: string) {
  const s = w(this);
  s.role = role === 'guest' ? null : role;
  s.isPublic = visibility === 'public';
  s.ownsSong = owner === 'they own';
});

Then(/^the suggest action is (shown|not shown) in the song menu$/, function (shown: string) {
  const s = w(this);
  const user = s.role ? { id: 'me', role: s.role } : null;
  assert.equal(canSuggestLink(user, { isPublic: !!s.isPublic, ownerId: s.ownsSong ? 'me' : 'someone-else' }), shown === 'shown');
});

Given(/^a signed-in "([^"]+)" looking at an open suggestion by (someone else|themselves)$/, function (role: string, by: string) {
  const s = w(this);
  s.role = role;
  s.suggestedByMe = by === 'themselves';
});

Then(/^the review actions are (shown|not shown)$/, function (shown: string) {
  const s = w(this);
  assert.equal(
    canDecideSuggestion({ id: 'me', role: s.role }, { status: 'open', suggested_by: s.suggestedByMe ? 'me' : 'someone-else' }),
    shown === 'shown'
  );
});

When('the note {string} is checked', function (note: string) {
  w(this).note = normalizeNote(note);
});

When('a note of {int} characters is checked', function (n: number) {
  w(this).note = normalizeNote('x'.repeat(n));
});

Then('the note becomes {string}', function (saved: string) {
  const n = w(this).note!;
  assert.ok(n.ok);
  assert.equal(n.value, saved === 'nothing' ? null : saved);
});

Then('the suggestion note is refused as too long', function () {
  assert.deepEqual(w(this).note, { ok: false, error: 'tooLong' });
  assert.equal(SUGGESTION_NOTE_MAX, 280);
});

Given('the suggestion database refuses with code {string} and message {string}', function (code: string, message: string) {
  w(this).dbError = { code, message };
});

Then('the suggestion sheet shows {string}', function (text: string) {
  assert.equal(t(SUGGESTION_ERROR_KEYS[suggestionError(w(this).dbError)]), text);
});

const fixtureRow = (over: Partial<LinkSuggestion>): LinkSuggestion => ({
  id: 'r',
  source_id: 's',
  target_id: 't',
  source_title: 'Source',
  target_title: 'Target',
  suggested_by: 'u1',
  suggester_name: 'Anna',
  note: null,
  status: 'open',
  decision_note: null,
  reviewed_by: null,
  reviewer_name: null,
  reviewed_at: null,
  reopened_at: null,
  created_at: '2026-11-20T10:00:00Z',
  ...over,
});

Given(
  'a declined suggestion {string} → {string} and an open one for the same pair',
  function (source: string, target: string) {
    const s = w(this);
    const declined = fixtureRow({
      id: 'd',
      status: 'declined',
      source_title: source,
      target_title: target,
      reviewed_at: '2026-11-09T10:00:00Z',
    });
    const open = fixtureRow({ id: 'o', source_title: source, target_title: target });
    s.rows = [open, declined];
    s.hintRow = open;
  }
);

Then('the open row shows {string}', function (text: string) {
  const s = w(this);
  const hints = suggestionHints(s.hintRow!, s.rows!);
  assert.ok(hints.declinedBefore, 'a declined pair has a date');
  assert.ok(t('suggest.hint.declinedBefore', { date: 'Nov 9' }).startsWith(text));
});

Given(
  'open suggestions {string} → {string} and {string} → {string}',
  function (source1: string, target1: string, source2: string, target2: string) {
    const s = w(this);
    const first = fixtureRow({ id: 'a', source_id: 's1', target_id: 't1', source_title: source1, target_title: target1 });
    const second = fixtureRow({ id: 'b', source_id: source2 === source1 ? 's1' : 's2', target_id: 't2', source_title: source2, target_title: target2 });
    s.rows = [first, second];
    s.hintRow = first;
  }
);

Then('the first row shows {string}', function (text: string) {
  const s = w(this);
  const hints = suggestionHints(s.hintRow!, s.rows!);
  assert.equal(t('suggest.hint.alsoSuggested', { titles: hints.alsoSuggested.join(', ') }), text);
});

Given(
  'a bell item {string} for {string} and {string}',
  function (type: string, source: string, target: string) {
    const { key, params } = suggestionNotificationText(type as SuggestionNotificationType, {
      source_title: source,
      target_title: target,
    });
    w(this).bellText = t(key, params);
  }
);

Given(
  'a bell item {string} for {string} with the reason {string}',
  function (type: string, source: string, reason: string) {
    const { key, params } = suggestionNotificationText(type as SuggestionNotificationType, { source_title: source, reason });
    w(this).bellText = t(key, params);
  }
);

Then('the bell item reads {string}', function (text: string) {
  assert.equal(w(this).bellText, text);
});

// ── @seed helpers ───────────────────────────────────────────────────────────

async function accountId(account: Account): Promise<string> {
  return profileIdByEmail(EMAILS[account]);
}

async function ensureOtherMember() {
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
}

async function insertSong(world: SuggestWorld, title: string, ownerId: string, isPublic: boolean): Promise<string> {
  const db = await seedDb();
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO public.compositions (title, is_public, owner_id) VALUES ($1, $2, $3) RETURNING id`,
    [title, isPublic, ownerId]
  );
  await db.query(`INSERT INTO public.song_versions (composition_id, content_chordpro, version_name) VALUES ($1, '[C]Weyo', 'Standard')`, [
    rows[0].id,
  ]);
  world.songs[title] = rows[0].id;
  return rows[0].id;
}

type Actor = Account | 'guest' | (string & {});

/**
 * Runs `sql` as the real database role. With `keep` the effects stay in the scenario's transaction (a savepoint that
 * is released), otherwise they are rolled back. A refusal never leaves anything behind.
 */
async function runAs(
  actor: Actor,
  sql: string,
  params: unknown[] = [],
  keep = true
): Promise<{ ok: true; rows: Record<string, unknown>[] } | { ok: false; code?: string; message?: string }> {
  const db = await seedDb();
  await db.query('SAVEPOINT run_as');
  try {
    if (actor === 'guest') {
      await db.query(`SELECT set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ role: 'anon' })]);
      await db.query('SET LOCAL ROLE anon');
    } else {
      const uid = actor in EMAILS ? await accountId(actor as Account) : actor;
      await db.query(`SELECT set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: uid, role: 'authenticated' })]);
      await db.query('SET LOCAL ROLE authenticated');
    }
    const { rows } = await db.query(sql, params);
    await db.query('RESET ROLE');
    await db.query(keep ? 'RELEASE SAVEPOINT run_as' : 'ROLLBACK TO SAVEPOINT run_as');
    return { ok: true, rows };
  } catch (error) {
    await db.query('ROLLBACK TO SAVEPOINT run_as');
    await db.query('RESET ROLE');
    const e = error as { code?: string; message?: string };
    return { ok: false, code: e.code, message: e.message };
  }
}

function song(world: object, title: string): string {
  const id = w(world).songs[title];
  assert.ok(id, `no song "${title}" in this scenario`);
  return id;
}

interface SuggestionRow {
  id: string;
  source_id: string | null;
  target_id: string | null;
  source_title: string;
  target_title: string;
  suggested_by: string | null;
  note: string | null;
  status: string;
  decision_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  reopened_at: string | null;
}

async function suggestionsOf(titles?: string[]): Promise<SuggestionRow[]> {
  const db = await seedDb();
  const { rows } = await db.query<SuggestionRow>(
    `SELECT * FROM public.song_link_suggestions
     WHERE ($1::text[] IS NULL OR source_title = ANY($1) OR target_title = ANY($1))
     ORDER BY created_at, id`,
    [titles ?? null]
  );
  return rows;
}

async function suggest(world: SuggestWorld, actor: Actor, source: string, target: string, note?: string) {
  const result = await runAs(actor, 'SELECT public.fn_suggest_song_link($1, $2, $3) AS result', [
    world.songs[source],
    world.songs[target],
    note ?? null,
  ]);
  if (result.ok) {
    const id = (result.rows[0].result as { id: string }).id;
    world.current = id;
    if (actor !== 'guest') world.bySuggester[actor] = id;
    world.outcome = { ok: true, data: result.rows[0].result };
  } else {
    world.outcome = result;
  }
}

async function versionCount(songId: string): Promise<number> {
  const db = await seedDb();
  const { rows } = await db.query<{ n: number }>('SELECT count(*)::int AS n FROM public.song_versions WHERE composition_id = $1', [songId]);
  return rows[0].n;
}

async function songExists(songId: string): Promise<boolean> {
  const db = await seedDb();
  const { rows } = await db.query('SELECT 1 FROM public.compositions WHERE id = $1', [songId]);
  return rows.length > 0;
}

const accountOf = (text: string): Account => {
  const name = text.replace(/^the /, '');
  return name === 'other gatekeeper' ? 'gatekeeper2' : (name as Account);
};

// ── @seed: fixtures ─────────────────────────────────────────────────────────

Given('the public songs {string} and {string} of another member', async function (a: string, b: string) {
  const s = w(this);
  await ensureOtherMember();
  await insertSong(s, a, OTHER_MEMBER_ID, true);
  await insertSong(s, b, OTHER_MEMBER_ID, true);
});

Given('the public song {string} of another member', async function (title: string) {
  await ensureOtherMember();
  await insertSong(w(this), title, OTHER_MEMBER_ID, true);
});

Given('a second gatekeeper exists', async function () {
  const db = await seedDb();
  await db.query(`INSERT INTO auth.users (id, email) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`, [SECOND_GATEKEEPER_ID, EMAILS.gatekeeper2]);
  await db.query(
    `INSERT INTO public.profiles (id, email, role, full_name) VALUES ($1, $2, 'gatekeeper', 'Other Gatekeeper')
     ON CONFLICT (id) DO UPDATE SET role = 'gatekeeper', full_name = 'Other Gatekeeper'`,
    [SECOND_GATEKEEPER_ID, EMAILS.gatekeeper2]
  );
});

Given('the gatekeeper became the owner of both songs', async function () {
  const db = await seedDb();
  await db.query('UPDATE public.compositions SET owner_id = $1 WHERE id = ANY($2)', [await accountId('gatekeeper'), Object.values(w(this).songs)]);
});

Given('the gatekeeper\'s public song {string}', async function (title: string) {
  await insertSong(w(this), title, await accountId('gatekeeper'), true);
});

Given('the gatekeeper\'s public songs {string} and {string}', async function (a: string, b: string) {
  const s = w(this);
  const owner = await accountId('gatekeeper');
  await insertSong(s, a, owner, true);
  await insertSong(s, b, owner, true);
});

Given('the member\'s private song {string}', async function (title: string) {
  await insertSong(w(this), title, await accountId('member'), false);
});

Given('a private song {string} of another member', async function (title: string) {
  await ensureOtherMember();
  await insertSong(w(this), title, OTHER_MEMBER_ID, false);
});

Given(
  'the public song {string} of another member was linked into {string}',
  async function (title: string, target: string) {
    const s = w(this);
    await ensureOtherMember();
    await insertSong(s, title, OTHER_MEMBER_ID, true);
    const result = await runAs('admin', 'SELECT public.fn_link_song_as_version($1, $2)', [s.songs[title], s.songs[target]]);
    assert.ok(result.ok, `setup link failed: ${JSON.stringify(result)}`);
  }
);

Given(
  /^an open suggestion "([^"]+)" → "([^"]+)" by (the member|the expert|the gatekeeper)$/,
  async function (source: string, target: string, who: string) {
    const s = w(this);
    await suggest(s, accountOf(who), source, target, source === 'Siento la medica' && target === 'Siento la medicina' ? 'Same song' : undefined);
    assert.ok(s.outcome?.ok, `setup suggestion failed: ${JSON.stringify(s.outcome)}`);
  }
);

Given(/^the (member|gatekeeper) has (\d+) open suggestions$/, async function (who: Account, count: string) {
  const n = Number(count);
  const s = w(this);
  const db = await seedDb();
  const member = await accountId(who);
  await ensureOtherMember();
  const hub = await insertSong(s, 'Cap hub', OTHER_MEMBER_ID, true);
  for (let i = 0; i < n; i += 1) {
    const id = await insertSong(s, `Cap song ${i}`, OTHER_MEMBER_ID, true);
    await db.query(
      `INSERT INTO public.song_link_suggestions (source_id, target_id, source_title, target_title, suggested_by)
       VALUES ($1, $2, $3, 'Cap hub', $4)`,
      [id, hub, `Cap song ${i}`, member]
    );
  }
});

Given(
  /^"([^"]+)" was suggested as a version of "([^"]+)" before, and declined$/,
  async function (source: string, target: string) {
    const s = w(this);
    const db = await seedDb();
    await db.query(
      `INSERT INTO public.song_link_suggestions (source_id, target_id, source_title, target_title, suggested_by, status, reviewed_by, reviewed_at)
       VALUES ($1, $2, $3, $4, $5, 'declined', $6, now())`,
      [s.songs[source], s.songs[target], source, target, await accountId('member'), await accountId('admin')]
    );
  }
);

Given('{string} was made private', async function (title: string) {
  const db = await seedDb();
  await db.query('UPDATE public.compositions SET is_public = false WHERE id = $1', [song(this, title)]);
});

Given(/^the admin accepted the suggestion$/, async function () {
  const s = w(this);
  const result = await runAs('admin', 'SELECT public.fn_accept_song_link_suggestion($1, false)', [s.current]);
  assert.ok(result.ok, JSON.stringify(result));
});

Given(/^the admin declined (?:it|the suggestion)(?: with the reason "([^"]+)"| without a reason)?$/, async function (reason?: string) {
  const s = w(this);
  const result = await runAs('admin', 'SELECT public.fn_decline_song_link_suggestion($1, $2)', [s.current, reason ?? null]);
  assert.ok(result.ok, JSON.stringify(result));
});

Given(/^an admin linked "([^"]+)" directly into "([^"]+)"$/, async function (source: string, target: string) {
  const s = w(this);
  const result = await runAs('admin', 'SELECT public.fn_link_song_as_version($1, $2)', [s.songs[source], s.songs[target]]);
  assert.ok(result.ok, JSON.stringify(result));
});

// ── @seed: actions ──────────────────────────────────────────────────────────

When(
  /^(the member|the expert|the admin|the gatekeeper|a guest) suggests "([^"]+)" as a version of "([^"]+)"(?: with a note of (\d+) characters)?$/,
  async function (who: string, source: string, target: string, noteLength?: string) {
    const actor: Actor = who === 'a guest' ? 'guest' : accountOf(who);
    await suggest(w(this), actor, source, target, noteLength ? 'x'.repeat(Number(noteLength)) : undefined);
  }
);

When(/^the member links "([^"]+)" directly into "([^"]+)"$/, async function (source: string, target: string) {
  await directLink(this, 'member', source, target);
});
When(/^the gatekeeper links "([^"]+)" directly into "([^"]+)"$/, async function (source: string, target: string) {
  await directLink(this, 'gatekeeper', source, target);
});
When(/^the admin links "([^"]+)" directly into "([^"]+)"$/, async function (source: string, target: string) {
  await directLink(this, 'admin', source, target);
});

async function directLink(world: object, actor: Account, source: string, target: string) {
  const s = w(world);
  const result = await runAs(actor, 'SELECT public.fn_link_song_as_version($1, $2) AS result', [s.songs[source], s.songs[target]]);
  s.outcome = result.ok ? { ok: true, data: result.rows[0].result } : result;
  if (result.ok) {
    s.removedTitle = source;
    s.staysTitle = target;
  }
}

When(/^the (admin|gatekeeper|member|expert|other gatekeeper) accepts the suggestion(?: and keeps "([^"]+)")?$/, async function (whoName: string, keeps?: string) {
  const who = accountOf(whoName);
  const s = w(this);
  const [row] = (await suggestionsOf()).filter((r) => r.id === s.current);
  const swap = !!keeps && keeps === row.source_title;
  const result = await runAs(who, 'SELECT public.fn_accept_song_link_suggestion($1, $2) AS result', [s.current, swap]);
  s.outcome = result.ok ? { ok: true, data: result.rows[0].result } : result;
  if (result.ok) {
    s.removedTitle = swap ? row.target_title : row.source_title;
    s.staysTitle = swap ? row.source_title : row.target_title;
  }
});

When(/^the (admin|gatekeeper|member|expert|other gatekeeper) previews the suggestion$/, async function (whoName: string) {
  const who = accountOf(whoName);
  const s = w(this);
  const result = await runAs(who, 'SELECT public.fn_preview_song_link_suggestion($1, false) AS result', [s.current], false);
  s.outcome = result.ok ? { ok: true, data: result.rows[0].result } : result;
  if (result.ok) s.previewSummary = result.rows[0].result as { versions: number };
});

When(
  /^the (admin|gatekeeper|member|expert|other gatekeeper) declines the suggestion (?:with the reason "([^"]+)"|with a reason of (\d+) characters|without a reason)$/,
  async function (whoName: string, reason?: string, length?: string) {
    const who = accountOf(whoName);
    const s = w(this);
    const text = length ? 'x'.repeat(Number(length)) : (reason ?? null);
    const result = await runAs(who, 'SELECT public.fn_decline_song_link_suggestion($1, $2)', [s.current, text]);
    s.outcome = result.ok ? { ok: true, data: null } : result;
  }
);

When(/^the (admin|gatekeeper|member|expert|other gatekeeper) reopens the suggestion$/, async function (whoName: string) {
  const who = accountOf(whoName);
  const s = w(this);
  const result = await runAs(who, 'SELECT public.fn_reopen_song_link_suggestion($1)', [s.current]);
  s.outcome = result.ok ? { ok: true, data: null } : result;
});

When(/^the (admin|gatekeeper|member|expert|other gatekeeper) withdraws (?:the suggestion|it)$/, async function (whoName: string) {
  const who = accountOf(whoName);
  const s = w(this);
  const result = await runAs(who, 'SELECT public.fn_withdraw_song_link_suggestion($1)', [s.current]);
  s.outcome = result.ok ? { ok: true, data: null } : result;
});

When('the owner deletes {string}', async function (title: string) {
  const s = w(this);
  const result = await runAs(OTHER_MEMBER_ID, 'DELETE FROM public.compositions WHERE id = $1 RETURNING id', [
    song(this, title),
  ]);
  s.outcome = result.ok && result.rows.length === 1 ? { ok: true, data: null } : result.ok ? { ok: false, message: 'nothing deleted' } : result;
});

When(
  /^(the member|the admin|a guest) calls "(fn_link_song_as_version_core|fn_assert_can_review_link)" directly$/,
  async function (who: string, fn: string) {
    const s = w(this);
    const actor: Actor = who === 'a guest' ? 'guest' : accountOf(who);
    const ids = Object.values(s.songs);
    const sql =
      fn === 'fn_link_song_as_version_core'
        ? 'SELECT public.fn_link_song_as_version_core($1, $2, NULL)'
        : 'SELECT public.fn_assert_can_review_link($1, $2)';
    const result = await runAs(actor, sql, [ids[1], ids[0]], false);
    s.outcome = result.ok ? { ok: true, data: null } : result;
  }
);

When('a guest reads the suggestions table', async function () {
  const result = await runAs('guest', 'SELECT count(*) FROM public.song_link_suggestions', [], false);
  w(this).outcome = result.ok ? { ok: true, data: null } : result;
});

When('a guest asks for the open count', async function () {
  const result = await runAs('guest', 'SELECT public.fn_open_song_link_suggestion_count()', [], false);
  w(this).outcome = result.ok ? { ok: true, data: null } : result;
});

// ── @seed: outcomes ─────────────────────────────────────────────────────────

Then('it is refused with {string}', function (message: string) {
  const o = w(this).outcome;
  assert.ok(o && !o.ok, `expected a refusal, got ${JSON.stringify(o)}`);
  assert.ok((o.message ?? '').includes(message), `expected "${message}", got "${o.message}" (${o.code})`);
});

Then('it is refused as not allowed for a guest', function () {
  const o = w(this).outcome;
  assert.ok(o && !o.ok);
  assert.equal(o.code, '42501', o.message);
});

Then('it is refused as not allowed', function () {
  const o = w(this).outcome;
  assert.ok(o && !o.ok, `expected a refusal, got ${JSON.stringify(o)}`);
  assert.equal(o.code, '42501', o.message);
});

Then('no suggestion is saved', async function () {
  assert.equal((await suggestionsOf()).length, 0);
});

Then('both songs are unchanged', async function () {
  const s = w(this);
  const db = await seedDb();
  for (const [title, id] of Object.entries(s.songs)) {
    assert.ok(await songExists(id), `"${title}" still exists`);
    assert.equal(await versionCount(id), 1, `"${title}" still has its one version`);
  }
  const { rows } = await db.query('SELECT 1 FROM public.composition_redirects WHERE old_id = ANY($1)', [Object.values(s.songs)]);
  assert.equal(rows.length, 0, 'nothing was linked');
});

Then(
  /^an open suggestion "([^"]+)" → "([^"]+)" is saved with (the member|the expert|the gatekeeper) as the suggester$/,
  async function (source: string, target: string, who: string) {
    const rows = (await suggestionsOf([source])).filter((r) => r.source_title === source && r.target_title === target && r.status === 'open');
    assert.equal(rows.length, 1, `open suggestions for ${source} → ${target}: ${rows.length}`);
    assert.equal(rows[0].suggested_by, await accountId(accountOf(who)));
    w(this).current = rows[0].id;
  }
);

Then(/^the (member|expert|admin|gatekeeper) sees (\d+) suggestions?$/, async function (who: Account, n: string) {
  const s = w(this);
  const titles = Object.keys(s.songs);
  const result = await runAs(
    who,
    `SELECT count(*)::int AS n FROM public.song_link_suggestions WHERE source_title = ANY($1) OR target_title = ANY($1)`,
    [titles],
    false
  );
  assert.ok(result.ok, JSON.stringify(result));
  assert.equal(result.rows[0].n, Number(n));
});

Then('a direct insert, update and delete as the member is refused', async function () {
  const s = w(this);
  const ids = Object.values(s.songs);
  const insert = await runAs(
    'member',
    `INSERT INTO public.song_link_suggestions (source_id, target_id, source_title, target_title, suggested_by)
     VALUES ($1, $2, 'x', 'y', (SELECT auth.uid()))`,
    [ids[0], ids[1]],
    false
  );
  assert.ok(!insert.ok && insert.code === '42501', `insert: ${JSON.stringify(insert)}`);
  const update = await runAs('member', "UPDATE public.song_link_suggestions SET status = 'accepted'", [], false);
  assert.ok(!update.ok && update.code === '42501', `update: ${JSON.stringify(update)}`);
  const del = await runAs('member', 'DELETE FROM public.song_link_suggestions', [], false);
  assert.ok(!del.ok && del.code === '42501', `delete: ${JSON.stringify(del)}`);
});

Then('a direct update as the admin is refused', async function () {
  const update = await runAs('admin', "UPDATE public.song_link_suggestions SET status = 'accepted'", [], false);
  assert.ok(!update.ok && update.code === '42501', JSON.stringify(update));
});

Then(/^its status is "([^"]+)"$/, async function (status: string) {
  const [row] = (await suggestionsOf()).filter((r) => r.id === w(this).current);
  assert.equal(row.status, status);
});

Then('the suggestion preview counts {int} version to move', function (n: number) {
  const s = w(this);
  assert.ok(s.outcome?.ok, `preview failed: ${JSON.stringify(s.outcome)}`);
  assert.equal(s.previewSummary?.versions, n);
});

Then(
  /^the open count is (\d+) for the admin, (\d+) for the gatekeeper and (\d+) for the member$/,
  async function (admin: string, gatekeeper: string, member: string) {
    const expected: [Account, string][] = [
      ['admin', admin],
      ['gatekeeper', gatekeeper],
      ['member', member],
    ];
    for (const [who, n] of expected) {
      const result = await runAs(who, 'SELECT public.fn_open_song_link_suggestion_count() AS n', [], false);
      assert.ok(result.ok, JSON.stringify(result));
      assert.equal(result.rows[0].n, Number(n), `${who} count`);
    }
  }
);

Then('{string} has the versions of both songs', async function (title: string) {
  const s = w(this);
  assert.ok(s.outcome?.ok, `link failed: ${JSON.stringify(s.outcome)}`);
  assert.equal(await versionCount(song(this, title)), 2);
});

Then('the old link of {string} opens {string}', async function (oldTitle: string, newTitle: string) {
  const db = await seedDb();
  const { rows } = await db.query<{ new_id: string }>('SELECT new_id FROM public.composition_redirects WHERE old_id = $1', [
    song(this, oldTitle),
  ]);
  assert.equal(rows[0]?.new_id, song(this, newTitle));
  assert.equal(await songExists(song(this, oldTitle)), false);
});

Then(
  /^the suggestion is accepted with the (admin|gatekeeper|other gatekeeper) as the reviewer$/,
  async function (whoName: string) {
    const who = accountOf(whoName);
    const [row] = (await suggestionsOf()).filter((r) => r.id === w(this).current);
    assert.equal(row.status, 'accepted');
    assert.equal(row.reviewed_by, await accountId(who));
    assert.ok(row.reviewed_at);
  }
);

Then(
  /^the suggestion is declined with the (admin|gatekeeper) as the reviewer$/,
  async function (who: Account) {
    const [row] = (await suggestionsOf()).filter((r) => r.id === w(this).current);
    assert.equal(row.status, 'declined');
    assert.equal(row.reviewed_by, await accountId(who));
  }
);

Then('the audit entry of the link points at the suggestion', async function () {
  const db = await seedDb();
  const { rows } = await db.query<{ suggestion_id: string }>('SELECT suggestion_id FROM public.song_link_audit WHERE suggestion_id = $1', [
    w(this).current,
  ]);
  assert.equal(rows.length, 1);
});

async function memberNotifications(type: string) {
  const result = await runAs(
    'member',
    'SELECT type, composition_id, actor_id, metadata FROM public.notifications WHERE type = $1',
    [type],
    false
  );
  assert.ok(result.ok, JSON.stringify(result));
  return result.rows as { type: string; composition_id: string | null; actor_id: string | null; metadata: Record<string, string | null> }[];
}

Then('the member is notified that the songs were linked', async function () {
  const s = w(this);
  const rows = await memberNotifications('link_suggestion_accepted');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].metadata.source_title, s.removedTitle);
  assert.equal(rows[0].metadata.target_title, s.staysTitle);
  assert.equal(rows[0].composition_id, song(this, s.staysTitle!), 'the notification opens the song that stays');
});

Then('the member is notified that it was declined with the reason {string}', async function (reason: string) {
  const rows = await memberNotifications('link_suggestion_declined');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].metadata.reason, reason);
});

Then('the member is notified that it was declined without a reason', async function () {
  const rows = await memberNotifications('link_suggestion_declined');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].metadata.reason ?? null, null);
});

Then('it is open again with the member as the suggester and the same note', async function () {
  const [row] = (await suggestionsOf()).filter((r) => r.id === w(this).current);
  assert.equal(row.status, 'open');
  assert.equal(row.suggested_by, await accountId('member'));
  assert.equal(row.note, 'Same song');
  assert.ok(row.reopened_at);
});

Then('it still says it was declined before by the admin', async function () {
  const [row] = (await suggestionsOf()).filter((r) => r.id === w(this).current);
  assert.equal(row.reviewed_by, await accountId('admin'));
  assert.equal(row.decision_note, 'Different songs');
  assert.ok(row.reviewed_at);
});

Then(/^the suggestion "([^"]+)" → "([^"]+)" is (open|superseded)$/, async function (source: string, target: string, status: string) {
  const rows = (await suggestionsOf([source])).filter((r) => r.source_title === source && r.target_title === target);
  assert.equal(rows.length, 1, `suggestions ${source} → ${target}: ${rows.length}`);
  assert.equal(rows[0].status, status);
  if (status === 'open') {
    const stays = song(this, target);
    assert.equal(rows[0].target_id, stays, 'the suggestion points at the song that stays');
  }
});

Then('the suggestion of the expert is accepted by the direct link', async function () {
  const s = w(this);
  const [row] = (await suggestionsOf()).filter((r) => r.id === s.bySuggester.expert);
  assert.equal(row.status, 'accepted');
  assert.equal(row.reviewed_by, await accountId('admin'));
  // And the expert is told.
  const result = await runAs('expert', "SELECT 1 FROM public.notifications WHERE type = 'link_suggestion_accepted'", [], false);
  assert.ok(result.ok && result.rows.length === 1);
});

Then('no open suggestion points from or to a deleted song', async function () {
  const db = await seedDb();
  const { rows } = await db.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM public.song_link_suggestions s
     WHERE s.status = 'open'
       AND (NOT EXISTS (SELECT 1 FROM public.compositions WHERE id = s.source_id)
         OR NOT EXISTS (SELECT 1 FROM public.compositions WHERE id = s.target_id))`
  );
  assert.equal(rows[0].n, 0);
});

Then('the delete succeeds', function () {
  assert.ok(w(this).outcome?.ok, JSON.stringify(w(this).outcome));
});

Then('the suggestion is superseded', async function () {
  const [row] = (await suggestionsOf()).filter((r) => r.id === w(this).current);
  assert.equal(row.status, 'superseded');
});

Then('the suggestion keeps both titles', async function () {
  const [row] = (await suggestionsOf()).filter((r) => r.id === w(this).current);
  assert.equal(row.source_title, 'Siento la medica');
  assert.equal(row.target_title, 'Siento la medicina');
});
