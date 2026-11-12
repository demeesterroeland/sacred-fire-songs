// Story 6.2.11 (#514) — docs/testing/ux-v3-songbook-pages.feature
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { Given, Then, When } from '@cucumber/cucumber';
import { queryAsAnon, queryAsUser, profileIdByEmail, seedDb } from '../support/db';
import { DICTIONARIES, SUPPORTED_LOCALES, translateFrom } from '../../../lib/i18n';
import {
  buildSongbookDetail,
  buildSongbookEntries,
  buildSongbookList,
  comparePages,
  countSongbookSongs,
  songbookHref,
  songbookSongHref,
  type RawSongbook,
  type RawSongbookSource,
  type SongbookDetail,
} from '../../../lib/songbooks/songbookPage';
import { SONGBOOK_LIST_SELECT, SONGBOOK_PAGE_SELECT } from '../../../lib/songbooks/songbookSelect';
import { formatSourceLines, type VersionSourceRow } from '../../../lib/songs/versionSources';
import { localApi } from './ux-v3-songbook-source.steps';
import { OTHER_MEMBER_ID, SEEDED_EMAILS } from './access-policies.steps';

const t = (key: string, params?: Record<string, string | number>) => translateFrom(DICTIONARIES.en, DICTIONARIES.en, key, params);

interface PagesWorld {
  bookId: string;
  title: string;
  sources: RawSongbookSource[];
  detail?: SongbookDetail | null;
  versionRow?: VersionSourceRow;
  books?: RawSongbook[];
  list?: { title: string; songCount: number }[];
  seeded?: { bookId: string };
}

const worlds = new WeakMap<object, PagesWorld>();
function w(world: object): PagesWorld {
  let s = worlds.get(world);
  if (!s) {
    s = { bookId: 'book-a', title: 'Songbook A', sources: [] };
    worlds.set(world, s);
  }
  return s;
}

let counter = 0;
function source(
  title: string,
  page: string | null,
  over: { songId?: string; versionId?: string; originalTitle?: string; created?: string } = {}
): RawSongbookSource {
  counter += 1;
  return {
    id: `src-${counter}`,
    page,
    original_title: over.originalTitle ?? null,
    is_primary: false,
    song_versions: {
      id: over.versionId ?? `ver-${counter}`,
      created_at: over.created ?? `2026-01-01T00:00:${String(counter % 60).padStart(2, '0')}Z`,
      compositions: { id: over.songId ?? `song-${title}`, title, original_author: 'Author A', authors: [], is_public: true },
    },
  };
}

/** Parses `"Song C" on page "20", "Song Z" without a page` into [title, page|null] pairs. */
function parseSongs(list: string): [string, string | null][] {
  return [...list.matchAll(/"([^"]+)" (?:on page "([^"]*)"|without a page)/g)].map((m) => [m[1], m[2] ?? null]);
}

const quoted = (list: string): string[] => [...list.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
const displayed = (w0: PagesWorld) => w0.detail?.entries ?? buildSongbookEntries(w0.sources);

// ── @unit ────────────────────────────────────────────────────────────────────

Given('the songbook {string}', function (this: object, title: string) {
  Object.assign(w(this), { title, sources: [], detail: undefined });
});

Given(/^"([^"]+)" contains (.+)$/, function (this: object, _book: string, list: string) {
  w(this).sources.push(...parseSongs(list).map(([title, page]) => source(title, page)));
});

