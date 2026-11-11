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
Then('the closing bar reads {string}', function (this: object, text: string) {
  const mark = linesOf(this).find((l) => l.repeat?.end)?.repeat;
  assert.ok(mark);
  assert.equal(`:‖ ×${mark.times}`, text);
});

Given('a song with a repeat, with its chords written over the lyrics', function (this: object) {
  contents.set(this, '{start_of_repeat}\nAm      G\nRise up fire\n{end_of_repeat: x2}\nAfter');
});
Then('the repeated lines are marked, with chords on or off', function (this: object) {
  const [line, after] = linesOf(this);
  assert.deepEqual(line.repeat, { start: true, end: true, times: 2 });
  assert.equal(after.repeat, undefined);
  // The mark does not depend on the chords: the lyrics of the repeated line are there in both cases.
  assert.ok(line.items.some((i) => i.lyrics?.includes('Rise')));
});

Then('all languages have text for the repeat bars', function () {
  for (const l of SUPPORTED_LOCALES) {
    const d = DICTIONARIES[l as keyof typeof DICTIONARIES] as Record<string, string>;
    for (const key of ['song.repeat.start', 'song.repeat.end', 'song.repeat.endTimes']) assert.ok(d[key], `${l} ${key}`);
    assert.ok(d['song.repeat.endTimes'].includes('{count}'), `${l} keeps {count}`);
  }
});
