// Story 6.1.17 / G4.4 (#401) — docs/testing/ux-v2-take-actions.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { takeActionGroups, takeHasActionSheet, type TakeActionGroup, type TakeActionId } from '../../../lib/songs/takeActions';
import { shouldDismissSheet } from '../../../lib/design/swipeDismiss';
import { DICTIONARIES, SUPPORTED_LOCALES } from '../../../lib/i18n';

interface World {
  take: { is_owner?: boolean; is_shared?: boolean };
  groups: TakeActionGroup[];
}

const en = DICTIONARIES.en as Record<string, string>;
const LABEL_KEYS: Record<TakeActionId, string> = {
  play: 'rehearsal.recording.play',
  rename: 'rehearsal.recording.edit.ariaLabel',
  download: 'rehearsal.recording.download.ariaLabel',
  share: 'recording.sharing.button',
  singer: 'recording.attribution.button',
  visibility: 'recording.publish.makePublic',
  copyLink: 'rehearsal.recording.copyLink',
  delete: 'rehearsal.recording.delete.ariaLabel',
};
const text = (g: TakeActionGroup) => g.actions.map((a) => en[LABEL_KEYS[a]]).join(', ');

Given('a take that I own', function (this: World) {
  this.take = { is_owner: true };
});

Given('a take that someone shared with me', function (this: World) {
  this.take = { is_owner: false, is_shared: true };
});

When('I list the actions of the take', function (this: World) {
  this.groups = takeActionGroups(this.take, { canCopyLink: true });
});

Then(
  'the action groups are {string}, {string} and {string}',
  function (this: World, a: string, b: string, c: string) {
    assert.deepEqual(this.groups.map(text), [a, b, c]);
  }
);

Then('the action groups are {string}', function (this: World, a: string) {
  assert.deepEqual(this.groups.map(text), [a]);
});

Then('{string} is alone in the last group', function (this: World, label: string) {
  const last = this.groups[this.groups.length - 1];
  assert.equal(text(last), label);
  assert.equal(this.groups.filter((g) => g.actions.includes('delete')).length, 1);
});

Then('the take opens no action sheet', function (this: World) {
  assert.equal(takeHasActionSheet(this.take), false);
});

Then('a swipe of {int} px down closes the sheet', function (px: number) {
  assert.equal(shouldDismissSheet(px, 500), true);
});

Then('a tap on the handle keeps the sheet open', function () {
  assert.equal(shouldDismissSheet(0, 60), false);
});

Then('every language has the texts of the take actions', function () {
  for (const locale of SUPPORTED_LOCALES) {
    const dict = DICTIONARIES[locale] as Record<string, string>;
    for (const key of [...Object.values(LABEL_KEYS), 'recording.publish.makePrivate', 'rehearsal.recording.pause']) {
      assert.ok(dict[key], `${locale}: ${key}`);
    }
  }
});
