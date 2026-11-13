// #566 — docs/testing/ux-v3-chord-tools.feature (@unit scenarios)
import { Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parseChordProForDisplay } from '../../../lib/chordUtils';
import { chordTools } from '../../../lib/reader/chordTools';
import { shiftSemitones, transposeChordPro, transposeKey } from '../../../lib/reader/transpose';
import { readingState } from '../../../lib/songs/readingState';
import { technicalItems, type VersionTechnical } from '../../../lib/songs/songMeta';
import { BOTH_VIEW, TRANSLATION_VIEW, type LanguageChoice, type ReadingView, type SongTranslation } from '../../../lib/songs/translations';
import { DICTIONARIES, SUPPORTED_LOCALES } from '../../../lib/i18n';

type Translate = Parameters<typeof technicalItems>[1];
const en = DICTIONARIES.en as Record<string, string>;
const t = ((key: string, vars?: Record<string, string | number>) =>
  (en[key] ?? key).replace(/\{(\w+)\}/g, (_, name: string) => String(vars?.[name] ?? `{${name}}`))) as unknown as Translate;

const LYRICS = 'Down to the river we go';
const CHORD_CONTENT = '[D]Down to the [G]river we [A]go';
const DUTCH_LYRICS_ONLY: SongTranslation = { language: 'nl', title: null, lyrics: 'Naar de rivier gaan wij', translator: null };

interface World {
  songId: string;
  version: VersionTechnical & { content_chordpro?: string | null };
  translations: SongTranslation[];
  view: ReadingView | null;
  languageChoice: LanguageChoice | null;
  role: string | null;
  chordsPref: boolean;
  semitones: number;
}
const worlds = new WeakMap<object, World>();
const world = (w: object): World => {
  let s = worlds.get(w);
  if (!s) {
    s = {
      songId: 'song-1',
      version: { content_chordpro: CHORD_CONTENT },
      translations: [],
      view: null,
      languageChoice: null,
      role: 'musician',
      chordsPref: true,
      semitones: 0,
    };
    worlds.set(w, s);
  }
  return s;
};
const reading = (w: object) => {
  const s = world(w);
  return readingState({
    songId: s.songId,
    translations: s.translations,
    languageChoice: s.languageChoice,
    view: s.view,
    version: s.version,
    role: s.role,
    semitones: s.semitones,
    locale: 'en',
  });
};
const tools = (w: object) => {
  const s = world(w);
  const r = reading(w);
  return chordTools({ shownHasChords: r.shownHasChords, chordsPref: s.chordsPref, mayTranspose: r.mayTranspose });
};
/** What the page passes the meta line: the version with the transposed key, and whether chords are on. */
const metaLine = (w: object) => {
  const s = world(w);
  const r = reading(w);
  const shown = { ...s.version, key: transposeKey(s.version.key, r.shift) };
  return technicalItems(shown, t, { chordsOn: tools(w).showChordDetails }).join(' · ');
};