Given(/^"([^"]+)" has songs on the pages "([^"]+)"$/, function (this: object, _book: string, pages: string) {
  w(this).sources.push(...pages.split(', ').map((page, i) => source(`Song ${i + 1}`, page)));
});

Given(
  /^"([^"]+)" has the song "([^"]+)" as version "([^"]+)" on page "([^"]+)" and as version "([^"]+)" on page "([^"]+)"$/,
  function (this: object, _book: string, title: string, v1: string, p1: string, v2: string, p2: string) {
    w(this).sources.push(source(title, p1, { songId: 'song-1', versionId: v1 }), source(title, p2, { songId: 'song-1', versionId: v2 }));
  }
);

Given(
  /^"([^"]+)" has "([^"]+)" on page "([^"]+)" with the original title "([^"]+)" and on page "([^"]+)" with the original title "([^"]+)"$/,
  function (this: object, _book: string, title: string, p1: string, o1: string, p2: string, o2: string) {
    w(this).sources.push(
      source(title, p1, { songId: 'song-1', originalTitle: o1 }),
      source(title, p2, { songId: 'song-2', originalTitle: o2 })
    );
  }
);

When('I open its page', function (this: object) {
  const s = w(this);
  s.detail = buildSongbookDetail({ id: s.bookId, title: s.title, song_version_sources: s.sources });
});

Then('its songs are listed in page order with links to each song', function (this: object) {
  const entries = displayed(w(this));
  assert.ok(entries.length > 1);
  for (let i = 1; i < entries.length; i += 1) {
    assert.ok(comparePages(entries[i - 1].page, entries[i].page) <= 0, `${entries[i - 1].page} before ${entries[i].page}`);
  }
  for (const e of entries) assert.equal(songbookSongHref(e), `/songs/${encodeURIComponent(e.songId)}?version=${encodeURIComponent(e.versionId)}`);
});

Then(/^the songs read (.+)$/, function (this: object, list: string) {
  assert.deepEqual(displayed(w(this)).map((e) => e.title), quoted(list));
});

Then('the pages are listed in the order {string}', function (this: object, order: string) {
  assert.deepEqual(displayed(w(this)).map((e) => e.page), order.split(', '));
});

Then('{string} is listed twice, on page {string} and on page {string}', function (this: object, title: string, p1: string, p2: string) {
  assert.deepEqual(displayed(w(this)).filter((e) => e.title === title).map((e) => e.page), [p1, p2]);
});

Then('the row on page {string} links to version {string} and the row on page {string} links to version {string}', function (this: object, p1: string, v1: string, p2: string, v2: string) {
  const entries = displayed(w(this));
  assert.match(songbookSongHref(entries.find((e) => e.page === p1)!), new RegExp(`\\?version=${v1}$`));
  assert.match(songbookSongHref(entries.find((e) => e.page === p2)!), new RegExp(`\\?version=${v2}$`));
});

Then('{string} is listed once', function (this: object, title: string) {
  assert.equal(displayed(w(this)).filter((e) => e.title === title).length, 1);
});

Then('the row on page {string} shows the original title {string}', function (this: object, page: string, original: string) {
  assert.equal(displayed(w(this)).find((e) => e.page === page)!.originalTitle, original);
});

Then('the row on page {string} shows no original title', function (this: object, page: string) {
  assert.equal(displayed(w(this)).find((e) => e.page === page)!.originalTitle, null);
});

Then('the songbook counts {int} songs', function (this: object, n: number) {
  assert.equal(countSongbookSongs(w(this).sources), n);
});

Given(
  /^the songbooks "([^"]+)" with (\d+) songs?, "([^"]+)" with (\d+) songs? and "([^"]+)" with (\d+) songs?$/,
  function (this: object, t1: string, n1: string, t2: string, n2: string, t3: string, n3: string) {
    const books: RawSongbook[] = [];
    for (const [title, count] of [[t1, n1], [t2, n2], [t3, n3]]) {
      const n = Number(count);
      books.push({ id: title, title, song_version_sources: Array.from({ length: n }, (_, k) => source(`${title} song ${k}`, String(k + 1))) });
    }
    w(this).books = books;
  }
);

When('I open the songbooks list', function (this: object) {
  w(this).list = buildSongbookList(w(this).books ?? []);
});

Then(/^the list reads (.+)$/, function (this: object, expected: string) {
  const label = (n: number) => (n === 1 ? t('playlists.songCountSingle') : t('playlists.songCount', { count: n }));
  assert.deepEqual(
    w(this).list!.map((b) => `${b.title} (${label(b.songCount)})`),
    quoted(expected)
  );
});

Given('the version of {string} printed on page {string}', function (this: object, book: string, page: string) {
  w(this).versionRow = { id: 'src-row-1', is_primary: true, page, songbooks: { id: `${book.toLowerCase().replace(/\W+/g, '-')}`, title: book } };
});

