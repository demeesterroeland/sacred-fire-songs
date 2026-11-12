// Story 6.2.8 / G1.3 (#511) — docs/testing/ux-v3-about-this-song.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { songNoteParagraphs } from '../../../lib/songs/songNote';

interface State {
  notes: Map<string, string>;
  current: string;
  open: boolean;
}
const state = new WeakMap<object, State>();
const get = (w: object): State => {
  let s = state.get(w);
  if (!s) {
    s = { notes: new Map(), current: '', open: false };
    state.set(w, s);
  }
  return s;
};

const shown = (s: State) => songNoteParagraphs(s.notes.get(s.current)).length > 0;

Given('a version with the song note {string}', function (this: object, note: string) {
  const s = get(this);
  s.notes = new Map([['', note]]);
  s.current = '';
  s.open = false;
});

Given('a version with the song note:', function (this: object, note: string) {
  const s = get(this);
  s.notes = new Map([['', note]]);
  s.current = '';
  s.open = false;
});

Given('version {string} with the song note {string}', function (this: object, name: string, note: string) {
  get(this).notes.set(name, note);
});

When('I switch to version {string}', function (this: object, name: string) {
  const s = get(this);
  s.current = name;
  // The page keys the panel by version: every version starts collapsed.
  s.open = false;
});

When('I open it', function (this: object) {
  const s = get(this);
  assert.ok(shown(s), 'the panel must be shown before it can be opened');
  s.open = true;
});

Then('{string} is shown collapsed', function (this: object, label: string) {
  const s = get(this);
  assert.equal(label, 'About this song');
  assert.ok(shown(s), 'the panel should be shown');
  assert.equal(s.open, false, 'the panel should start collapsed');
});

Then('{string} is not shown', function (this: object, label: string) {
  assert.equal(label, 'About this song');
  assert.equal(shown(get(this)), false, 'the panel should be hidden');
});

Then('the note is shown', function (this: object) {
  const s = get(this);
  assert.ok(shown(s) && s.open, 'the note should be visible once opened');
});

Then('the note has {int} paragraphs', function (this: object, count: number) {
  const s = get(this);
  assert.equal(songNoteParagraphs(s.notes.get(s.current)).length, count);
});
