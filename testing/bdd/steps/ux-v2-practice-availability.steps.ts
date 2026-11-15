// Story 6.1.40 / G4 (#586) — docs/testing/ux-v2-practice-availability.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { practiceAvailability, type PracticeAvailability } from '../../../lib/song/practiceAvailability';

interface World {
  isMember: boolean;
  providerCount: number;
  takeCount: number;
  availability: PracticeAvailability;
}

Given('I am a member', function (this: World) {
  this.isMember = true;
});

Given('I am a guest', function (this: World) {
  this.isMember = false;
});

Given('the song has {int} reference links and {int} takes I can open', function (this: World, links: number, takes: number) {
  this.providerCount = links;
  this.takeCount = takes;
});

When('I view the song', function (this: World) {
  this.availability = practiceAvailability({ providerCount: this.providerCount, takeCount: this.takeCount, isMember: this.isMember });
});

Then('the Practice button shows the availability dot', function (this: World) {
  assert.equal(this.availability.available, true);
});

Then('the Practice button shows no availability dot', function (this: World) {
  assert.equal(this.availability.available, false);
});

Then('the {word} tab shows {int}', function (this: World, tab: string, count: number) {
  assert.equal(tab === 'Listen' ? this.availability.listen : this.availability.record, count);
});

Then('the {word} tab shows no count', function (this: World, tab: string) {
  assert.equal(tab === 'Listen' ? this.availability.listen : this.availability.record, 0);
});