Then('the source line of the version links to the page of {string} at the row of that source', function (this: object, book: string) {
  const row = w(this).versionRow!;
  const [line] = formatSourceLines([row], 'Rise Up', t);
  assert.equal(line.name, book);
  const href = songbookHref(line.bookId, line.id);
  assert.equal(href, '/songbooks/songbook-a#source-src-row-1');
  // The songbook page built from that very source puts the same anchor on its row.
  const entries = buildSongbookEntries([{ ...source('Rise Up', row.page ?? null), id: row.id }]);
  assert.ok(entries[0].sourceIds.includes(row.id));
});

Then('the page of the songbook {string} is {string}', function (_book: string, expected: string) {
  assert.equal(songbookHref(_book), expected);
});

When('I open the page of a songbook that does not exist', function (this: object) {
  w(this).detail = buildSongbookDetail(null);
});

// The route turns this into notFound() (testing/unit/tests/songbooks/songbookPages.test.tsx); the data layer answers null.
Then('the page answers {string}', function (this: object, answer: string) {
  assert.equal(answer, 'not found');
  assert.equal(w(this).detail, null);
});

Then('all languages have text for the songbook pages', function () {
  const keys = [
    'library.tabs.songbooks',
    'songbooks.pageTitle',
    'songbooks.emptyHint',
    'songbooks.empty',
    'songbooks.noPage',
    'songbooks.listLabel',
    'songbooks.notFound.title',
    'songbooks.notFound.description',
  ];
  for (const locale of SUPPORTED_LOCALES) {
    for (const key of keys) {
      const value = (DICTIONARIES as Record<string, Record<string, string>>)[locale][key];
      assert.ok(value && value.trim(), `${locale} has ${key}`);
    }
  }
});

// ── @seed: the rows the page reads, under row-level security ─────────────────

