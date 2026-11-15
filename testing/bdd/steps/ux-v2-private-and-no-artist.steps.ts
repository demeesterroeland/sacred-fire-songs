// #564 / #565 — docs/testing/ux-v2-private-and-no-artist.feature (@unit)
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { DICTIONARIES, SUPPORTED_LOCALES, tWithLocale, type TranslationKey } from '@/lib/i18n';
import { joinMeta } from '../../../components/ui/meta-line';
import { songRowMeta } from '../../../lib/songs/songMeta';
import { DRAFT_WORD, SONG_VISIBILITY_KEYS } from '../../support/songVisibilityKeys';

type Dict = Record<string, string>;
const state = new WeakMap<object, { dicts?: Record<string, Dict>; author?: string | null; line?: string }>();
const get = (w: object) => state.get(w) ?? state.set(w, {}).get(w)!;
const en = () => DICTIONARIES.en as Dict;

Given('the English message file', function (this: object) {
  get(this).dicts = { en: en() };
});

Given('the 8 locale files', function (this: object) {
  assert.equal(SUPPORTED_LOCALES.length, 8);
  get(this).dicts = Object.fromEntries(SUPPORTED_LOCALES.map((l) => [l, DICTIONARIES[l] as Dict]));
});

Then('the song visibility options read {string} and {string}', function (this: object, pub: string, priv: string) {
  assert.equal(en()['search.status.public'], pub);
  assert.equal(en()['search.status.draft'], priv);
});

Then('no song visibility label contains the word {string}', function (this: object, word: string) {
  for (const key of SONG_VISIBILITY_KEYS) {
    assert.ok(!en()[key].toLowerCase().includes(word.toLowerCase()), `${key}: ${en()[key]}`);
  }
});

Then('the save option for a song that is not public reads {string}', function (this: object, label: string) {
  assert.equal(en()['songForm.saveAsDraft'], label);
});

Then('no song-visibility label uses the local word for {string}', function (this: object, word: string) {
  assert.match(word, DRAFT_WORD);
  for (const [locale, d] of Object.entries(get(this).dicts!)) {
    for (const key of SONG_VISIBILITY_KEYS) {
      assert.ok(d[key], `${locale} ${key} missing`);
      assert.doesNotMatch(d[key], DRAFT_WORD, `${locale} ${key}: ${d[key]}`);
    }
  }
});

Given('a song row for a song with no author', function (this: object) {
  get(this).author = null;
});

Given('a song row for a song whose author is {string}', function (this: object, author: string) {
  get(this).author = author;
});

When('the song row meta line is built in English', function (this: object) {
  const s = get(this);
  s.line = joinMeta(songRowMeta(s.author, [], (k: TranslationKey, p) => tWithLocale('en', k, p)));
});

Then('the song row meta line reads {string}', function (this: object, expected: string) {
  assert.equal(get(this).line, expected);
});

Then('it does not read {string}', function (this: object, text: string) {
  assert.ok(!get(this).line!.includes(text), get(this).line);
});

Then('every locale says {string} with a word other than its {string}', function (this: object, noArtist: string, traditional: string) {
  assert.equal(en()['song.noArtist'], noArtist);
  assert.equal(en()['song.traditional'], traditional);
  for (const [locale, d] of Object.entries(get(this).dicts!)) {
    assert.ok(d['song.noArtist'], `${locale} song.noArtist missing`);
    assert.notEqual(d['song.noArtist'], d['song.traditional'], locale);
  }
});

Then('the admin artist fallback equals that locale\'s {string}', function (this: object, label: string) {
  assert.equal(en()['admin.detail.unknownArtist'], label);
  for (const [locale, d] of Object.entries(get(this).dicts!)) {
    assert.equal(d['admin.detail.unknownArtist'], d['song.noArtist'], locale);
  }
});
