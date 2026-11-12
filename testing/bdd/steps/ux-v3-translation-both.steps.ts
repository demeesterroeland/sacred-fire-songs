// Story 6.2.14 (#517) — docs/testing/ux-v3-translation-both.feature
import { Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { DICTIONARIES } from '../../../lib/i18n';
import { lyricPx, stepBy } from '../../../lib/reader/readerPrefs';
import { DEFAULT_LYRIC_STEP } from '../../../lib/design/tokens';
import { bilingualRows, type BilingualRow } from '../../../lib/songs/stanzas';
import {
  BOTH_VIEW,
  LANGUAGE_PARAM,
  TRANSLATION_VIEW,
  VIEW_PARAM,
  languageSearch,
  linkedLanguageChoice,
  linkedReadingView,
  readingViewOptions,
  resolveTranslation,
  viewSearch,
  type LanguageChoice,
  type ReadingView,
  type SongTranslation,
} from '../../../lib/songs/translations';
import { versionSearch, versionShareUrl } from '../../../lib/songs/versionSwitch';
import { profileIdByEmail, queryAsAnon, seedDb } from '../support/db';
import { SEEDED_EMAILS } from './access-policies.steps';

const t = (k: string) => (DICTIONARIES.en as Record<string, string>)[k] ?? k;
const SONG = 'song-517';

interface State {
  original: string;
  translations: SongTranslation[];
  choice: LanguageChoice | null;
  view: ReadingView;
  search: string;
  step: number;
  chords: boolean;
}
const states = new WeakMap<object, State>();
const get = (w: object): State => {
  if (!states.has(w)) {
    states.set(w, { original: '', translations: [], choice: null, view: TRANSLATION_VIEW, search: '', step: DEFAULT_LYRIC_STEP, chords: true });
  }
  return states.get(w)!;
};

const stanzaText = (lines: string[]) => lines.join('\n\n');
const QUECHUA = stanzaText(['Pachamama sumaq\nkawsay', 'Inti tayta\nk’anchay']);
const ENGLISH = stanzaText(['Mother earth, beautiful\nlife', 'Father sun\nlight']);

/** The translation the reader is on (what the page resolves); `null` = the original language. */
const translationOf = (s: State) => resolveTranslation(s.translations, s.choice, SONG);
/** The reader shows "Both" only with a translation chosen and the view on Both (the page's `showBoth`). */
const rows = (s: State): BilingualRow[] => {
  const tr = translationOf(s);
  assert.ok(tr && s.view === BOTH_VIEW, 'the reader is not on Both');
  return bilingualRows(s.original, tr.lyrics ?? '', { language: tr.language, step: s.step, hasChords: true, showChords: s.chords });
};
const chooseTranslation = (s: State, translation: SongTranslation) => {
  s.translations = [translation];
  s.choice = { songId: SONG, language: translation.language };
  s.search = languageSearch('', translation.language);
};

// ── Given ─────────────────────────────────────────────────────────────────────

Given(/^a song with a translation on a (?:375 px|desktop) screen$/, function (this: object) {
  // The phone and desktop layouts draw the same rows: one column (original, then translation) or two (side by side).
  const s = get(this);
  s.original = QUECHUA;
  chooseTranslation(s, { language: 'en', lyrics: ENGLISH });
});
Given(
  'a song whose original has {int} stanzas and whose translation has {int}',
  function (this: object, originals: number, translations: number) {
    const s = get(this);
    s.original = stanzaText(Array.from({ length: originals }, (_v, i) => `Original stanza ${i + 1}`));
    chooseTranslation(s, { language: 'en', lyrics: stanzaText(Array.from({ length: translations }, (_v, i) => `Translated stanza ${i + 1}`)) });
  }
);
Given(
  'a song whose original starts with a chord intro before 2 stanzas, with a translation of 2 stanzas',
  function (this: object) {
    const s = get(this);
    s.original = `[G] [C] [D]\n\n${QUECHUA}`;
    chooseTranslation(s, { language: 'en', lyrics: ENGLISH });
  }
);
Given('a song without a translation', function (this: object) {
  const s = get(this);
  s.original = QUECHUA;
  s.translations = [];
  s.choice = linkedLanguageChoice(SONG, 'en');
});
Given('a song with chords and a translation with chords', function (this: object) {
  const s = get(this);
  s.original = '[G]Pachamama [C]sumaq\n\n[D]Inti [G]tayta';
  chooseTranslation(s, { language: 'en', lyrics: '[G]Mother [C]earth\n\n[D]Father [G]sun' });
});
Given('a song with a Hebrew translation', function (this: object) {
  const s = get(this);
  s.original = QUECHUA;
  chooseTranslation(s, { language: 'he', lyrics: 'אמא אדמה\n\nאבא שמש' });
});

// ── When ──────────────────────────────────────────────────────────────────────

When('I pick {string}', function (this: object, label: string) {
  const s = get(this);
  assert.ok(translationOf(s), 'no Translation · Both switch without a translation');
  const option = readingViewOptions(t).find((o) => o.label === label);
  assert.ok(option, `no option "${label}"`);
  s.view = option.value as ReadingView;
  s.search = viewSearch(s.search, s.view);
});
When('I read the original language', function (this: object) {
  // The page: picking "Original language" resets the view and drops `?view=` with `?lang=`.
  const s = get(this);
  s.choice = { songId: SONG, language: 'original' };
  s.view = TRANSLATION_VIEW;
  s.search = viewSearch(languageSearch(s.search, null), TRANSLATION_VIEW);
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
  const s = get(this);
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
Then('the reader shows no Translation · Both switch', function (this: object) {
  // `SongReadingViewSwitch visible={!!translation}`: no translation being read, no switch.
  assert.equal(translationOf(get(this)), null);
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
Then('the translation column has language {string} and sets its own direction', function (this: object, lang: string) {
  for (const row of rows(get(this))) assert.deepEqual([row.translation!.lang, row.translation!.dir], [lang, 'auto']);
});
Then('the original column sets its own direction', function (this: object) {
  for (const row of rows(get(this))) assert.equal(row.original!.dir, 'auto');
});
Then('the address reads {string}', function (this: object, search: string) {
  assert.equal(get(this).search, search);
});
Then('the share link ends with {string}', function (this: object, search: string) {
  const s = get(this);
  const url = versionShareUrl(`https://x.test/songs/${SONG}${s.search}`, 'v1', true, translationOf(s)?.language ?? null, s.view);
  assert.ok(url.endsWith(search), url);
});
Then('opening {string} shows both languages', function (this: object, search: string) {
  const s = get(this);
  const params = new URLSearchParams(search);
  const opened: State = {
    ...s,
    choice: linkedLanguageChoice(SONG, params.get(LANGUAGE_PARAM)),
    view: linkedReadingView(params.get(VIEW_PARAM)),
  };
  assert.ok(rows(opened).length > 0);
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
  assert.equal(linkedReadingView(label), BOTH_VIEW);
  const id = seededSongs.get(this)!;
  const [version] = await queryAsAnon<{ content_chordpro: string }>(
    `SELECT content_chordpro FROM public.song_versions WHERE composition_id = $1`,
    [id]
  );
  const translations = await queryAsAnon<SongTranslation>(
    `SELECT language, title, lyrics, translator FROM public.song_translations WHERE composition_id = $1`,
    [id]
  );
  const translation = resolveTranslation(translations, linkedLanguageChoice(id, 'es'), id);
  assert.ok(version && translation, 'the guest cannot read the song or its translation');
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
