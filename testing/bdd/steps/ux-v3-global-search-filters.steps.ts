// Story 6.2.25 / G5.8 (#570) — docs/testing/ux-v3-global-search-filters.feature
import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import { browseOptionsFromRows, type SearchFilterCountRow } from '../../../lib/songs/browseFilters';
import { fetchBrowseFilterCounts } from '../../../lib/songs/browseCounts';
import { formatCount } from '../../../lib/format/count';
import { queryAsAnon, queryAsUser, seedDb } from '../support/db';

const TEST_OWNER_ID = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380570';

interface GlobalBrowseWorld {
  isOpen: boolean;
  pathname: string;
  rpcCalls: number;
  rows: SearchFilterCountRow[];
  selectedSongbook?: string;
  selectedLanguage?: string;
  navigatedUrl?: string;
  seedCounts?: Map<string, number>;
  baselineSpanish?: number;
  baselineNl?: number;
}

const worlds = new WeakMap<object, GlobalBrowseWorld>();
const world = (w: object): GlobalBrowseWorld => {
  let state = worlds.get(w);
  if (!state) worlds.set(w, (state = { isOpen: false, pathname: '/', rpcCalls: 0, rows: [] }));
  return state;
};

function buildGlobalSearchUrl(songbook?: string, language?: string): string {
  const params = new URLSearchParams();
  if (songbook) params.set('songbook', songbook);
  if (language) params.set('language', language);
  const qs = params.toString();
  return qs ? `/songs?${qs}` : '/songs';
}

// ── @unit ────────────────────────────────────────────────────────────────────────────────────────────

Given('I am on the home page with the search window closed', function (this: object) {
  const w = world(this);
  w.pathname = '/';
  w.isOpen = false;
  w.rpcCalls = 0;
});

Given('I am on the home page', function (this: object) {
  world(this).pathname = '/';
});

Given('I am on a playlist page', function (this: object) {
  world(this).pathname = '/library/playlists/test-playlist';
});

Given(
  'the count source returns songbook {string} with id {string} and {int} songs',
  function (this: object, label: string, id: string, count: number) {
    world(this).rows.push({ kind: 'songbook', value: id, label, song_count: count });
  }
);

Given(
  'the count source returns language {string} with slug {string} and {int} songs',
  function (this: object, label: string, slug: string, count: number) {
    world(this).rows.push({ kind: 'language', value: slug, label, song_count: count });
  }
);

When('I do not open the search window', async function (this: object) {
  const w = world(this);
  if (w.isOpen) {
    await fetchBrowseFilterCounts({
      rpc: async () => {
        w.rpcCalls += 1;
        return { data: w.rows, error: null };
      },
    });
  }
});

When('I open the search window', async function (this: object) {
  const w = world(this);
  w.isOpen = true;
  w.rows = await fetchBrowseFilterCounts({
    rpc: async () => {
      w.rpcCalls += 1;
      return { data: w.rows, error: null };
    },
  });
});

Then('no songbook or language counts are requested', function (this: object) {
  assert.equal(world(this).rpcCalls, 0);
});

Then('the global search window offers a Songbook option {string}', function (this: object, expected: string) {
  const { songbooks } = browseOptionsFromRows(world(this).rows, 'en');
  assert.ok(songbooks.some((o) => `${o.label} ${formatCount(o.count)}` === expected));
});

Then('the global search window offers a Language option {string}', function (this: object, expected: string) {
  const { languages } = browseOptionsFromRows(world(this).rows, 'en');
  assert.ok(languages.some((o) => `${o.label} ${formatCount(o.count)}` === expected));
});

When('I choose the songbook {string} and submit the global search', function (this: object, songbookId: string) {
  const w = world(this);
  w.selectedSongbook = songbookId;
  w.navigatedUrl = buildGlobalSearchUrl(w.selectedSongbook, w.selectedLanguage);
});

When('I choose the language {string} and submit the global search', function (this: object, languageSlug: string) {
  const w = world(this);
  w.selectedLanguage = languageSlug;
  w.navigatedUrl = buildGlobalSearchUrl(w.selectedSongbook, w.selectedLanguage);
});

Then('the global search navigates to {string}', function (this: object, expectedUrl: string) {
  assert.equal(world(this).navigatedUrl, expectedUrl);
});

// ── @seed ────────────────────────────────────────────────────────────────────────────────────────────

async function ensureOwnerId(): Promise<string> {
  const db = await seedDb();
  await db.query(
    `INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
     VALUES ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner-570@test.local', 'x', now(), now(), now())
     ON CONFLICT (id) DO NOTHING`,
    [TEST_OWNER_ID]
  );
  await db.query(
    `INSERT INTO public.profiles (id, email, role, full_name)
     VALUES ($1, 'owner-570@test.local', 'member', 'Owner 570')
     ON CONFLICT (id) DO NOTHING`,
    [TEST_OWNER_ID]
  );
  return TEST_OWNER_ID;
}

async function resolveAdminId(): Promise<string> {
  const db = await seedDb();
  const { rows } = await db.query<{ id: string }>(
    `SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1`
  );
  if (rows[0]) return rows[0].id;
  throw new Error('No admin profile found in database');
}

