// Story 6.2.10 (#513) — docs/testing/ux-v3-songbook-source.feature
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { Given, Then, When } from '@cucumber/cucumber';
import type { SongBddWorld } from '../support/world';
import { queryAsAnon, seedDb } from '../support/db';
import { DICTIONARIES, SUPPORTED_LOCALES, translateFrom } from '../../../lib/i18n';
import { formatSourceLines, type VersionSourceRow } from '../../../lib/songs/versionSources';
import { SONG_SELECT } from '../../../lib/songs/songSelect';
import { linkedVersionChoice, resolveVersionIndex } from '../../../lib/songs/versionSwitch';

interface SourceWorld {
  songTitle: string;
  versions: { id: string; song_version_sources?: VersionSourceRow[] }[];
  shownIndex: number;
  publicVersionId?: string;
  privateVersionId?: string;
}

const worlds = new WeakMap<object, SourceWorld>();
function w(world: object): SourceWorld {
  let s = worlds.get(world);
  if (!s) {
    s = { songTitle: 'Rise Up', versions: [{ id: 'v1' }], shownIndex: 0 };
    worlds.set(world, s);
  }
  return s;
}

const t = (key: string, params?: Record<string, string | number>) =>
  translateFrom(DICTIONARIES.en, DICTIONARIES.en, key, params);

function row(id: string, book: string, over: Partial<VersionSourceRow> = {}, compiler: string | null = null): VersionSourceRow {
  return { id, is_primary: false, page: null, original_title: null, songbooks: { id: book, title: book, compiler }, ...over };
}

const linesOf = (s: SourceWorld) =>
  formatSourceLines(s.versions[s.shownIndex]?.song_version_sources, s.songTitle, t).map((l) => l.text);

// ── @unit ────────────────────────────────────────────────────────────────────

Given(
  /^a version from "([^"]+)" page "([^"]+)" compiled by "([^"]+)"$/,
  function (this: object, book: string, page: string, compiler: string) {
    w(this).versions = [{ id: 'v1', song_version_sources: [row('s1', book, { page }, compiler)] }];
  }
);

Given(
  /^the song "([^"]+)" has a version from "([^"]+)" with the original title "([^"]+)"$/,
  function (this: object, title: string, book: string, original: string) {
    const s = w(this);
    s.songTitle = title;
    s.versions = [{ id: 'v1', song_version_sources: [row('s1', book, { original_title: original })] }];
  }
);

Given(
  /^a version printed in "([^"]+)" on page "([^"]+)" and as the primary source in "([^"]+)" on page "([^"]+)"$/,
  function (this: object, bookB: string, pageB: string, bookA: string, pageA: string) {
    w(this).versions = [
      { id: 'v1', song_version_sources: [row('sB', bookB, { page: pageB }), row('sA', bookA, { page: pageA, is_primary: true })] },
    ];
  }
);

Given(/^a song with a version from "([^"]+)" and a version from "([^"]+)"$/, function (this: object, a: string, b: string) {
  w(this).versions = [
    { id: 'v1', song_version_sources: [row('sA', a)] },
    { id: 'v2', song_version_sources: [row('sB', b)] },
  ];
});

When(/^the reader opens the song with "\?version=" the second version$/, function (this: object) {
  const s = w(this);
  s.shownIndex = resolveVersionIndex(s.versions, linkedVersionChoice('song-1', 'v2'), 'song-1');
});

Given('a version without sources', function (this: object) {
  w(this).versions = [{ id: 'v1', song_version_sources: [] }];
});

Given('cached song data from before the sources existed', function (this: object) {
  w(this).versions = [{ id: 'v1' }];
});

Then(/^the song page shows the line "([^"]+)"$/, function (this: object, line: string) {
  assert.deepEqual(linesOf(w(this)), [line]);
});

Then(/^the song page lists the lines "([^"]+)" and "([^"]+)"$/, function (this: object, first: string, second: string) {
  assert.deepEqual(linesOf(w(this)), [first, second]);
});

Then(/^with no version chosen the song page shows the line "([^"]+)"$/, function (this: object, line: string) {
  const s = w(this);
  s.shownIndex = resolveVersionIndex(s.versions, null, 'song-1');
  assert.deepEqual(linesOf(s), [line]);
});

Then(/^the list is labelled "([^"]+)"$/, function (this: object, label: string) {
  const s = w(this);
  const lines = linesOf(s);
  assert.equal(t(lines.length > 1 ? 'song.source.labelMany' : 'song.source.label'), label);
});

Then('the song page shows no source line', function (this: object) {
  assert.deepEqual(linesOf(w(this)), []);
});

