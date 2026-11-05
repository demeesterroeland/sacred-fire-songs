// Story 6.1.26 / G6.1 (#410) — docs/testing/ux-v2-guest-gate.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import en from '../../../messages/en';
import { DICTIONARIES, SUPPORTED_LOCALES } from '../../../lib/i18n';
import {
  GUEST_GATE_FEATURES,
  guestGateKeys,
  signInHref,
  type GuestGateFeature,
} from '../../../lib/auth/guestGate';
import { safeNextPath } from '../../../lib/auth/safeNext';
import { queryAsAnon, seedDb } from '../support/db';

interface GateState {
  next?: string;
  consented?: { id: string; path: string };
  unconsented?: { id: string; path: string };
  seen?: Array<{ id: string }>;
  seenPaths?: string[];
}
const state = new WeakMap<object, GateState>();
const get = (w: object) => {
  if (!state.has(w)) state.set(w, {});
  return state.get(w)!;
};

// ─── @unit ─────────────────────────────────────────────────────────────────────

Given('a signed-out guest', function (this: object) {
  get(this).next = undefined;
});

When('they open the members-only screen {string}', function (this: object, screen: string) {
  get(this).next = screen;
});

When('the screen asks to return to {string}', function (this: object, target: string) {
  get(this).next = target;
});

Then('a locked preview explains the {string} feature and offers {string}', function (this: object, feature: string, label: string) {
  assert.ok((GUEST_GATE_FEATURES as readonly string[]).includes(feature), `unknown feature ${feature}`);
  const keys = guestGateKeys(feature as GuestGateFeature);
  assert.ok(en[keys.title] && en[keys.reason], 'title and reason exist');
  assert.equal(en['guestGate.signIn'], label);
});

Then('the sign-in link is {string}', function (this: object, href: string) {
  assert.equal(signInHref(get(this).next), href);
});

When('a sign-in redirect receives the next target {string}', function (this: object, target: string) {
  get(this).next = target;
});

Then('it redirects to {string}', function (this: object, result: string) {
  assert.equal(safeNextPath(get(this).next), result);
});

Then('every GuestGate feature has a title and a reason in all supported locales', function () {
  for (const locale of SUPPORTED_LOCALES) {
    const dict = DICTIONARIES[locale] as Record<string, string | undefined>;
    for (const feature of GUEST_GATE_FEATURES) {
      const { title, reason } = guestGateKeys(feature);
      assert.ok(dict[title], `${locale} ${title}`);
      assert.ok(dict[reason], `${locale} ${reason}`);
    }
    assert.ok(dict['guestGate.signIn'], `${locale} guestGate.signIn`);
  }
});

// ─── @seed: UXD-2 anon RLS ─────────────────────────────────────────────────────

Given('a consented public take and a public take without singer consent', async function (this: object) {
  const db = await seedDb();
  const { rows } = await db.query<{ id: string; user_id: string; song_version_id: string }>(
    'SELECT id, user_id, song_version_id FROM public.user_recordings ORDER BY created_at LIMIT 1',
  );
  if (!rows[0]) throw new Error('No seeded recordings. Run: npx supabase db reset');
  const { user_id, song_version_id } = rows[0];
  const tag = Date.now();
  const insert = async (name: string, consent: boolean) => {
    const storagePath = `${user_id}/guest-gate-${tag}-${name}.webm`;
    const res = await db.query<{ id: string }>(
      `INSERT INTO public.user_recordings (user_id, song_version_id, recording_name, storage_path, is_public, singer_consent_confirmed)
       VALUES ($1, $2, $3, $4, true, $5) RETURNING id`,
      [user_id, song_version_id, `guest-gate ${name}`, storagePath, consent],
    );
    await db.query(
      `INSERT INTO storage.objects (bucket_id, name, owner) VALUES ('rehearsals', $1, $2)`,
      [storagePath, user_id],
    );
    return { id: res.rows[0].id, path: storagePath };
  };
  get(this).consented = await insert('consented', true);
  get(this).unconsented = await insert('unconsented', false);
});

When('a guest lists the public takes', async function (this: object) {
  get(this).seen = await queryAsAnon<{ id: string }>('SELECT id FROM public.user_recordings');
});

Then('the guest sees the consented take', function (this: object) {
  assert.ok(get(this).seen!.some((r) => r.id === get(this).consented!.id));
});

Then('the guest does not see the take without singer consent', function (this: object) {
  assert.ok(!get(this).seen!.some((r) => r.id === get(this).unconsented!.id));
});

When('a guest lists the audio files of public takes', async function (this: object) {
  const rows = await queryAsAnon<{ name: string }>(`SELECT name FROM storage.objects WHERE bucket_id = 'rehearsals'`);
  get(this).seenPaths = rows.map((r) => r.name);
});

Then('the guest can read the audio file of the consented take only', function (this: object) {
  const { seenPaths, consented, unconsented } = get(this);
  assert.ok(seenPaths!.includes(consented!.path));
  assert.ok(!seenPaths!.includes(unconsented!.path));
});
