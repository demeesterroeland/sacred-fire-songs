// #566 — docs/testing/ux-v3-chord-tools.feature (@unit scenarios)
import { Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parseChordProForDisplay } from '../../../lib/chordUtils';
import { chordTools } from '../../../lib/reader/chordTools';
import { canTranspose, shiftSemitones, transposeChordPro, transposeKey } from '../../../lib/reader/transpose';
import { technicalItems, type VersionTechnical } from '../../../lib/songs/songMeta';
import { DICTIONARIES, SUPPORTED_LOCALES } from '../../../lib/i18n';

type Translate = Parameters<typeof technicalItems>[1];
const en = DICTIONARIES.en as Record<string, string>;
const t = ((key: string, vars?: Record<string, string | number>) =>
  (en[key] ?? key).replace(/\{(\w+)\}/g, (_, name: string) => String(vars?.[name] ?? `{${name}}`))) as unknown as Translate;

const LYRICS = 'Down to the river we go';
interface World {
  version: VersionTechnical;
  hasChords: boolean;
  role: string;
  chordsPref: boolean;
  semitones: number;
  content: string;
}
const worlds = new WeakMap<object, World>();
const world = (w: object): World => {
  let s = worlds.get(w);
  if (!s) {
    s = { version: {}, hasChords: true, role: 'musician', chordsPref: true, semitones: 0, content: `[D]Down to the [G]river we [A]go` };
    worlds.set(w, s);
  }
  return s;
};
const tools = (w: object) => {
  const s = world(w);
  return chordTools({ shownHasChords: s.hasChords, chordsPref: s.chordsPref, mayTranspose: canTranspose(s.role) && s.hasChords });
};
/** What the page passes the meta line: the version with the transposed key, and whether chords are on. */
const metaLine = (w: object) => {
  const s = world(w);
  const shown = { ...s.version, key: transposeKey(s.version.key, s.semitones) };
  return technicalItems(shown, t, { chordsOn: tools(w).showChordDetails }).join(' · ');
};

Given('a reader on a song in key D with tuning Drop D', function (this: object) {
  world(this).version = { key: 'D', capo: null, tuning: 'Drop D' };
});
Given('a reader on the same song', function (this: object) {
  const s = world(this);
  s.version = { key: 'D', capo: null, tuning: 'Drop D' };
});
Given('a member on a song in key D with tuning Drop D', function (this: object) {
  world(this).version = { key: 'D', capo: null, tuning: 'Drop D' };
  world(this).role = 'member';
});
Given('a reader on a song in key D with tuning Drop D and beats {string}', function (this: object, beats: string) {
  world(this).version = { key: 'D', capo: null, tuning: 'Drop D', beats };
});
Given('a reader opens the song page ⋮ menu', function () {});
Given('a song without chords', function (this: object) {
  const s = world(this);
  s.hasChords = false;
  s.chordsPref = true; // the stored preference does not matter without chords
  s.version = { key: 'D', capo: null, tuning: 'Drop D' };
  s.content = LYRICS;
});
Given('a version in key D with capo 2, tuning Drop D and beats {string}', function (this: object, beats: string) {
  world(this).version = { key: 'D', capo: 2, tuning: 'Drop D', beats };
});

// Given or When: the switch is on; a scenario that starts here reads the song in key D with tuning Drop D.
When('the Chords switch is on', function (this: object) {
  const s = world(this);
  if (!s.version.key) s.version = { key: 'D', capo: null, tuning: 'Drop D' };
  s.chordsPref = true;
});
When('they switch Chords off', function (this: object) {
  world(this).chordsPref = false;
});
When('the reader taps transpose {string} twice', function (this: object, sign: string) {
  const s = world(this);
  assert.equal(sign, '+');
  s.semitones = shiftSemitones(shiftSemitones(s.semitones, 1), 1);
});

Then('the toolbar shows the transpose stepper next to the Chords switch', function (this: object) {
  assert.equal(tools(this).showStepper, true);
  // Next to the switch: the toolbar renders the stepper straight after it (RTL: ReaderToolbar.test.tsx).
  const toolbar = fs.readFileSync(path.resolve(__dirname, '../../../components/song/ReaderToolbar.tsx'), 'utf8');
  const at = (needle: string) => toolbar.indexOf(needle);
  assert.ok(at("role=\"switch\"") > 0 && at('<TransposeStepper') > at('role="switch"') && at('<TransposeStepper') < at('<span aria-hidden>A−'));
});
Then('the meta line shows {string}', function (this: object, expected: string) {
  assert.equal(metaLine(this), expected);
});
Then('the transpose stepper is hidden', function (this: object) {
  assert.equal(tools(this).showStepper, false);
});
Then('key, capo and tuning are hidden', function (this: object) {
  assert.equal(tools(this).showChordDetails, false);
  assert.equal(metaLine(this), '');
});
Then('the lyrics stay', function (this: object) {
  const text = parseChordProForDisplay(world(this).content)
    .flatMap((s) => s.lines.flatMap((l) => l.items.map((i) => i.lyrics ?? '')))
    .join('');
  assert.ok(text.includes('Down to the river we go'), text);
  // The page hides only the chord layer (SongDisplay: `chordsOn = hasChords && showChords`), never the lyrics.
});
Then('every chord is two semitones higher', function (this: object) {
  const s = world(this);
  assert.equal(s.semitones, 2);
  const chords = (c: string) => [...c.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]);
  assert.deepEqual(chords(transposeChordPro(s.content, s.semitones, { key: 'D' })), ['E', 'A', 'B']);
});
Then('it has no Transpose item', function () {
  const root = path.resolve(__dirname, '../../../');
  const menu = fs.readFileSync(path.join(root, 'components/song/SongMenuSheet.tsx'), 'utf8');
  const page = fs.readFileSync(path.join(root, 'app/songs/[id]/page.tsx'), 'utf8');
  assert.ok(!/viewer\.transpose|transpose/i.test(menu.replace(/\/\*[\s\S]*?\*\//g, '')), 'the menu has no transpose code');
  assert.ok(!/<SongMenuSheet[\s\S]*?transpose=/.test(page), 'the page passes no transpose to the menu');
});
Then('there is no Chords switch, no transpose stepper and no key line', function (this: object) {
  const s = world(this);
  // The switch shows for a song with chords only (ReaderToolbar `hasChords`); stepper and details need chords on.
  assert.equal(s.hasChords, false);
  assert.equal(tools(this).chordsOn, false);
  assert.equal(tools(this).showStepper, false);
  assert.equal(tools(this).showChordDetails, false);
  assert.equal(metaLine(this), '');
});
Then('the meta line shows only {string}', function (this: object, expected: string) {
  assert.equal(metaLine(this), expected);
});
Then('a screen that has no Chords switch \\(the PDF) gets {string}', function (this: object, expected: string) {
  assert.equal(technicalItems(world(this).version, t).join(' · '), expected);
});
Then('all languages have a tuning label with the tuning placeholder', function () {
  for (const l of SUPPORTED_LOCALES) {
    const d = DICTIONARIES[l as keyof typeof DICTIONARIES] as Record<string, string>;
    assert.ok(d['song.meta.tuning']?.includes('{tuning}'), `${l} song.meta.tuning keeps {tuning}`);
  }
});