Then('all languages have text for the source line', function () {
  for (const l of SUPPORTED_LOCALES) {
    const d = DICTIONARIES[l] as Record<string, string>;
    for (const key of ['song.source.label', 'song.source.labelMany', 'song.source.page', 'song.source.pages', 'song.source.compiledBy', 'song.source.originalTitle']) {
      assert.ok(d[key], `${l} ${key}`);
    }
    assert.ok(d['song.source.page'].includes('{page}'), `${l} keeps {page}`);
    assert.ok(d['song.source.compiledBy'].includes('{compiler}'), `${l} keeps {compiler}`);
    assert.ok(d['song.source.originalTitle'].includes('{title}'), `${l} keeps {title}`);
  }
});

// ── @seed: the same rows the song page reads, as a guest (row-level security) ─

async function seedSong(isPublic: boolean, book: string, page: string, compiler: string | null): Promise<string> {
  const db = await seedDb();
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO public.compositions (title, original_author, is_public) VALUES ($1, 'Author A', $2) RETURNING id`,
    [isPublic ? 'BDD Source Public' : 'BDD Source Private', isPublic]
  );
  const { rows: versions } = await db.query<{ id: string }>(
    `INSERT INTO public.song_versions (composition_id, content_chordpro) VALUES ($1, '[C]Sing') RETURNING id`,
    [rows[0].id]
  );
  await db.query(
    `INSERT INTO public.songbooks (id, title, compiler) VALUES ($1, $1, $2) ON CONFLICT (id) DO NOTHING`,
    [book, compiler]
  );
  await db.query(
    `INSERT INTO public.song_version_sources (song_version_id, songbook_id, page, is_primary) VALUES ($1, $2, $3, true)`,
    [versions[0].id, book, page]
  );
  return versions[0].id;
}

Given(
  /^a public song with a version from "([^"]+)" page "([^"]+)" compiled by "([^"]+)"$/,
  async function (this: object, book: string, page: string, compiler: string) {
    w(this).publicVersionId = await seedSong(true, `bdd-513-${book}`, page, compiler);
  }
);

Given(/^a private song with a version from "([^"]+)" page "([^"]+)"$/, async function (this: object, book: string, page: string) {
  w(this).privateVersionId = await seedSong(false, `bdd-513-private-${book}`, page, null);
});

// The sources of a version with their book, read as the `anon` role: what row-level security lets a guest see.
const SOURCES_SQL = `SELECT s.page, s.is_primary, b.title AS book, b.compiler
                     FROM public.song_version_sources s
                     JOIN public.songbooks b ON b.id = s.songbook_id
                     WHERE s.song_version_id = $1`;

Then('a guest reads the book, page and compiler of the public version', async function (this: SongBddWorld) {
  const rows = await queryAsAnon(SOURCES_SQL, [w(this).publicVersionId]);
  assert.deepEqual(rows, [{ page: '38', is_primary: true, book: 'bdd-513-Songbook A', compiler: 'Compiler A' }]);
});

Then('a guest reads no source of the private version', async function (this: SongBddWorld) {
  assert.deepEqual(await queryAsAnon(SOURCES_SQL, [w(this).privateVersionId]), []);
});

// ── @seed contract: the song page's real select against PostgREST ────────────

/** Local API settings: the environment first, then `.env.local` (the `_DEV` pair), then the local stack's default URL. */
function localApi(): { url: string; key: string } {
  const fromFile: Record<string, string> = {};
  try {
    for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
      const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (m) fromFile[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    // no .env.local: rely on the environment
  }
  const pick = (k: string) => process.env[k] ?? fromFile[k];
  const url = pick('NEXT_PUBLIC_SUPABASE_URL_DEV') ?? 'http://127.0.0.1:54321';
  const key = pick('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_DEV') ?? pick('NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV');
  assert.ok(key, 'a local Supabase publishable key (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_DEV)');
  return { url, key };
}

Then(
  'the select of the song page runs against the local API without error and returns the sources of each version as a list',
  async function () {
    // The scenario's seed transaction is invisible to PostgREST, so this reads (never writes) whatever the local
    // database holds. PostgREST plans the whole embed even with no rows, so a malformed or doubled embed (42803) fails here.
    const { url, key } = localApi();
    const { data, error } = await createClient(url, key, { auth: { persistSession: false } })
      .from('compositions')
      .select(SONG_SELECT)
      .limit(5);
    assert.equal(error, null, `PostgREST rejected the song select: ${error?.message}`);
    assert.ok(Array.isArray(data));
    for (const song of data as unknown as { song_versions: { song_version_sources?: unknown }[] }[]) {
      for (const version of song.song_versions) {
        assert.ok(Array.isArray(version.song_version_sources), 'song_version_sources is an array per version');
      }
    }
  }
);
