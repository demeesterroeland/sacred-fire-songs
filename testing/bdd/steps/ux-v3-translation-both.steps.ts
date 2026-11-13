// Story 6.2.14 (#517) — docs/testing/ux-v3-translation-both.feature
import { Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { DICTIONARIES } from '../../../lib/i18n';
import { lyricPx, stepBy } from '../../../lib/reader/readerPrefs';
import { DEFAULT_LYRIC_STEP } from '../../../lib/design/tokens';
import { bilingualRows, type BilingualRow } from '../../../lib/songs/stanzas';
import {
  languageChangeSearch,
  readingState,
  staleReadingSearch,
  viewChangeSearch,
  type ReadingState,
} from '../../../lib/songs/readingState';
import {
  LANGUAGE_PARAM,
  ORIGINAL_VIEW,
  VIEW_PARAM,
  languageOptions,
  linkedLanguageChoice,
  linkedReadingView,
  readingViewOptions,
  type LanguageChoice,
  type ReadingView,
  type SongTranslation,
} from '../../../lib/songs/translations';
import { versionSearch, versionShareUrl } from '../../../lib/songs/versionSwitch';
import { profileIdByEmail, queryAsAnon, seedDb } from '../support/db';
import { SEEDED_EMAILS } from './access-policies.steps';

const t = (k: string) => (DICTIONARIES.en as Record<string, string>)[k] ?? k;
const SONG = 'song-517';

/** The song page: the choices it holds (taps, else the address) and the address itself. */
interface State {
  original: string;
  translations: SongTranslation[];
  choice: LanguageChoice | null;
  view: ReadingView | null;
  search: string;
  step: number;
  chords: boolean;
  role: string | null;
  semitones: number;
  translator: string | null;
}
const states = new WeakMap<object, State>();
const get = (w: object): State => {
  if (!states.has(w)) {
    states.set(w, {
      original: '',
      translations: [],
      choice: null,
      view: null,
      search: '',
      step: DEFAULT_LYRIC_STEP,
      chords: true,
      role: null,
      semitones: 0,
      translator: null,
    });
  }
  return states.get(w)!;
};

const stanzaText = (lines: string[]) => lines.join('\n\n');
const QUECHUA = stanzaText(['Pachamama sumaq\nkawsay', 'Inti tayta\nk’anchay']);
const ENGLISH = stanzaText(['Mother earth, beautiful\nlife', 'Father sun\nlight']);
const DUTCH = stanzaText(['Moeder aarde, mooi\nleven', 'Vader zon\nlicht']);

/** What the song page reads, by the page's own rules (`readingState`). */
const reading = (s: State, view: ReadingView | null = s.view): ReadingState =>
  readingState({
    songId: SONG,
    translations: s.translations,
    languageChoice: s.choice,
    view,
    version: { content_chordpro: s.original },
    role: s.role,
    semitones: s.semitones,
    locale: 'en',
  });
/** The rows of "Both", as the page passes them to `SongBilingualDisplay` (the original with its chords flag). */
const rows = (s: State): BilingualRow[] => {
  const r = reading(s);
  assert.ok(r.showBoth && r.translation, 'the reader is not on Both');
  return bilingualRows(s.original, r.translation.lyrics ?? '', {
    language: r.translation.language,
    step: s.step,
    hasChords: r.shownHasChords,
    showChords: s.chords,
  });
};
const withTranslations = (s: State, original: string, translations: SongTranslation[]) => {
  s.original = original;
  s.translations = translations.map((tr) => ({ translator: s.translator, ...tr }));
};
/** The page opened with `search`: the address feeds the choices, then stale values are replaced (once the song loads). */
const open = (s: State, search: string) => {
  const params = new URLSearchParams(search);
  s.choice = linkedLanguageChoice(SONG, params.get(LANGUAGE_PARAM));
  s.view = linkedReadingView(params.get(VIEW_PARAM));
  s.search = staleReadingSearch(search, reading(s)) ?? search;
};
/** A tap on the view switch, as `selectReadingView` on the page: the language read (or last read) stays chosen. */
const pickView = (s: State, view: ReadingView) => {
  const next = reading(s, view);
  const language = next.language ?? reading(s).language;
  if (language) s.choice = { songId: SONG, language };
  s.view = view;
  s.search = viewChangeSearch(s.search, view, next.language);
};

// ── Given ─────────────────────────────────────────────────────────────────────

Given(/^a song with a translation on a (?:375 px|desktop) screen$/, function (this: object) {
  // The phone and desktop layouts draw the same rows: one column (original, then translation) or two (side by side).
  withTranslations(get(this), QUECHUA, [{ language: 'en', lyrics: ENGLISH }]);
});
Given('a song with a Dutch and an English translation', function (this: object) {
  withTranslations(get(this), QUECHUA, [{ language: 'en', lyrics: ENGLISH }, { language: 'nl', lyrics: DUTCH }]);
});
Given('a song with a Dutch and an English translation opened with {string}', function (this: object, search: string) {
  const s = get(this);
  withTranslations(s, QUECHUA, [{ language: 'en', lyrics: ENGLISH }, { language: 'nl', lyrics: DUTCH }]);
  open(s, search);
});
Given(
  'a song whose original has {int} stanzas and whose translation has {int}',
  function (this: object, originals: number, translations: number) {
    withTranslations(
      get(this),
      stanzaText(Array.from({ length: originals }, (_v, i) => `Original stanza ${i + 1}`)),
      [{ language: 'en', lyrics: stanzaText(Array.from({ length: translations }, (_v, i) => `Translated stanza ${i + 1}`)) }]
    );
  }
);
Given(
  'a song whose original starts with a chord intro before 2 stanzas, with a translation of 2 stanzas',
  function (this: object) {
    withTranslations(get(this), `[G] [C] [D]\n\n${QUECHUA}`, [{ language: 'en', lyrics: ENGLISH }]);
  }
);
Given('a song without a translation', function (this: object) {
  withTranslations(get(this), QUECHUA, []);
});
Given('a song without a translation opened with {string}', function (this: object, search: string) {
  const s = get(this);
  withTranslations(s, QUECHUA, []);
  open(s, search);
});
Given('a song with chords and a translation with chords', function (this: object) {
  withTranslations(get(this), '[G]Pachamama [C]sumaq\n\n[D]Inti [G]tayta', [{ language: 'en', lyrics: '[G]Mother [C]earth\n\n[D]Father [G]sun' }]);
});
Given('a song with a Hebrew translation', function (this: object) {
  withTranslations(get(this), QUECHUA, [{ language: 'he', lyrics: 'אמא אדמה\n\nאבא שמש' }]);
});

// ── When ──────────────────────────────────────────────────────────────────────

When('I pick {string}', function (this: object, label: string) {
  const s = get(this);
  assert.ok(reading(s).viewSwitchVisible, 'no reader switch without a translation');
  const option = readingViewOptions(t).find((o) => o.label === label);
  assert.ok(option, `no option "${label}"`);
  pickView(s, option.value as ReadingView);
});
When('I tap the language {string}', function (this: object, language: string) {
  // `selectLanguage` on the page: the language switch is there, the view (Translation or Both) stays.
  const s = get(this);
  assert.ok(reading(s).languageSwitchVisible, 'no language switch on screen');
  const { search, view } = languageChangeSearch(s.search, language, reading(s).view);
  s.choice = { songId: SONG, language };
  s.view = view;
  s.search = search;
});
When('I switch the chords off', function (this: object) {
  get(this).chords = false;
});
When('I press {string}', function (this: object, label: string) {
  const s = get(this);
  assert.ok(label === 'A+' || label === 'A−', `unknown control ${label}`);
  s.step = stepBy(s.step, label === 'A+' ? 1 : -1);
});
When('I read another version of the song', function (this: object) {
  // `selectVersion` on the page: back to Original, the language being read is remembered.
  const s = get(this);
  const { language } = reading(s);
  if (language) s.choice = { songId: SONG, language };
  s.view = ORIGINAL_VIEW;
  s.search = versionSearch(s.search, 'v2', false);
});

// ── Then ──────────────────────────────────────────────────────────────────────

Then('each stanza is followed by its translation', function (this: object) {
  // One column on a phone: inside a row the original comes first, its translation right under it.
  const result = rows(get(this));
  assert.equal(result.length, 2);
  for (const row of result) {
    assert.ok(row.original && row.translation, 'a stanza without its translation');
  }
  const words = (row: BilingualRow) => row.translation!.section.lines.map((l) => l.items.map((i) => i.lyrics ?? '').join('')).join(' ');
  assert.match(words(result[0]), /^Mother earth/);
  assert.match(words(result[1]), /^Father sun/);
});
Then(
  'stanza {int} of the original and stanza {int} of the translation share a row',
  function (this: object, o: number, tr: number) {
    const result = rows(get(this));
    // Row indexes of the sung stanzas of one side, in order: stanza n is the n-th of them.
    const sungRows = (side: 'original' | 'translation') =>
      result.flatMap((row, i) => (row[side]?.section.lines.some((l) => l.items.some((it) => it.lyrics?.trim())) ? [i] : []));
    const row = sungRows('original')[o - 1];
    assert.notEqual(row, undefined, `no stanza ${o} in the original`);
    assert.equal(row, sungRows('translation')[tr - 1]);
  }
);
Then('{int} rows are shown', function (this: object, n: number) {
  assert.equal(rows(get(this)).length, n);
});
Then('the last row holds only the original', function (this: object) {
  const last = rows(get(this)).at(-1)!;
  assert.ok(last.original && !last.translation);
});
Then('the last row holds only the translation', function (this: object) {
  const last = rows(get(this)).at(-1)!;
  assert.ok(!last.original && last.translation);
});
Then('the intro has a row of its own', function (this: object) {
  const [first] = rows(get(this));
  assert.ok(first.original && !first.translation);
  assert.ok(first.original.section.lines.every((l) => l.items.every((i) => !i.lyrics?.trim())));
});
const chordsIn = (row: BilingualRow, side: 'original' | 'translation') =>
  !!row[side]?.chordsOn && row[side]!.section.lines.some((l) => l.items.some((i) => i.chords));
Then('the original shows its chords', function (this: object) {
  assert.ok(rows(get(this)).every((row) => chordsIn(row, 'original')));
});
Then('the translation shows no chords', function (this: object) {
  for (const row of rows(get(this))) {
    assert.equal(row.translation!.chordsOn, false);
    assert.ok(row.translation!.section.lines.every((l) => l.items.every((i) => !i.chords)));
  }
});
Then('no column shows chords', function (this: object) {
  assert.ok(rows(get(this)).every((row) => !row.original?.chordsOn && !row.translation?.chordsOn));
});
Then('both columns use the larger lyric size', function (this: object) {
  const s = get(this);
  assert.ok(lyricPx(s.step) > lyricPx(DEFAULT_LYRIC_STEP));
  for (const row of rows(s)) {
    assert.equal(row.original!.lyricPx, lyricPx(s.step));
    assert.equal(row.translation!.lyricPx, lyricPx(s.step));
  }
});
Then('the translation column has language {string} and direction {string}', function (this: object, lang: string, dir: string) {
  for (const row of rows(get(this))) assert.deepEqual([row.translation!.lang, row.translation!.dir], [lang, dir]);
});
Then('the original column has direction {string}', function (this: object, dir: string) {
  for (const row of rows(get(this))) assert.equal(row.original!.dir, dir);
});
Then('the address reads {string}', function (this: object, search: string) {
  assert.equal(get(this).search, search);
});
Then('the share link ends with {string}', function (this: object, search: string) {
  const s = get(this);
  const r = reading(s);
  const url = versionShareUrl(`https://x.test/songs/${SONG}${s.search}`, 'v1', true, r.language, r.view);
  assert.ok(url.endsWith(search), url);
});
Then('opening {string} shows both languages', function (this: object, search: string) {
  const s = get(this);
  const opened: State = { ...s };
  open(opened, search);
  assert.ok(rows(opened).length > 0);
  assert.equal(opened.search, search, 'the link was not clean');
});
Then('the reader shows no reader switch', function (this: object) {
  // `SongReadingViewSwitch visible={reading.viewSwitchVisible}`: no translation with lyrics, no switch (and no space).
  assert.equal(reading(get(this)).viewSwitchVisible, false);
});
Then('the reader shows no language switch', function (this: object) {
  const s = get(this);
  assert.equal(reading(s).languageSwitchVisible, false);
});
Then(
  'the reader switch offers {string}, {string} and {string} with {string} chosen',
  function (this: object, a: string, b: string, c: string, chosen: string) {
    const r = reading(get(this));
    assert.equal(r.viewSwitchVisible, true);
    const options = readingViewOptions(t);
    assert.deepEqual(options.map((o) => o.label), [a, b, c]);
    assert.equal(options.find((o) => o.value === r.view)?.label, chosen);
  }
);
Then('the language switch lists {string} and {string}', function (this: object, a: string, b: string) {
  const s = get(this);
  assert.equal(reading(s).languageSwitchVisible, true);
  assert.deepEqual(languageOptions(s.translations, 'en')!.map((o) => o.label), [a, b]);
});
Then('the reader shows the original language', function (this: object) {
  const r = reading(get(this));
  assert.deepEqual([r.view, r.translation, r.showBoth, r.readsOriginal], [ORIGINAL_VIEW, null, false, true]);
});
Then('the reader shows {string}', function (this: object, view: string) {
  assert.equal(reading(get(this)).view, view);
});
Then('the translation {string} is shown alone', function (this: object, language: string) {
  const r = reading(get(this));
  assert.deepEqual([r.language, r.showBoth, r.readsOriginal], [language, false, false]);
});
Then('both languages are shown with {string}', function (this: object, language: string) {
  const r = reading(get(this));
  assert.deepEqual([r.language, r.showBoth], [language, true]);
});

// Reading state on the page: transpose, source line, translator.
Given('a musician reading a song with chords and a translation by {string}', function (this: object, name: string) {
  const s = get(this);
  s.role = 'musician';
  s.translator = name;
  withTranslations(s, '[G]Pachamama [C]sumaq\n\n[D]Inti [G]tayta', [{ language: 'en', lyrics: 'Mother earth\n\nFather sun' }]);
});
When('I transpose {int} semitones up', function (this: object, n: number) {
  get(this).semitones = n;
});
Then('the original is transposed {int} semitones and its source line is shown', function (this: object, n: number) {
  const r = reading(get(this));
  assert.equal(r.mayTranspose, true);
  assert.equal(r.shift, n);
  assert.equal(r.showSource, true);
});
Then('the translation alone is not transposed and shows no source line', function (this: object) {
  const r = reading(get(this));
  assert.deepEqual([r.showBoth, r.readsOriginal, r.mayTranspose, r.shift, r.showSource], [false, false, false, 0, false]);
});
Then('the reader names the translator {string}', function (this: object, name: string) {
  assert.equal(reading(get(this)).translator, name);
});

// ── @seed ─────────────────────────────────────────────────────────────────────

const seededSongs = new WeakMap<object, string>();
const guestRows = new WeakMap<object, BilingualRow[]>();

Given(
  'a public song with a Quechua original of 2 stanzas and a Spanish translation of 3 stanzas',
  async function (this: object) {
    const db = await seedDb();
    const ownerId = await profileIdByEmail(SEEDED_EMAILS.member);
    const { rows: song } = await db.query<{ id: string }>(
      `INSERT INTO public.compositions (title, owner_id, is_public) VALUES ('BDD Both Languages', $1, true) RETURNING id`,
      [ownerId]
    );
    await db.query(
      `INSERT INTO public.song_versions (composition_id, version_name, version_kind, content_chordpro, key, capo, tuning)
       VALUES ($1, 'Standard', 'original', $2, 'G', 0, 'Standard')`,
      [song[0].id, '[G]Pachamama [C]sumaq\r\n\r\n[D]Inti [G]tayta']
    );
    await db.query(
      `INSERT INTO public.song_translations (composition_id, language, title, lyrics) VALUES ($1, 'es', 'Madre Tierra', $2)`,
      [song[0].id, 'Madre tierra hermosa\n\nPadre sol\n\nGracias']
    );
    seededSongs.set(this, song[0].id);
  }
);
When('a guest opens it with {string}', async function (this: object, label: string) {
  const id = seededSongs.get(this)!;
  const [version] = await queryAsAnon<{ content_chordpro: string }>(
    `SELECT content_chordpro FROM public.song_versions WHERE composition_id = $1`,
    [id]
  );
  const translations = await queryAsAnon<SongTranslation>(
    `SELECT language, title, lyrics, translator FROM public.song_translations WHERE composition_id = $1`,
    [id]
  );
  // No language in the link: Both opens the first (here the only) language.
  const r = readingState({ songId: id, translations, languageChoice: null, view: linkedReadingView(label), version, role: null, semitones: 0, locale: 'en' });
  const translation = r.translation;
  assert.ok(version && r.showBoth && translation, 'the guest cannot read the song or its translation');
  guestRows.set(
    this,
    bilingualRows(version.content_chordpro, translation.lyrics ?? '', { language: translation.language, step: DEFAULT_LYRIC_STEP, hasChords: true, showChords: true })
  );
});
Then('the guest sees {int} rows, the last holding only the Spanish stanza', function (this: object, n: number) {
  const result = guestRows.get(this)!;
  assert.equal(result.length, n);
  assert.ok(result.slice(0, -1).every((row) => row.original && row.translation));
  const last = result.at(-1)!;
  assert.ok(!last.original && last.translation?.lang === 'es');
});
