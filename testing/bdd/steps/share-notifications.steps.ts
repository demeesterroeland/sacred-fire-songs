import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import {
  buildRecordingSharedEmail,
  getSmtpConfig,
  notificationLink,
  emailSettingsLink,
  type EmailContent,
  type RecordingSharedEmailInput,
} from '../../../lib/notifications/email';
import { parseRecordingParam, recordingPermalink } from '../../../lib/songs/recordingLink';
import { profileIdByEmail, queryAsUser, seedDb } from '../support/db';

const SEEDED_EMAILS = {
  member: 'roel.de.meester+member@gmail.com',
  musician: 'roel.de.meester+expert@gmail.com',
  gatekeeper: 'roel.de.meester+gatekeeper@gmail.com',
} as const;

interface ShareNotificationsState {
  input?: Omit<RecordingSharedEmailInput, 'link' | 'settingsLink'>;
  email?: EmailContent;
  recordingId?: string;
  param?: string;
}

const state = new WeakMap<object, ShareNotificationsState>();
function getState(world: object): ShareNotificationsState {
  if (!state.has(world)) state.set(world, {});
  return state.get(world)!;
}

// ─── @unit: email content ──────────────────────────────────────────────────────

Given('{string} shared the recording {string} of {string} with {string}', function (
  this: object, actor: string, recording: string, song: string, recipient: string,
) {
  getState(this).input = { actorName: actor, recordingName: recording, songTitle: song, recipientName: recipient };
});

When('the share email is built for the site {string}', function (this: object, siteUrl: string) {
  const s = getState(this);
  assert.ok(s.input);
  s.email = buildRecordingSharedEmail({
    ...s.input,
    link: notificationLink('comp-1', siteUrl, 'http://localhost:3000', 'rec-1'),
    settingsLink: emailSettingsLink(siteUrl, 'http://localhost:3000'),
  }, 'en');
});

Then('the email subject mentions {string} and {string}', function (this: object, a: string, b: string) {
  const { email } = getState(this);
  assert.ok(email?.subject.includes(a) && email.subject.includes(b), email?.subject);
});

Then('the email body links to {string}', function (this: object, link: string) {
  const { email } = getState(this);
  assert.ok(email?.text.includes(link));
  assert.ok(email?.html.includes(`href="${link}"`));
});

Then('the email links to the email notification settings at {string}', function (this: object, link: string) {
  const { email } = getState(this);
  assert.ok(email?.text.includes(link));
  assert.ok(email?.html.includes(`href="${link}"`));
});

Then('the recording link is {string}', function (this: object, expected: string) {
  assert.equal(recordingPermalink('rec-1'), expected);
});

Given('a recording link with {string}', function (this: object, value: string) {
  getState(this).param = value;
});

Then('the song page {word} the recording', function (this: object, verdict: string) {
  const parsed = parseRecordingParam(getState(this).param);
  assert.equal(parsed !== null, verdict === 'opens', `param ${getState(this).param}`);
});

Then('the html email contains no raw markup from user names', function (this: object) {
  const { email } = getState(this);
  assert.ok(email && !email.html.includes('<b>') && email.html.includes('&lt;b&gt;'));
});

Given('no SMTP host is configured', function () {});

Then('no SMTP transport is created', function () {
  assert.equal(getSmtpConfig({ SMTP_HOST: '' }), null);
  assert.equal(getSmtpConfig({}), null);
});

// ─── @seed: trigger, RLS and claim RPC ─────────────────────────────────────────

async function shareWith(recordingId: string, recipientEmail: string) {
  const db = await seedDb();
  const recipient = await profileIdByEmail(recipientEmail);
  await db.query('DELETE FROM public.recording_shares WHERE recording_id = $1 AND shared_with_user_id = $2', [recordingId, recipient]);
  await db.query('INSERT INTO public.recording_shares (recording_id, shared_with_user_id) VALUES ($1, $2)', [recordingId, recipient]);
}

Given('the member owns a recording', async function (this: object) {
  const db = await seedDb();
  const member = await profileIdByEmail(SEEDED_EMAILS.member);
  const { rows } = await db.query<{ id: string }>(
    'SELECT id FROM public.user_recordings WHERE user_id = $1 ORDER BY created_at LIMIT 1',
    [member],
  );
  if (!rows[0]) throw new Error('The seeded member has no recordings. Run: npx supabase db reset');
  getState(this).recordingId = rows[0].id;
});

