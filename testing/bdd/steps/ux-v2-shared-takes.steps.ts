// Story 6.1.15 / G4.2 (#399) — docs/testing/ux-v2-shared-takes.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { partitionTakes, sharedByName } from '../../../lib/songs/partitionTakes';
import type { UserRecording } from '../../../lib/actions/rehearsal';

interface World {
  takes: UserRecording[];
  owners: Map<string, string>;
  result: ReturnType<typeof partitionTakes>;
}

const take = (name: string, mine: boolean): UserRecording => ({
  id: name,
  user_id: mine ? 'me' : 'owner',
  song_version_id: 'v-1',
  recording_name: name,
  storage_path: `p/${name}`,
  created_at: '2026-11-05T10:00:00Z',
  is_owner: mine,
  is_shared: !mine,
});

Given('I own the takes {string} and {string}', function (this: World, a: string, b: string) {
  this.takes = [...(this.takes ?? []), take(a, true), take(b, true)];
});

Given('{string} shared the take {string} with me', function (this: World, owner: string, name: string) {
  this.takes = [...(this.takes ?? []), take(name, false)];
  this.owners = this.owners ?? new Map();
  this.owners.set(name, owner);
});

When('the Record tab lists the takes', function (this: World) {
  this.result = partitionTakes(this.takes);
});

Then('{string} lists {string} and {string}', function (this: World, section: string, a: string, b: string) {
  assert.equal(section, 'My takes');
  assert.deepEqual(this.result.mine.map((r) => r.recording_name), [a, b]);
});

Given('{string} made the take {string} public', function (this: World, _owner: string, name: string) {
  this.takes = [...(this.takes ?? []), { ...take(name, false), is_public: true, is_shared: false }];
});

Then('{string} lists {string}', function (this: World, section: string, name: string) {
  const list = section === 'Shared with me' ? this.result.shared : section === 'Public takes' ? this.result.public : null;
  assert.ok(list, `unknown section ${section}`);
  assert.deepEqual(list.map((r) => r.recording_name), [name]);
});

Then('a sharer without a full name is not named', function () {
  assert.equal(sharedByName({ full_name: null, email: 'nina@example.org' }), null);
});

Then('{string} is not listed under {string}', function (this: World, name: string, section: string) {
  assert.equal(section, 'My takes');
  assert.ok(!this.result.mine.some((r) => r.recording_name === name));
});

Then('the shared row shows {string}', function (this: World, text: string) {
  const row = this.result.shared[0];
  const owner = this.owners.get(row.recording_name)!;
  assert.equal(text, `Shared by ${sharedByName({ full_name: owner, email: '' })}`);
});

Then('there is no {string} section', function (this: World, section: string) {
  assert.equal(section, 'Shared with me');
  assert.equal(this.result.shared.length, 0);
});
