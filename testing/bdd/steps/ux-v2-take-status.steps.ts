// Story 6.1.16 / G4.3 (#400) — docs/testing/ux-v2-take-status.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { takeStatusPills, type TakeStatusInput, type TakeStatusPill } from '../../../lib/songs/takeStatus';
import { DICTIONARIES, SUPPORTED_LOCALES } from '../../../lib/i18n';

interface World {
  take: TakeStatusInput;
  pills: TakeStatusPill[];
}

const en = DICTIONARIES.en as Record<string, string>;
const label = (p: TakeStatusPill) =>
  en[`recording.status.${p.kind}`].replace('{count}', String(p.count ?? ''));

Given('a public take shared with two people', function (this: World) {
  this.take = {
    is_owner: true,
    is_public: true,
    shared_with: [1, 2].map((i) => ({ id: `s${i}`, user_id: `u${i}`, email: `u${i}@example.org`, full_name: null })),
  };
});

Given('a take sung by {string} who has no account yet', function (this: World, name: string) {
  this.take = { is_owner: true, singer_name: name };
});

Given("someone else's public take sung by {string} who has no account yet", function (this: World, name: string) {
  this.take = { is_owner: false, is_public: true, singer_name: name };
});

Given('a take sung by the verified musician {string}', function (this: World, name: string) {
  this.take = {
    is_owner: true,
    singer_profile_id: 'p1',
    singer_profile: { id: 'p1', email: '', full_name: name, avatar_url: null, is_musician: true },
  };
});

Given('a private take that is not shared', function (this: World) {
  this.take = { is_owner: true, is_public: false, shared_with: [] };
});

When('the take row lists its status', function (this: World) {
  this.pills = takeStatusPills(this.take);
});

Then('its row shows the texts {string} and {string}', function (this: World, a: string, b: string) {
  assert.deepEqual(this.pills.map(label), [a, b]);
});

Then('its row shows the text {string}', function (this: World, text: string) {
  assert.deepEqual(this.pills.map(label), [text]);
});

Then('its row shows no status', function (this: World) {
  assert.deepEqual(this.pills, []);
});

Then('every language has the status texts, including the spoken share count', function () {
  for (const locale of SUPPORTED_LOCALES) {
    const d = DICTIONARIES[locale] as Record<string, string>;
    for (const kind of ['public', 'shared', 'sharedLabel', 'pending', 'verified']) {
      assert.ok(d[`recording.status.${kind}`], `${locale} recording.status.${kind}`);
    }
  }
});
