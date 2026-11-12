// Story 6.2.13 (#516) — docs/testing/ux-v3-language-switch.feature
import { Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { DICTIONARIES, type Locale } from '../../../lib/i18n';
import { SONG_SELECT } from '../../../lib/songs/songSelect';
import {
  languageOptions,
  languageSearch,
  linkedLanguageChoice,
  resolveTranslation,
  translationTitle,
  type LanguageChoice,
  type SongTranslation,
} from '../../../lib/songs/translations';
import { versionOptions, versionSearch } from '../../../lib/songs/versionSwitch';
import { profileIdByEmail, queryAsAnon, queryAsUser, seedDb } from '../support/db';
import { SEEDED_EMAILS } from './access-policies.steps';
import { localApi } from './ux-v3-songbook-source.steps';

const t = (k: string, vars?: Record<string, string | number>) => {
  const text = (DICTIONARIES.en as Record<string, string>)[k] ?? k;
  return vars ? text.replace(/\{(\w+)\}/g, (_m, name) => String(vars[name])) : text;
};
const tFor = (locale: Locale) => (k: string) => (DICTIONARIES[locale] as Record<string, string>)[k] ?? k;

interface State {
  songTitle: string;
  translations: SongTranslation[];
  locale: Locale;
  choice: LanguageChoice | null;
  search: string;
}
const states = new WeakMap<object, State>();
const get = (w: object): State => {
  if (!states.has(w)) states.set(w, { songTitle: 'Mother Earth', translations: [], locale: 'en', choice: null, search: '' });
  return states.get(w)!;
};
const SONG = 'song-1';
const english: SongTranslation = { language: 'en', title: 'Mother Earth', lyrics: 'Mother earth, I hear you' };
const dutch: SongTranslation = { language: 'nl', title: 'Moeder Aarde', lyrics: 'Moeder aarde, ik hoor je' };

// ── @unit ─────────────────────────────────────────────────────────────────────

Given('a song with an English translation', function (this: object) {
  get(this).translations = [english];
});
Given('a song with Dutch and English translations', function (this: object) {
  get(this).translations = [english, dutch];
});
Given('a song with a Dutch translation that has no lyrics', function (this: object) {
  get(this).translations = [{ language: 'nl', title: 'Moeder Aarde', lyrics: '  ' }];
});
Given('a song without translations', function (this: object) {
  get(this).translations = [];
});

When('I pick {string} in the language switch', function (this: object, label: string) {
  const s = get(this);
  const option = languageOptions(s.translations, t, s.locale)!.find((o) => o.label === label);
  assert.ok(option, `no option "${label}"`);
  s.choice = { songId: SONG, language: option.value };
});
Then('the English lyrics are shown', function (this: object) {
  const s = get(this);
  assert.equal(resolveTranslation(s.translations, s.choice, SONG)?.lyrics, english.lyrics);
});
Then('the original lyrics are shown', function (this: object) {
  const s = get(this);
  assert.equal(resolveTranslation(s.translations, s.choice, SONG), null);
});
Then('the version switch no longer lists the translation', function () {
  // After the data migration a song's versions are its original and variants only; the translation is in
  // song_translations, so the version switch has nothing to list for it (one version: no switch at all).
  const versions = [{ id: 'a', version_name: 'Standard', version_kind: 'original' as const }];
  assert.equal(versionOptions(versions, t), null);
  const two = [...versions, { id: 'b', version_name: 'Live', version_kind: 'variant' as const }];
  assert.deepEqual(versionOptions(two, t)!.map((o) => o.label), ['Standard', 'Live']);
});

Then('the language switch offers {string}, {string} and {string}', function (this: object, a: string, b: string, c: string) {
  const s = get(this);
  assert.deepEqual(languageOptions(s.translations, t, s.locale)!.map((o) => o.label), [a, b, c]);
});
Then('the language switch offers {string} and {string}', function (this: object, a: string, b: string) {
  const s = get(this);
  assert.deepEqual(languageOptions(s.translations, tFor(s.locale), s.locale)!.map((o) => o.label), [a, b]);
});
Then('the song has no language switch', function (this: object) {
  const s = get(this);
  assert.equal(languageOptions(s.translations, t, s.locale), null);
});
When('the app language is set to Dutch', function (this: object) {
  get(this).locale = 'nl';
});

Given('the address says {string}', function (this: object, search: string) {
  get(this).search = search;
});
When('I pick another version', function (this: object) {
  const s = get(this);
  s.search = versionSearch(s.search, 'v2', false);
});
When('I pick the language {string}', function (this: object, language: string) {
  const s = get(this);
  s.search = languageSearch(s.search, language);
});
When('I pick the original language', function (this: object) {
  const s = get(this);
  s.search = languageSearch(s.search, null);
});
Then('the address is {string}', function (this: object, search: string) {
  assert.equal(get(this).search, search);
});

When('I open the song with {string}', function (this: object, search: string) {
  const s = get(this);
  s.choice = linkedLanguageChoice(SONG, new URLSearchParams(search).get('lang'));
});

Given(
  'a song titled {string} with an English translation titled {string} and a Dutch one titled {string}',
  function (this: object, title: string, en: string, nl: string) {
    const s = get(this);
    s.songTitle = title;
    s.translations = [
      { ...english, title: en },
      { ...dutch, title: nl },
    ];
  }
);
Then('the English translation shows no extra title', function (this: object) {
  const s = get(this);
  assert.equal(translationTitle(s.songTitle, s.translations[0]), null);
});
Then('the Dutch translation shows the title {string}', function (this: object, title: string) {
  const s = get(this);
  assert.equal(translationTitle(s.songTitle, s.translations[1]), title);
});

// ── @seed: row-level security ─────────────────────────────────────────────────

interface Seeded {
  publicSong: string;
  privateSong: string;
  ownerId: string;
}
const seeded = new WeakMap<object, Seeded>();

Given('a public song and a private song, each with a Dutch translation', async function (this: object) {
  const db = await seedDb();
  const ownerId = await profileIdByEmail(SEEDED_EMAILS.member);
  const add = async (title: string, isPublic: boolean) => {
    const { rows } = await db.query<{ id: string }>(
      `INSERT INTO public.compositions (title, owner_id, is_public) VALUES ($1, $2, $3) RETURNING id`,
      [title, ownerId, isPublic]
    );
    await db.query(
      `INSERT INTO public.song_translations (composition_id, language, title, lyrics) VALUES ($1, 'nl', $2, 'Zing')`,
      [rows[0].id, `${title} NL`]
    );
    return rows[0].id;
  };
  seeded.set(this, { publicSong: await add('BDD Lang Public', true), privateSong: await add('BDD Lang Private', false), ownerId });
});
const SELECT_TRANSLATIONS = 'SELECT language FROM public.song_translations WHERE composition_id = $1';
Then('a guest reads the Dutch translation of the public song', async function (this: object) {
  const rows = await queryAsAnon(SELECT_TRANSLATIONS, [seeded.get(this)!.publicSong]);
  assert.deepEqual(rows, [{ language: 'nl' }]);
});
Then('a guest reads no translation of the private song', async function (this: object) {
  assert.deepEqual(await queryAsAnon(SELECT_TRANSLATIONS, [seeded.get(this)!.privateSong]), []);
});
Then('the owner reads the translation of the private song', async function (this: object) {
  const s = seeded.get(this)!;
  assert.deepEqual(await queryAsUser(s.ownerId, SELECT_TRANSLATIONS, [s.privateSong]), [{ language: 'nl' }]);
});

Then(
  'the select of the song page runs against the local API without error and returns the translations as a list',
  async function () {
    // Reads whatever the local database holds (never writes). PostgREST plans the whole embed even with no rows.
    const { url, key } = localApi();
    const { data, error } = await createClient(url, key, { auth: { persistSession: false } })
      .from('compositions')
      .select(SONG_SELECT)
      .limit(5);
    assert.equal(error, null, `PostgREST rejected the song select: ${error?.message}`);
    assert.ok(Array.isArray(data));
    for (const song of data as unknown as { song_translations?: unknown }[]) assert.ok(Array.isArray(song.song_translations));
  }
);

// ── @seed: the data migration ─────────────────────────────────────────────────

const MIGRATION = 'supabase/migrations/20261112140000_translation_versions_to_translations.sql';

interface Fixture {
  songId: string;
  originals: string[];
  translationId?: string;
  recordingId?: string;
  setlistItemId?: string;
  ownerId: string;
}
const fixtures = new WeakMap<object, Fixture>();
const fx = (w: object) => fixtures.get(w)!;

async function newSong(): Promise<Fixture> {
  const db = await seedDb();
  const ownerId = await profileIdByEmail(SEEDED_EMAILS.member);
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO public.compositions (title, owner_id, is_public) VALUES ('BDD Translation Move', $1, true) RETURNING id`,
    [ownerId]
  );
  return { songId: rows[0].id, originals: [], ownerId };
}
async function addVersion(songId: string, kind: string, name: string, lyrics: string, createdAt: string): Promise<string> {
  const db = await seedDb();
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO public.song_versions (composition_id, version_name, version_kind, content_chordpro, created_at)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [songId, name, kind, lyrics, createdAt]
  );
  return rows[0].id;
}
async function addOriginal(f: Fixture, createdAt = '2026-01-01T00:00:00Z') {
  f.originals.push(await addVersion(f.songId, 'original', 'Standard', '[C]Mother earth', createdAt));
}
async function addTranslation(f: Fixture, name: string, lyrics = 'Mother earth, I hear you') {
  f.translationId = await addVersion(f.songId, 'translation', name, lyrics, '2026-01-02T00:00:00Z');
}
async function addUsage(f: Fixture) {
  const db = await seedDb();
  const rec = await db.query<{ id: string }>(
    `INSERT INTO public.user_recordings (user_id, song_version_id, recording_name, storage_path)
     VALUES ($1, $2, 'BDD take', $3) RETURNING id`,
    [f.ownerId, f.translationId, `bdd/${f.translationId}.webm`]
  );
  const list = await db.query<{ id: string }>(
    `INSERT INTO public.setlists (owner_id, title) VALUES ($1, 'BDD list') RETURNING id`,
    [f.ownerId]
  );
  const item = await db.query<{ id: string }>(
    `INSERT INTO public.setlist_items (setlist_id, song_version_id, order_index) VALUES ($1, $2, 0) RETURNING id`,
    [list.rows[0].id, f.translationId]
  );
  f.recordingId = rec.rows[0].id;
  f.setlistItemId = item.rows[0].id;
}
const translationsOf = async (songId: string) =>
  (await (await seedDb()).query<{ language: string; title: string | null; lyrics: string }>(
    'SELECT language, title, lyrics FROM public.song_translations WHERE composition_id = $1 ORDER BY language',
    [songId]
  )).rows;
const versionExists = async (id: string) =>
  ((await (await seedDb()).query('SELECT 1 FROM public.song_versions WHERE id = $1', [id])).rowCount ?? 0) > 0;

Given(
  'a song with an original version and a translation version named {string} with a recording and a playlist item',
  async function (this: object, name: string) {
    const f = await newSong();
    await addOriginal(f);
    await addTranslation(f, name);
    await addUsage(f);
    fixtures.set(this, f);
  }
);
Given('a song with an original version and a translation version named {string}', async function (this: object, name: string) {
  const f = await newSong();
  await addOriginal(f);
  await addTranslation(f, name);
  fixtures.set(this, f);
});
Given('a song with only a translation version named {string}', async function (this: object, name: string) {
  const f = await newSong();
  await addTranslation(f, name);
  fixtures.set(this, f);
});
Given(
  'a song with an original version, an {string} translation and a translation version named {string} with other lyrics',
  async function (this: object, language: string, name: string) {
    const f = await newSong();
    await addOriginal(f);
    await (await seedDb()).query(
      `INSERT INTO public.song_translations (composition_id, language, lyrics) VALUES ($1, $2, 'Stored lyrics')`,
      [f.songId, language]
    );
    await addTranslation(f, name, 'Different lyrics');
    fixtures.set(this, f);
  }
);
Given(
  'a song with an original version, an {string} translation and a translation version named {string} with the same lyrics',
  async function (this: object, language: string, name: string) {
    const f = await newSong();
    await addOriginal(f);
    await (await seedDb()).query(
      `INSERT INTO public.song_translations (composition_id, language, lyrics) VALUES ($1, $2, 'Same lyrics')`,
      [f.songId, language]
    );
    await addTranslation(f, name, 'Same lyrics  ');
    fixtures.set(this, f);
  }
);
Given(
  'a song with an original version and a translation version named {string} printed as {string} in a songbook',
  async function (this: object, name: string, printedTitle: string) {
    const f = await newSong();
    await addOriginal(f);
    await addTranslation(f, name);
    const db = await seedDb();
    await db.query(`INSERT INTO public.songbooks (id, title) VALUES ('bdd-lang-book', 'BDD Book')`);
    await db.query(
      `INSERT INTO public.song_version_sources (song_version_id, songbook_id, original_title, is_primary)
       VALUES ($1, 'bdd-lang-book', $2, true)`,
      [f.translationId, printedTitle]
    );
    fixtures.set(this, f);
  }
);
Given(
  'a song with two original versions and a translation version named {string} with a recording',
  async function (this: object, name: string) {
    const f = await newSong();
    await addOriginal(f, '2026-01-05T00:00:00Z');
    await addOriginal(f, '2026-01-01T00:00:00Z'); // older: the first original
    await addTranslation(f, name);
    await addUsage(f);
    fixtures.set(this, f);
  }
);

When('the translation migration runs', async function () {
  await (await seedDb()).query(readFileSync(MIGRATION, 'utf8'));
});

Then('the song has an {string} translation with the lyrics of that version', async function (this: object, language: string) {
  assert.deepEqual(
    (await translationsOf(fx(this).songId)).map((r) => [r.language, r.lyrics]),
    [[language, 'Mother earth, I hear you']]
  );
});
Then('the song has a {string} translation', async function (this: object, language: string) {
  assert.deepEqual((await translationsOf(fx(this).songId)).map((r) => r.language), [language]);
});
Then('the song has exactly one {string} translation', async function (this: object, language: string) {
  assert.deepEqual((await translationsOf(fx(this).songId)).map((r) => r.language), [language]);
});
Then('the song has no translation', async function (this: object) {
  assert.deepEqual(await translationsOf(fx(this).songId), []);
});
Then('the {string} translation has the title {string}', async function (this: object, language: string, title: string) {
  const rows = await translationsOf(fx(this).songId);
  assert.equal(rows.find((r) => r.language === language)?.title, title);
});
Then('the {string} translation still has its own lyrics', async function (this: object, language: string) {
  const rows = await translationsOf(fx(this).songId);
  assert.equal(rows.find((r) => r.language === language)?.lyrics, 'Stored lyrics');
});
Then('the recording and the playlist item are on the original version', async function (this: object) {
  const f = fx(this);
  const db = await seedDb();
  const rec = await db.query('SELECT song_version_id FROM public.user_recordings WHERE id = $1', [f.recordingId]);
  const item = await db.query('SELECT song_version_id FROM public.setlist_items WHERE id = $1', [f.setlistItemId]);
  assert.equal(rec.rows[0].song_version_id, f.originals[0]);
  assert.equal(item.rows[0].song_version_id, f.originals[0]);
});
Then('the recording is on the first original version', async function (this: object) {
  const f = fx(this);
  const rec = await (await seedDb()).query('SELECT song_version_id FROM public.user_recordings WHERE id = $1', [f.recordingId]);
  assert.equal(rec.rows[0].song_version_id, f.originals[1], 'the oldest original is the first one');
});
Then('the translation version is gone', async function (this: object) {
  assert.equal(await versionExists(fx(this).translationId!), false);
});
Then('the translation version is still there', async function (this: object) {
  assert.equal(await versionExists(fx(this).translationId!), true);
});
