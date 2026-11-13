// Story 6.1.19 / G4.6 (#403) — docs/testing/ux-v2-shared-with-me.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import en from '../../../messages/en';
import { GUEST_GATE_FEATURES } from '../../../lib/auth/guestGate';
import { recordingPermalink } from '../../../lib/songs/recordingLink';
import {
  buildSharedWithMe,
  markSongNotificationsReadInCache,
  unreadSharedCount,
  type SharedTake,
} from '../../../lib/notifications/sharedWithMe';
import type { AppNotification } from '../../../lib/notifications/queries';
import { profileIdByEmail, queryAsUser, seedDb } from '../support/db';

const SEEDED = {
  member: 'member@sfs.example',
  musician: 'expert@sfs.example',
  gatekeeper: 'gatekeeper@sfs.example',
} as const;

interface World {
  list?: SharedTake[];
  shareInput?: { sharer: string; take: string; song: string };
  unread?: number;
  notes?: AppNotification[];
  recordingId?: string;
  compositionId?: string;
}

const note = (over: Partial<AppNotification>): AppNotification => ({
  id: 'n',
  type: 'recording_shared',
  composition_id: 'song-1',
  recording_id: 'rec-1',
  metadata: {},
  read_at: null,
  created_at: '2026-11-05T10:00:00Z',
  ...over,
});

// ─── @unit ─────────────────────────────────────────────────────────────────────

Given('{string} shared the take {string} of {string} with me', function (this: World, sharer: string, take: string, song: string) {
  this.shareInput = { sharer, take, song };
});

Given("I have not opened that song's Practice drawer", function (this: World) {
  this.notes = [note({})];
});

When('I open {string}', function (this: World, page: string) {
  assert.equal(page, 'Shared with me');
  const s = this.shareInput!;
  this.list = buildSharedWithMe(
    [{
      id: 's1',
      recording_id: 'rec-1',
      created_at: '2026-11-05T10:00:00Z',
      user_recordings: {
        id: 'rec-1',
        user_id: 'u-sharer',
        recording_name: s.take,
        song_versions: { composition_id: 'song-1', compositions: { title: s.song } },
      },
    }],
    new Map([['u-sharer', { full_name: s.sharer, email: 'x@example.org' }]]),
    this.notes ?? [],
  );
});

Then('the list shows {string} shared by {string} with the take {string}', function (this: World, song: string, by: string, take: string) {
  assert.equal(this.list!.length, 1);
  assert.deepEqual(
    [this.list![0].songTitle, this.list![0].sharedBy, this.list![0].takeName],
    [song, by, take],
  );
});

Then('the take opens through its link {string}', function (this: World, link: string) {
  assert.equal(recordingPermalink(this.list![0].recordingId), link.replace(/\\\//g, '/'));
});

Then('the row says {string}', function (this: World, word: string) {
  assert.equal(word, en['sharedWithMe.new']);
  assert.equal(this.list![0].unread, true);
});

Given('I have {int} unread shared-take notifications', function (this: World, n: number) {
  this.notes = Array.from({ length: n }, (_, i) => note({ id: `n${i}` }));
});

Then('the account menu entry reads {string} with {string}', function (this: World, label: string, count: string) {
  assert.equal(label, en['sharedWithMe.title']);
  assert.equal(en['sharedWithMe.unreadCount'].replace('{count}', String(unreadSharedCount(this.notes))), count);
});

Then('no unread count shows when there is none', function () {
  assert.equal(unreadSharedCount([note({ read_at: '2026-11-05T11:00:00Z' })]), 0);
  assert.equal(unreadSharedCount([]), 0);
});

Given('I have an unread notification about {string} and one about {string}', function (this: World, a: string, b: string) {
  this.notes = [note({ id: 'a', composition_id: a }), note({ id: 'b', composition_id: b })];
});

When("I open the Practice drawer of {string}", function (this: World, song: string) {
  this.notes = markSongNotificationsReadInCache(this.notes!, song, '2026-11-05T12:00:00Z');
});

Then('the notification about {string} is read', function (this: World, song: string) {
  assert.ok(this.notes!.find((n) => n.composition_id === song)!.read_at);
});

Then('the notification about {string} is still unread', function (this: World, song: string) {
  assert.equal(this.notes!.find((n) => n.composition_id === song)!.read_at, null);
});

Then('the {string} page is a members-only screen with a sign-in gate', function (page: string) {
  assert.equal(page, 'Shared with me');
  assert.ok((GUEST_GATE_FEATURES as readonly string[]).includes('sharedWithMe'));
  assert.ok(en['guestGate.sharedWithMe.title'] && en['guestGate.sharedWithMe.reason']);
});

// ─── @seed: RLS (rolled-back transaction) ──────────────────────────────────────

Given('the member owns a take and shares it with the musician', async function (this: World) {
  const db = await seedDb();
  const member = await profileIdByEmail(SEEDED.member);
  const musician = await profileIdByEmail(SEEDED.musician);
  const { rows } = await db.query<{ id: string; composition_id: string }>(
    `SELECT ur.id, sv.composition_id FROM public.user_recordings ur
       JOIN public.song_versions sv ON sv.id = ur.song_version_id
      WHERE ur.user_id = $1 ORDER BY ur.created_at LIMIT 1`,
    [member],
  );
  if (!rows[0]) throw new Error('The seeded member has no takes. Run: npx supabase db reset');
  this.recordingId = rows[0].id;
  this.compositionId = rows[0].composition_id;
  await db.query('DELETE FROM public.recording_shares WHERE recording_id = $1 AND shared_with_user_id = $2', [this.recordingId, musician]);
  await db.query('INSERT INTO public.recording_shares (recording_id, shared_with_user_id) VALUES ($1, $2)', [this.recordingId, musician]);
});

Then('the musician sees one share and one unread notification for that take', async function (this: World) {
  const musician = await profileIdByEmail(SEEDED.musician);
  const shares = await queryAsUser(musician, 'SELECT id FROM public.recording_shares WHERE recording_id = $1 AND shared_with_user_id = $2', [this.recordingId, musician]);
  assert.equal(shares.length, 1);
  const notes = await queryAsUser<{ read_at: string | null }>(
    musician,
    'SELECT read_at FROM public.notifications WHERE recording_id = $1',
    [this.recordingId],
  );
  assert.equal(notes.length, 1);
  assert.equal(notes[0].read_at, null);
});

Then('the gatekeeper sees no share and no notification for that take', async function (this: World) {
  const gatekeeper = await profileIdByEmail(SEEDED.gatekeeper);
  const shares = await queryAsUser(gatekeeper, 'SELECT id FROM public.recording_shares WHERE recording_id = $1', [this.recordingId]);
  const notes = await queryAsUser(gatekeeper, 'SELECT id FROM public.notifications WHERE recording_id = $1', [this.recordingId]);
  assert.equal(shares.length, 0);
  assert.equal(notes.length, 0);
});

Then("the musician can mark the song's notifications read", async function (this: World) {
  const musician = await profileIdByEmail(SEEDED.musician);
  const updated = await queryAsUser(
    musician,
    'UPDATE public.notifications SET read_at = now() WHERE composition_id = $1 AND read_at IS NULL RETURNING id',
    [this.compositionId],
  );
  assert.ok(updated.length >= 1);
});