When('the member shares that recording with the musician', async function (this: object) {
  await shareWith(getState(this).recordingId!, SEEDED_EMAILS.musician);
});

Given('the member has shared that recording with the musician', async function (this: object) {
  await shareWith(getState(this).recordingId!, SEEDED_EMAILS.musician);
});

Given('the musician has turned off email notifications', async function () {
  const db = await seedDb();
  await db.query('UPDATE public.profiles SET email_notifications = false WHERE email = $1', [SEEDED_EMAILS.musician]);
});

Then('the musician has an unread {string} notification naming the member', async function (this: object, type: string) {
  const musician = await profileIdByEmail(SEEDED_EMAILS.musician);
  const rows = await queryAsUser<{ type: string; read_at: string | null; actor_name: string; actor_id: string }>(
    musician,
    `SELECT type, read_at, metadata->>'actor_name' AS actor_name, actor_id
       FROM public.notifications WHERE recording_id = $1`,
    [getState(this).recordingId],
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].type, type);
  assert.equal(rows[0].read_at, null);
  assert.equal(rows[0].actor_id, await profileIdByEmail(SEEDED_EMAILS.member));
  assert.ok(rows[0].actor_name);
});

Then("the gatekeeper cannot read the musician's notification", async function (this: object) {
  const gatekeeper = await profileIdByEmail(SEEDED_EMAILS.gatekeeper);
  const rows = await queryAsUser(gatekeeper, 'SELECT id FROM public.notifications WHERE recording_id = $1', [getState(this).recordingId]);
  assert.equal(rows.length, 0);
});

Then('the musician cannot insert a notification for the gatekeeper', async function () {
  const musician = await profileIdByEmail(SEEDED_EMAILS.musician);
  const gatekeeper = await profileIdByEmail(SEEDED_EMAILS.gatekeeper);
  await assert.rejects(
    queryAsUser(musician, `INSERT INTO public.notifications (user_id, type) VALUES ($1, 'recording_shared')`, [gatekeeper]),
    /permission denied|row-level security/,
  );
});

When('the member revokes the share', async function (this: object) {
  const db = await seedDb();
  await db.query('DELETE FROM public.recording_shares WHERE recording_id = $1 AND shared_with_user_id = $2', [
    getState(this).recordingId,
    await profileIdByEmail(SEEDED_EMAILS.musician),
  ]);
});

Then('the musician has no notification for that recording', async function (this: object) {
  const db = await seedDb();
  const { rows } = await db.query('SELECT id FROM public.notifications WHERE recording_id = $1 AND user_id = $2', [
    getState(this).recordingId,
    await profileIdByEmail(SEEDED_EMAILS.musician),
  ]);
  assert.equal(rows.length, 0);
});

/** Claims as `userId` without rolling back, so a later claim sees the first one. */
async function claimAs(userId: string, recordingId: string, recipientId: string) {
  const db = await seedDb();
  await db.query(`SELECT set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: userId, role: 'authenticated' })]);
  await db.query('SET LOCAL ROLE authenticated');
  try {
    const { rows } = await db.query<{ recipient_email: string }>(
      'SELECT * FROM public.claim_recording_share_email($1, $2)',
      [recordingId, recipientId],
    );
    return rows;
  } finally {
    await db.query('RESET ROLE');
  }
}

Then('the gatekeeper cannot claim the share email', async function (this: object) {
  const rows = await claimAs(
    await profileIdByEmail(SEEDED_EMAILS.gatekeeper),
    getState(this).recordingId!,
    await profileIdByEmail(SEEDED_EMAILS.musician),
  );
  assert.equal(rows.length, 0);
});

Then("the member claims the share email once with the musician's address", async function (this: object) {
  const rows = await claimAs(
    await profileIdByEmail(SEEDED_EMAILS.member),
    getState(this).recordingId!,
    await profileIdByEmail(SEEDED_EMAILS.musician),
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].recipient_email, SEEDED_EMAILS.musician);
});

Then(/^(?:a second claim by the member|the member's claim of the share email) returns nothing$/, async function (this: object) {
  const rows = await claimAs(
    await profileIdByEmail(SEEDED_EMAILS.member),
    getState(this).recordingId!,
    await profileIdByEmail(SEEDED_EMAILS.musician),
  );
  assert.equal(rows.length, 0);
});