Given('a reader on a song in key D with tuning Drop D', function (this: object) {
  world(this).version = { key: 'D', capo: null, tuning: 'Drop D', content_chordpro: CHORD_CONTENT };
});
Given('a reader on a song in key Am with capo 2, tuning Standard and beats {string}', function (this: object, beats: string) {
  world(this).version = { key: 'Am', capo: 2, tuning: 'Standard', beats, content_chordpro: CHORD_CONTENT };
});
Given('a reader on the same song', function (this: object) {
  world(this).version = { key: 'D', capo: null, tuning: 'Drop D', content_chordpro: CHORD_CONTENT };
});
Given('a member on a song in key D with tuning Drop D', function (this: object) {
  const s = world(this);
  s.version = { key: 'D', capo: null, tuning: 'Drop D', content_chordpro: CHORD_CONTENT };
  s.role = 'member';
});
Given('a guest on a song in key D with tuning Drop D', function (this: object) {
  const s = world(this);
  s.version = { key: 'D', capo: null, tuning: 'Drop D', content_chordpro: CHORD_CONTENT };
  s.role = null;
});
Given(
  'a musician reading a song in key D with tuning Drop D and a lyrics-only Dutch translation in {string} view',
  function (this: object, viewLabel: string) {
    const s = world(this);
    s.role = 'musician';
    s.version = { key: 'D', capo: null, tuning: 'Drop D', content_chordpro: CHORD_CONTENT };
    s.translations = [DUTCH_LYRICS_ONLY];
    s.languageChoice = { songId: s.songId, language: 'nl' };
    s.view = viewLabel.toLowerCase() === 'both' ? BOTH_VIEW : TRANSLATION_VIEW;
  }
);
Given(
  'a musician reading a song in key D with tuning Drop D, beats {string} and a lyrics-only Dutch translation in {string} view',
  function (this: object, beats: string, viewLabel: string) {
    const s = world(this);
    s.role = 'musician';
    s.version = { key: 'D', capo: null, tuning: 'Drop D', beats, content_chordpro: CHORD_CONTENT };
    s.translations = [DUTCH_LYRICS_ONLY];
    s.languageChoice = { songId: s.songId, language: 'nl' };
    s.view = viewLabel.toLowerCase() === 'both' ? BOTH_VIEW : TRANSLATION_VIEW;
  }
);
Given('a reader on a song in key D with tuning Drop D and beats {string}', function (this: object, beats: string) {
  world(this).version = { key: 'D', capo: null, tuning: 'Drop D', beats, content_chordpro: CHORD_CONTENT };
});
Given('a reader opens the song page ⋮ menu', function () {});
Given('a song without chords', function (this: object) {
  const s = world(this);
  s.chordsPref = true; // the stored preference does not matter without chords
  s.version = { key: 'D', capo: null, tuning: 'Drop D', content_chordpro: LYRICS };
});
Given('a version in key D with capo 2, tuning Drop D and beats {string}', function (this: object, beats: string) {
  world(this).version = { key: 'D', capo: 2, tuning: 'Drop D', beats, content_chordpro: CHORD_CONTENT };
});

// Given or When: the switch is on; a scenario that starts here reads the song in key D with tuning Drop D.
When('the Chords switch is on', function (this: object) {
  const s = world(this);
  if (!s.version.key) s.version = { ...s.version, key: 'D', capo: null, tuning: 'Drop D' };
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
  assert.ok(at('role="switch"') > 0 && at('<TransposeStepper') > at('role="switch"') && at('<TransposeStepper') < at('<span aria-hidden>A−'));
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
  const text = parseChordProForDisplay(world(this).version.content_chordpro ?? '')
    .flatMap((s) => s.lines.flatMap((l) => l.items.map((i) => i.lyrics ?? '')))
    .join('');
  assert.ok(text.includes('Down to the river we go'), text);
  // The page hides only the chord layer (SongDisplay: `chordsOn = hasChords && showChords`), never the lyrics.
});
Then('every chord is two semitones higher', function (this: object) {
  const s = world(this);
  const r = reading(this);
  assert.equal(r.shift, 2);
  const chords = (c: string) => [...c.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]);
  assert.deepEqual(chords(transposeChordPro(s.version.content_chordpro ?? '', r.shift, { key: 'D' })), ['E', 'A', 'B']);
});
Then('it has no Transpose item', function () {
  const root = path.resolve(__dirname, '../../../');
  const menu = fs.readFileSync(path.join(root, 'components/song/SongMenuSheet.tsx'), 'utf8');
  const page = fs.readFileSync(path.join(root, 'app/songs/[id]/page.tsx'), 'utf8');
  assert.ok(!/viewer\.transpose|transpose/i.test(menu.replace(/\/\*[\s\S]*?\*\//g, '')), 'the menu has no transpose code');
  const start = page.indexOf('<SongMenuSheet');
  assert.ok(start >= 0, 'SongMenuSheet JSX tag is present on the song page');
  const end = page.indexOf('/>', start);
  assert.ok(end > start, 'SongMenuSheet JSX tag closes');
  assert.ok(!/\btranspose=/.test(page.slice(start, end)), 'the page passes no transpose prop to SongMenuSheet');
});
Then('there is no Chords switch, no transpose stepper and no key line', function (this: object) {
  const r = reading(this);
  const tl = tools(this);
  // Both readingState.shownHasChords (which feeds ReaderToolbar `hasChords`) and chordTools hide everything chord-related.
  assert.equal(r.shownHasChords, false);
  assert.equal(tl.chordsOn, false);
  assert.equal(tl.showStepper, false);
  assert.equal(tl.showChordDetails, false);
  assert.doesNotMatch(metaLine(this), /\b(Key|Capo|Tuning)\b/);
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