async function seedBook(songs: { title: string; page: string; isPublic: boolean; ownerId?: string }[]): Promise<string> {
  const db = await seedDb();
  const bookId = `bdd-514-book-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  await db.query(`INSERT INTO public.songbooks (id, title) VALUES ($1, 'Songbook A')`, [bookId]);
  for (const s of songs) {
    const { rows: comp } = await db.query<{ id: string }>(
      `INSERT INTO public.compositions (title, original_author, is_public, owner_id) VALUES ($1, 'Author A', $2, $3) RETURNING id`,
      [s.title, s.isPublic, s.ownerId ?? null]
    );
    const { rows: ver } = await db.query<{ id: string }>(
      `INSERT INTO public.song_versions (composition_id, content_chordpro) VALUES ($1, '[C]Sing') RETURNING id`,
      [comp[0].id]
    );
    await db.query(`INSERT INTO public.song_version_sources (song_version_id, songbook_id, page, is_primary) VALUES ($1, $2, $3, true)`, [
      ver[0].id,
      bookId,
      s.page,
    ]);
  }
  return bookId;
}

Given('a songbook with a public song on page {string} and a private song on page {string}', async function (this: object, pub: string, priv: string) {
  w(this).seeded = { bookId: await seedBook([{ title: 'BDD Public Song', page: pub, isPublic: true }, { title: 'BDD Private Song', page: priv, isPublic: false }]) };
});

Given('a songbook with only a private song', async function (this: object) {
  w(this).seeded = { bookId: await seedBook([{ title: 'BDD Private Song', page: '1', isPublic: false }]) };
});

Given(
  'a songbook with a public song on page {string} and a private song of a member on page {string}',
  async function (this: object, pub: string, priv: string) {
    const db = await seedDb();
    const owner = await profileIdByEmail(SEEDED_EMAILS.member);
    await db.query(`INSERT INTO auth.users (id, email) VALUES ($1, 'other-member@example.invalid') ON CONFLICT (id) DO NOTHING`, [OTHER_MEMBER_ID]);
    await db.query(
      `INSERT INTO public.profiles (id, email, role, full_name) VALUES ($1, 'other-member@example.invalid', 'member', 'Other Member') ON CONFLICT (id) DO NOTHING`,
      [OTHER_MEMBER_ID]
    );
    w(this).seeded = {
      bookId: await seedBook([
        { title: 'BDD Public Song', page: pub, isPublic: true },
        { title: 'BDD Private Song', page: priv, isPublic: false, ownerId: owner },
      ]),
    };
  }
);

// What the page's select returns, with LEFT JOINs standing for the embeds: a row-level-security-hidden version or song is null.
const PAGE_SQL = `SELECT s.id, s.page, s.original_title, s.is_primary,
                         v.id AS version_id, v.created_at, c.id AS song_id, c.title, c.original_author, c.is_public
                  FROM public.song_version_sources s
                  LEFT JOIN public.song_versions v ON v.id = s.song_version_id
                  LEFT JOIN public.compositions c ON c.id = v.composition_id
                  WHERE s.songbook_id = $1`;

interface PageRow {
  id: string;
  page: string | null;
  original_title: string | null;
  is_primary: boolean;
  version_id: string | null;
  created_at: Date | null;
  song_id: string | null;
  title: string | null;
  original_author: string | null;
  is_public: boolean | null;
}

const asSources = (rows: PageRow[]): RawSongbookSource[] =>
  rows.map((r) => ({
    id: r.id,
    page: r.page,
    original_title: r.original_title,
    is_primary: r.is_primary,
    song_versions: r.version_id
      ? {
          id: r.version_id,
          created_at: r.created_at ? r.created_at.toISOString() : null,
          compositions: r.song_id ? { id: r.song_id, title: r.title ?? '', original_author: r.original_author, authors: [], is_public: r.is_public } : null,
        }
      : null,
  }));

Then('a guest reads the public song only', async function (this: object) {
  const rows = await queryAsAnon<PageRow>(PAGE_SQL, [w(this).seeded!.bookId]);
  assert.deepEqual(buildSongbookEntries(asSources(rows)).map((e) => e.title), ['BDD Public Song']);
});

Then(/^the guest's count of the book is (\d+) songs?$/, async function (this: object, n: string) {
  const rows = await queryAsAnon<PageRow>(PAGE_SQL, [w(this).seeded!.bookId]);
  assert.equal(countSongbookSongs(asSources(rows)), Number(n));
});

Then('a guest cannot read the songbook', async function (this: object) {
  assert.deepEqual(await queryAsAnon(`SELECT id FROM public.songbooks WHERE id = $1`, [w(this).seeded!.bookId]), []);
});

Then('that member reads both songs, the private one first', async function (this: object) {
  const owner = await profileIdByEmail(SEEDED_EMAILS.member);
  const rows = await queryAsUser<PageRow>(owner, PAGE_SQL, [w(this).seeded!.bookId]);
  const entries = buildSongbookEntries(asSources(rows));
  assert.deepEqual(entries.map((e) => [e.title, e.isPublic]), [['BDD Private Song', false], ['BDD Public Song', true]]);
});

Then('another member reads the public song only', async function (this: object) {
  const rows = await queryAsUser<PageRow>(OTHER_MEMBER_ID, PAGE_SQL, [w(this).seeded!.bookId]);
  assert.deepEqual(buildSongbookEntries(asSources(rows)).map((e) => e.title), ['BDD Public Song']);
});

Then('the select of the songbook page and the songbook list run against the local API without error', async function () {
  // PostgREST plans the whole embed even with no rows, so a malformed or doubled embed (42803) fails here. Reads only.
  const { url, key } = localApi();
  const db = createClient(url, key, { auth: { persistSession: false } });
  const page = await db.from('songbooks').select(SONGBOOK_PAGE_SELECT).eq('id', 'bdd-514-no-such-book').maybeSingle();
  assert.equal(page.error, null, `PostgREST rejected the page select: ${page.error?.message}`);
  assert.equal(page.data, null);
  const all = await db.from('songbooks').select(SONGBOOK_PAGE_SELECT).limit(5);
  assert.equal(all.error, null, `PostgREST rejected the page select: ${all.error?.message}`);
  const list = await db.from('songbooks').select(SONGBOOK_LIST_SELECT).order('title').limit(5);
  assert.equal(list.error, null, `PostgREST rejected the list select: ${list.error?.message}`);
  for (const book of (list.data ?? []) as unknown as { song_version_sources: unknown }[]) {
    assert.ok(Array.isArray(book.song_version_sources), 'song_version_sources is an array per book');
  }
});
