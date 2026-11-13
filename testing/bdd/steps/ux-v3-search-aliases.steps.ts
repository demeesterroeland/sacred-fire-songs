// Story 6.2.18 / G5.1 (#521) — docs/testing/ux-v3-search-aliases.feature
import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import type { SongBddWorld } from '../support/world';
import { SEEDED_EMAILS } from './access-policies.steps';
import { profileIdByEmail, queryAsAnon, queryAsUser, seedDb } from '../support/db';
import { DICTIONARIES, SUPPORTED_LOCALES, interpolate } from '../../../lib/i18n';
import { songFilterConfig } from '../../../lib/songs/filterConfig';
import { SONGS_SELECT, fetchAllSongRows, mapCompositionToSong, type CompositionRow } from '../../../lib/songs/queries';
import { rankSongsBySearch, songMatchHintText } from '../../../lib/songs/search';
import type { Locale } from '../../../lib/i18n';
import type { Song } from '../../../lib/songUtils';

const en = DICTIONARIES.en as Record<string, string>;
const t = (key: string, params?: Record<string, string | number>) => interpolate(en[key] ?? key, params);

interface SearchWorld {
  songs: Song[];
  query: string;
  results: Song[];
  seededSongId?: string;
  fetched?: { client: unknown; count: number };
}
const worlds = new WeakMap<object, SearchWorld>();
const world = (w: object): SearchWorld => {
  let state = worlds.get(w);
  if (!state) worlds.set(w, (state = { songs: [], query: '', results: [] }));
  return state;
};

let counter = 0;
const song = (over: Partial<Song>): Song =>
  ({
    id: `s${++counter}`,
    title: 'Untitled',
    author: '',
    authors: [],
    aliases: [],
    sourceTitles: [],
    songKey: null,
    color: 'red',
    createdAt: '2026-01-01T00:00:00Z',
    categories: [],
    ...over,
  }) as Song;

/** The free-text search of the song list, exactly as `useSongsFilter` runs it over the fetched songs. */
const search = (songs: Song[], query: string) => songs.filter((s) => songFilterConfig.search!.match(s, query));

// ── @unit: the matcher on in-memory songs ─────────────────────────────────────

Given('a song {string}', function (this: object, title: string) {
  world(this).songs.push(song({ title }));
});
Given('a song {string} with alias {string}', function (this: object, title: string, alias: string) {
  world(this).songs.push(song({ title, aliases: [alias] }));
});
Given(
  'a song {string} by {string} with authors {string} and {string}',
  function (this: object, title: string, display: string, a: string, b: string) {
    world(this).songs.push(song({ title, author: display, authors: [a, b] }));
  }
);
Given(
  'a song {string} printed as {string} in a songbook',
  function (this: object, title: string, original: string) {
    world(this).songs.push(song({ title, sourceTitles: [original] }));
  }
);
Given(
  'a song {string} with two versions, the second printed as {string} in a songbook',
  function (this: object, title: string, original: string) {
    // The same mapping the list uses: only the second version has a source.
    const row = {
      id: 'row', title, original_author: null, is_public: true, created_at: '2026-01-01T00:00:00Z',
      song_versions: [
        { id: 'v1', created_at: '2026-01-01T00:00:00Z', key: null, content_chordpro: '', melody_notation: '', song_version_sources: [] },
        { id: 'v2', created_at: '2026-02-01T00:00:00Z', key: null, content_chordpro: '', melody_notation: '', song_version_sources: [{ original_title: original }] },
      ],
      song_category_map: [],
    } as CompositionRow;
    world(this).songs.push(mapCompositionToSong(row));
  }
);
Given(
  'a song {string} with alias {string} printed as {string} in a songbook, by {string}',
  function (this: object, title: string, alias: string, original: string, author: string) {
    world(this).songs.push(song({ title, aliases: [alias], sourceTitles: [original], author, authors: [author] }));
  }
);
Given('a song {string} with alias {string} printed as {string} in a songbook', function (this: object, title: string, alias: string, original: string) {
  world(this).songs.push(song({ title, aliases: [alias], sourceTitles: [original] }));
});
Given(
  'a list row of the song {string} with alias {string} printed as {string} in a songbook',
  function (this: object, title: string, alias: string, original: string) {
    const row = {
      id: 'row', title, original_author: null, authors: [], aliases: [alias], is_public: true, created_at: '2026-01-01T00:00:00Z',
      song_versions: [{ id: 'v1', created_at: '2026-01-01T00:00:00Z', key: null, content_chordpro: '', melody_notation: '', song_version_sources: [{ original_title: original }] }],
      song_category_map: [],
    } as CompositionRow;
    world(this).songs.push(mapCompositionToSong(row));
  }
);