async function insertSeedSong(title: string, isPublic: boolean, ownerId: string | null): Promise<string> {
  const db = await seedDb();
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO public.compositions (title, is_public, owner_id) VALUES ($1, $2, $3) RETURNING id`,
    [title, isPublic, ownerId]
  );
  return rows[0].id;
}

async function attachSongToBook(songId: string, bookId: string): Promise<void> {
  const db = await seedDb();
  const { rows: versions } = await db.query<{ id: string }>(
    `INSERT INTO public.song_versions (composition_id, content_chordpro) VALUES ($1, '[C]Sing') RETURNING id`,
    [songId]
  );
  await db.query(
    `INSERT INTO public.song_version_sources (song_version_id, songbook_id, is_primary) VALUES ($1, $2, true)`,
    [versions[0].id, bookId]
  );
}

Given(
  'a test songbook {string} titled {string} with {int} public songs and {int} private songs of another user',
  async function (bookId: string, title: string, publicCount: number, privateCount: number) {
    const db = await seedDb();
    const ownerId = await ensureOwnerId();
    await db.query(`INSERT INTO public.songbooks (id, title) VALUES ($1, $2)`, [bookId, title]);
    for (let i = 0; i < publicCount; i++) {
      const songId = await insertSeedSong(`Public 570 ${i}`, true, ownerId);
      await attachSongToBook(songId, bookId);
    }
    for (let i = 0; i < privateCount; i++) {
      const songId = await insertSeedSong(`Private 570 ${i}`, false, ownerId);
      await attachSongToBook(songId, bookId);
    }
  }
);

Given(
  'a test songbook {string} titled {string} with {int} private song of another user',
  async function (bookId: string, title: string, privateCount: number) {
    const db = await seedDb();
    const ownerId = await ensureOwnerId();
    await db.query(`INSERT INTO public.songbooks (id, title) VALUES ($1, $2)`, [bookId, title]);
    for (let i = 0; i < privateCount; i++) {
      const songId = await insertSeedSong(`Private Only 570 ${i}`, false, ownerId);
      await attachSongToBook(songId, bookId);
    }
  }
);

Given(
  'a public song and a private song of another user both tagged with language {string}, and a public song with only a {string} translation',
  async function (this: object, languageName: string, translationLang: string) {
    const db = await seedDb();
    const w = world(this);
    const ownerId = await ensureOwnerId();

    const before = await queryAsAnon<SearchFilterCountRow>('SELECT * FROM public.fn_search_filter_counts()');
    w.baselineSpanish = before.find((r) => r.kind === 'language' && r.value === 'spanish')?.song_count ?? 0;
    w.baselineNl = before.find((r) => r.kind === 'language' && r.value === translationLang)?.song_count ?? 0;

    const { rows: cats } = await db.query<{ id: string }>(
      `SELECT c.id FROM public.categories c
         JOIN public.categories p ON p.id = c.parent_id
        WHERE p.slug = 'languages' AND c.name = $1`,
      [languageName]
    );
    assert.ok(cats[0], `Expected seeded language category ${languageName}`);
    const catId = cats[0].id;

    const pubId = await insertSeedSong('Public Lang 570', true, ownerId);
    const privId = await insertSeedSong('Private Lang 570', false, ownerId);
    await db.query(`INSERT INTO public.song_category_map (song_id, category_id) VALUES ($1, $2), ($3, $2)`, [
      pubId,
      catId,
      privId,
    ]);

    const trSongId = await insertSeedSong('Translated Only 570', true, ownerId);
    await db.query(
      `INSERT INTO public.song_translations (composition_id, language, title, lyrics) VALUES ($1, $2, 'NL Titel', 'NL tekst')`,
      [trSongId, translationLang]
    );
  }
);

async function loadSeedCounts(role: 'guest' | 'owner' | 'admin'): Promise<Map<string, number>> {
  const sql = 'SELECT * FROM public.fn_search_filter_counts()';
  const rows =
    role === 'guest'
      ? await queryAsAnon<SearchFilterCountRow>(sql)
      : role === 'owner'
        ? await queryAsUser<SearchFilterCountRow>(await ensureOwnerId(), sql)
        : await queryAsUser<SearchFilterCountRow>(await resolveAdminId(), sql);
  const map = new Map<string, number>();
  for (const r of rows) map.set(`${r.kind}:${r.value}`, r.song_count);
  return map;
}

When('a guest requests search filter counts', async function (this: object) {
  world(this).seedCounts = await loadSeedCounts('guest');
});

When("the private songs' owner requests search filter counts", async function (this: object) {
  world(this).seedCounts = await loadSeedCounts('owner');
});

When('an admin requests search filter counts', async function (this: object) {
  world(this).seedCounts = await loadSeedCounts('admin');
});

Then('the guest sees songbook {string} with count {int}', function (this: object, bookId: string, expected: number) {
  assert.equal(world(this).seedCounts?.get(`songbook:${bookId}`), expected);
});

Then('the owner sees songbook {string} with count {int}', function (this: object, bookId: string, expected: number) {
  assert.equal(world(this).seedCounts?.get(`songbook:${bookId}`), expected);
});

Then('the admin sees songbook {string} with count {int}', function (this: object, bookId: string, expected: number) {
  assert.equal(world(this).seedCounts?.get(`songbook:${bookId}`), expected);
});

Then('the guest does not see songbook {string}', function (this: object, bookId: string) {
  assert.equal(world(this).seedCounts?.has(`songbook:${bookId}`), false);
});

Then(
  'the guest sees the {string} language count rise by {int} and the {string} language count unchanged',
  function (this: object, langSlug: string, delta: number, translationLang: string) {
    const w = world(this);
    assert.equal(w.seedCounts?.get(`language:${langSlug}`), (w.baselineSpanish ?? 0) + delta);
    assert.equal(w.seedCounts?.get(`language:${translationLang}`) ?? 0, w.baselineNl ?? 0);
  }
);
