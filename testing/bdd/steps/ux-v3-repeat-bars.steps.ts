// Story 6.2.15 (#518) — docs/testing/ux-v3-repeat-bars.feature (@unit scenarios)
import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { parseChordProForDisplay } from '../../../lib/chordUtils';
import { DICTIONARIES, SUPPORTED_LOCALES } from '../../../lib/i18n';

const contents = new WeakMap<object, string>();
const linesOf = (w: object) => parseChordProForDisplay(contents.get(w) ?? '').flatMap((s) => s.lines);

Given('a song with lines between start_of_repeat and end_of_repeat', function (this: object) {
  contents.set(this, 'Before\n{start_of_repeat}\nRise up\nFire burning\n{end_of_repeat}\nAfter');
});
Then('those lines are shown between repeat bars', function (this: object) {
  assert.deepEqual(
    linesOf(this).map((l) => l.repeat ?? null),
    [null, { start: true, end: false }, { start: false, end: true }, null]
  );
});

Given('a song whose repeat ends with {string}', function (this: object, end: string) {
  contents.set(this, `{start_of_repeat}\nRise up\n${end}`);
});
Then('the repeat is marked to be sung {int} times', function (this: object, times: number) {
  const mark = linesOf(this).find((l) => l.repeat?.end)?.repeat;
  assert.ok(mark);
  assert.equal(mark.times, times);
});

Given('a song with a repeat, with its chords written over the lyrics', function (this: object) {
  contents.set(this, '{start_of_repeat}\nAm      G\nRise up fire\n{end_of_repeat: x2}\nAfter');
});
Then('the repeated lines are marked, whatever the chord layout', function (this: object) {
  const [line, after] = linesOf(this);
  assert.deepEqual(line.repeat, { start: true, end: true, times: 2 });
  assert.equal(after.repeat, undefined);
  // The mark is parsed from the text, not from the chords; the chords-on/off rendering is covered in repeatBarsDisplay.test.tsx.
  assert.ok(line.items.some((i) => i.lyrics?.includes('Rise')));
});

Then('all languages have text for the repeat bars', function () {
  for (const l of SUPPORTED_LOCALES) {
    const d = DICTIONARIES[l as keyof typeof DICTIONARIES] as Record<string, string>;
    for (const key of ['song.repeat.start', 'song.repeat.end', 'song.repeat.endTimes']) assert.ok(d[key], `${l} ${key}`);
    assert.ok(d['song.repeat.endTimes'].includes('{count}'), `${l} keeps {count}`);
  }
});