// Story 6.2.23 / G5.6 (#547): the title of a translation is searched (docs/testing/ux-v3-search-translations.feature).
Given('a song {string} with a Dutch translation titled {string}', function (this: object, title: string, translated: string) {
  world(this).songs.push(song({ title, translationTitles: [{ language: 'nl', title: translated }] }));
});
Given('a song {string} with a {string} translation titled {string}', function (this: object, title: string, tag: string, translated: string) {
  world(this).songs.push(song({ title, translationTitles: [{ language: tag, title: translated }] }));
});
Given(
  'a song {string} with a Dutch translation without a title but with the lyrics {string}',
  function (this: object, title: string, lyrics: string) {
    // The same mapping the list uses: only `language` and `title` are selected, so the lyrics never reach the search.
    const row = {
      id: 'row', title, original_author: null, is_public: true, created_at: '2026-01-01T00:00:00Z',
      song_versions: [], song_category_map: [],
      song_translations: [{ language: 'nl', title: null, lyrics }],
    } as unknown as CompositionRow;
    world(this).songs.push(mapCompositionToSong(row));
  }
);
Given(
  'a list row of the song {string} with a Dutch translation titled {string}',
  function (this: object, title: string, translated: string) {
    const row = {
      id: 'row', title, original_author: null, is_public: true, created_at: '2026-01-01T00:00:00Z',
      song_versions: [], song_category_map: [],
      song_translations: [{ language: 'nl', title: translated }],
    } as CompositionRow;
    world(this).songs.push(mapCompositionToSong(row));
  }
);
Then('the hint in Dutch reads {string}', function (this: object, text: string) {
  const nl = DICTIONARIES.nl as Record<string, string>;
  const tNl = (key: string, params?: Record<string, string | number>) => interpolate(nl[key] ?? key, params);
  assert.equal(songMatchHintText(world(this).songs[0], world(this).query, tNl as never, 'nl' as Locale), text);
});
Then('every language has the translation hint with its language and text placeholders', function () {
  for (const locale of SUPPORTED_LOCALES) {
    const dict = DICTIONARIES[locale] as Record<string, string>;
    assert.ok(dict['songs.matchTranslation']?.includes('{language}'), `${locale}: {language}`);
    assert.ok(dict['songs.matchTranslation']?.includes('{text}'), `${locale}: {text}`);
  }
});
Then('the song list select embeds the translations once, asking only for language and title', function () {
  assert.equal(SONGS_SELECT.match(/song_translations(![\w]+)?\s*\(/g)?.length, 1);
  assert.match(SONGS_SELECT, /song_translations\s*\(\s*language\s*,\s*title\s*\)/);
});

When('I search {string} and rank the results', function (this: object, query: string) {
  const w = world(this);
  w.query = query;
  w.results = [...rankSongsBySearch(search(w.songs, query), query)];
});
Then('the first result is {string}', function (this: object, title: string) {
  assert.equal(world(this).results[0]?.title, title);
});

Given(
  'a catalog of {int} songs behind a server that returns at most {int} rows per request',
  function (this: object, total: number, cap: number) {
    // Newest first on (created_at, id), like songsQuery; the keyset cursor arrives as the `or()` filter.
    const rows = Array.from({ length: total }, (_, i) => ({
      id: `row${String(i).padStart(6, '0')}`,
      created_at: `2026-01-01T00:00:00.${String(total - i).padStart(6, '0')}+00:00`,
    }));
    let cursor: [string, string] | null = null;
    const builder = {
      select: () => {
        cursor = null;
        return builder;
      },
      order: () => builder,
      or: (filter: string) => {
        const m = /and\(created_at\.eq\.(.+?),id\.lt\.(.+)\)$/.exec(filter)!;
        cursor = [m[1], m[2]];
        return builder;
      },
      limit: (n: number) => {
        const c = cursor;
        const after = rows.filter((r) => !c || r.created_at < c[0] || (r.created_at === c[0] && r.id < c[1]));
        return Promise.resolve({ data: after.slice(0, Math.min(n, cap)), error: null });
      },
    };
    world(this).fetched = { client: { from: () => builder }, count: 0 };
  }
);
When('the whole song list is fetched', async function (this: object) {
  const w = world(this);
  const { data } = await fetchAllSongRows(w.fetched!.client as never);
  w.fetched!.count = data.length;
});
Then('all {int} songs are fetched', function (this: object, total: number) {
  assert.equal(world(this).fetched?.count, total);
});

When('I search {string}', function (this: object, query: string) {
  const w = world(this);
  w.query = query;
  w.results = search(w.songs, query);
});

Then('the song is in the results', function (this: object) {
  assert.ok(world(this).results.includes(world(this).songs[0]), `"${world(this).query}" should find ${world(this).songs[0].title}`);
});
Then('the song is not in the results', function (this: object) {
  assert.equal(world(this).results.includes(world(this).songs[0]), false);
});
Then('the hint reads {string}', function (this: object, text: string) {
  assert.equal(songMatchHintText(world(this).songs[0], world(this).query, t as never), text);
});
Then('there is no hint', function (this: object) {
  assert.equal(songMatchHintText(world(this).songs[0], world(this).query, t as never), null);
});
Then('the results are the song {string} once', function (this: object, title: string) {
  assert.deepEqual(world(this).results.map((s) => s.title), [title]);
});
Then('every language has the three "matched by" hints with their placeholder', function () {
  for (const locale of SUPPORTED_LOCALES) {
    const dict = DICTIONARIES[locale] as Record<string, string>;
    for (const key of ['songs.matchAlias', 'songs.matchSourceTitle', 'songs.matchAuthor']) {
      assert.ok(dict[key]?.includes('{text}'), `${locale}: ${key}`);
    }
  }
});
Then('the song list select embeds the songbook sources once', function () {
  assert.equal(SONGS_SELECT.match(/song_version_sources(![\w]+)?\s*\(/g)?.length, 1);
  assert.match(SONGS_SELECT, /song_version_sources\s*\(\s*original_title\s*\)/);
});

// ── @seed: what each visitor may read in the real database, then the real search ─

const ROWS = `
  SELECT c.id, c.title, c.original_author, c.authors, c.aliases, c.is_public, c.created_at,
         COALESCE((SELECT json_agg(json_build_object(
                     'id', v.id, 'created_at', v.created_at, 'key', v.key, 'content_chordpro', v.content_chordpro,
                     'melody_notation', v.melody_notation,
                     'song_version_sources', COALESCE((SELECT json_agg(json_build_object('original_title', s.original_title))
                                                         FROM public.song_version_sources s WHERE s.song_version_id = v.id), '[]'::json)))
                    FROM public.song_versions v WHERE v.composition_id = c.id), '[]'::json) AS song_versions,
         COALESCE((SELECT json_agg(json_build_object('language', t.language, 'title', t.title))
                    FROM public.song_translations t WHERE t.composition_id = c.id), '[]'::json) AS song_translations
    FROM public.compositions c`;

async function insertSong(
  isPublic: boolean,
  ownerId: string | null,
  alias: string,
  original: string,
  title: string
): Promise<string> {
  const db = await seedDb();
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO public.compositions (title, owner_id, is_public, aliases) VALUES ($1, $2, $3, ARRAY[$4]) RETURNING id`,
    [title, ownerId, isPublic, alias]
  );
  const book = `bdd-search-${rows[0].id.slice(0, 8)}`;
  await db.query(`INSERT INTO public.songbooks (id, title) VALUES ($1, 'BDD Search Book')`, [book]);
  const { rows: versions } = await db.query<{ id: string }>(
    `INSERT INTO public.song_versions (composition_id, content_chordpro, contributor_id) VALUES ($1, '[C]Sing', $2) RETURNING id`,
    [rows[0].id, ownerId]
  );
  await db.query(
    `INSERT INTO public.song_version_sources (song_version_id, songbook_id, original_title, is_primary) VALUES ($1, $2, $3, true)`,
    [versions[0].id, book, original]
  );
  return rows[0].id;
}

Given(
  'a public catalog song with alias {string} printed as {string}',
  async function (this: object, alias: string, original: string) {
    world(this).seededSongId = await insertSong(true, null, alias, original, 'BDD Search Catalog Song');
  }
);
Given(
  'a private song of a member with alias {string} printed as {string} in a songbook',
  async function (this: object, alias: string, original: string) {
    world(this).seededSongId = await insertSong(false, await profileIdByEmail(SEEDED_EMAILS.member), alias, original, 'BDD Search Private Song');
  }
);

const toSongs = (rows: CompositionRow[]) => rows.map((r) => mapCompositionToSong({ ...r, song_category_map: [] }));

When('a guest reads the song list and searches {string}', async function (this: object, query: string) {
  const w = world(this);
  w.query = query;
  w.songs = toSongs(await queryAsAnon<CompositionRow & Record<string, unknown>>(ROWS));
  w.results = search(w.songs, query);
});
When('its owner reads the song list and searches {string}', async function (this: object, query: string) {
  const w = world(this);
  w.query = query;
  w.songs = toSongs(await queryAsUser<CompositionRow & Record<string, unknown>>(await profileIdByEmail(SEEDED_EMAILS.member), ROWS));
  w.results = search(w.songs, query);
});

const inResults = (w: object) => world(w).results.some((s) => s.id === world(w).seededSongId);
Then("the catalog song is in the guest's results", function (this: SongBddWorld) {
  assert.equal(inResults(this), true, `"${world(this).query}" should find the catalog song`);
});
Then("the private song is not in the guest's results", function (this: SongBddWorld) {
  assert.equal(inResults(this), false, `"${world(this).query}" must not find the private song`);
});
Then("the private song is in the owner's results", function (this: SongBddWorld) {
  assert.equal(inResults(this), true);
});

// Story 6.2.23 / G5.6 (#547): translations follow the privacy of their song.
async function insertTranslatedSong(isPublic: boolean, ownerId: string | null, translated: string, title: string): Promise<string> {
  const db = await seedDb();
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO public.compositions (title, owner_id, is_public) VALUES ($1, $2, $3) RETURNING id`,
    [title, ownerId, isPublic]
  );
  await db.query(`INSERT INTO public.song_translations (composition_id, language, title, lyrics) VALUES ($1, 'nl', $2, 'Zing')`, [rows[0].id, translated]);
  return rows[0].id;
}
Given('a public catalog song with a Dutch translation titled {string}', async function (this: object, translated: string) {
  world(this).seededSongId = await insertTranslatedSong(true, null, translated, 'BDD Translation Catalog Song');
});
Given('a private song of a member with a Dutch translation titled {string}', async function (this: object, translated: string) {
  world(this).seededSongId = await insertTranslatedSong(false, await profileIdByEmail(SEEDED_EMAILS.member), translated, 'BDD Translation Private Song');
});
