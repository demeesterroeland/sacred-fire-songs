// #604 — docs/testing/ux-v2-new-playlist-inline.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { inlineCreateIntent, type InlineCreateTrigger } from '../../../lib/playlists/inlineCreate';

interface World {
  inlineTitle: string;
  inlineCreated: string | null;
  inlineOpen: boolean;
}

function act(world: World, trigger: InlineCreateTrigger) {
  if (inlineCreateIntent(trigger, world.inlineTitle) === 'create') {
    world.inlineCreated = world.inlineTitle.trim();
  }
  world.inlineOpen = false;
}

Given(
  'I am logged in and the {string} field has the name {string} typed',
  function (this: World, _field: string, name: string) {
    this.inlineTitle = name;
    this.inlineCreated = null;
    this.inlineOpen = true;
  }
);

When('I click or tap outside the field', function (this: World) {
  act(this, 'blur');
});

When('I press Escape', function (this: World) {
  act(this, 'escape');
});

When('I press Enter', function (this: World) {
  act(this, 'enter');
});

When('I press Create', function (this: World) {
  act(this, 'create');
});

Then('no playlist is created', function (this: World) {
  assert.equal(this.inlineCreated, null);
});

Then('the field is closed', function (this: World) {
  assert.equal(this.inlineOpen, false);
});

Then('the playlist {string} is created', function (this: World, name: string) {
  assert.equal(this.inlineCreated, name);
});
