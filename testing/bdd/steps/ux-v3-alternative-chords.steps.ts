// Story 6.2.16 / G4.2 (#519) — docs/testing/ux-v3-alternative-chords.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { splitAlternativeChords } from '../../../lib/chordProParsing';
import { transposeChordPro } from '../../../lib/reader/transpose';

interface State {
  chord: string;
  shown: string;
}
const state = new WeakMap<object, State>();
const get = (w: object): State => {
  let s = state.get(w);
  if (!s) {
    s = { chord: '', shown: '' };
    state.set(w, s);
  }
  return s;
};

Given('the chord {string}', function (this: object, chord: string) {
  get(this).chord = chord;
});

When('I transpose +{int}', function (this: object, semitones: number) {
  const s = get(this);
  s.shown = transposeChordPro(`[${s.chord}]x`, semitones).slice(1, -2);
});

Then('it shows {string}', function (this: object, chord: string) {
  assert.equal(get(this).shown, chord);
});

Then('{string} is two alternatives {string} and {string}', function (chord: string, a: string, b: string) {
  assert.deepEqual(splitAlternativeChords(chord), [a, b]);
});

Then('{string} is one chord with a bass note', function (chord: string) {
  assert.equal(splitAlternativeChords(chord), null);
});
