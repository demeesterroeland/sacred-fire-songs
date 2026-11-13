// Story 6.2.17 (#520) — docs/testing/ux-v3-pdf-export.feature
import { Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { exportFingerprint } from '../../../lib/export/pdfCache';
import { PLAYLIST_EXPORT_SELECT, exportSongFromItem, type PlaylistExportItem } from '../../../lib/export/exportSong';
import { getPdfLabels, type ExportSongData } from '../../../lib/export/pdfExport';
import { DICTIONARIES, type Locale } from '../../../lib/i18n';
import { VERSION_SOURCES_SELECT, formatSourceLines, type VersionSourceRow } from '../../../lib/songs/versionSources';
import { repeatEndText } from '../../../lib/songs/repeatMarks';
import { queryAsAnon, seedDb } from '../support/db';
import { recordPlaylistPdf, type DrawnText } from '../support/pdfRecorder';
import { localApi } from './ux-v3-songbook-source.steps';

type Sheet = { drawn: DrawnText[]; lines: string[] };
interface World {
  song?: ExportSongData;
  sheet?: Sheet;
  locale?: Locale;
  items?: PlaylistExportItem[];
  exported?: ExportSongData;
  pinned?: { id: string; second: string };
}
const worlds = new WeakMap<object, World>();
const w = (o: object): World => {
  let s = worlds.get(o);
  if (!s) worlds.set(o, (s = {}));
  return s;
};

const source = (book: string, page: string, compiler: string | null, primary = true, id = book): VersionSourceRow => ({
  id,
  is_primary: primary,
  page,
  original_title: null,
  songbooks: { id: book, title: book, short_name: null, compiler },
});
const REPEAT_CONTENT = '[E]Rise up\n{start_of_repeat}\n[A]Fire burning\n[E]Sing it\n{end_of_repeat: x2}\n[B]Amen';
const lyricX = (sheet: Sheet, word: string) => sheet.drawn.find((d) => d.text.trim() === word && d.size === 9.5)!.x;

Given(
  /^a playlist with a catalog song version with capo 5, beats "([^"]+)", repeats and the source "([^"]+)" page "([^"]+)" compiled by "([^"]+)"$/,
  function (this: object, beats: string, book: string, page: string, compiler: string) {
    w(this).song = {
      title: 'Rise Up', author: 'Author A', key: 'E', capo: 5, beats, tuning: 'Standard',
      sources: [source(book, page, compiler)], content: REPEAT_CONTENT,
    };
  }
);
Given('a playlist with a song without key, capo, beats, tuning, author or source', function (this: object) {
  w(this).song = { title: 'Rise Up', capo: 0, sources: [], content: '[C]Rise up' };
});
Given('a playlist with a song whose only technical value is the beats {string}', function (this: object, beats: string) {
  w(this).song = { title: 'Rise Up', beats, content: '[C]Rise up' };
});
Given(
  'a playlist with a song version printed in {string} on page {string} and as the primary source in {string} on page {string}',
  function (this: object, bookB: string, pageB: string, bookA: string, pageA: string) {
    w(this).song = {
      title: 'Rise Up', content: '[C]Rise up',
      sources: [source(bookB, pageB, null, false), source(bookA, pageA, null, true)],
    };
  }
);
Given('a playlist with a song with a repeat of two lines sung twice', function (this: object) {
  w(this).song = { title: 'Rise Up', content: REPEAT_CONTENT };
});
Given('a playlist with a song without repeats', function (this: object) {
  w(this).song = { title: 'Rise Up', content: '[E]Rise up' };
});
Given('a playlist item with a song in key {string} transposed by {int} semitones', function (this: object, key: string, by: number) {
  w(this).song = { title: 'Rise Up', key, transposition: by, content: '[E]Rise up\n[A]Fire' };
});

When('I export it to PDF', async function (this: object) {
  w(this).sheet = await recordPlaylistPdf({ title: 'Circle', songs: [w(this).song!] });
});
When('I export it to PDF in the language {string}', async function (this: object, locale: Locale) {
  w(this).locale = locale;
  w(this).sheet = await recordPlaylistPdf({ title: 'Circle', songs: [w(this).song!], locale });
});

Then('the sheet shows the meta line {string}', function (this: object, line: string) {
  const { lines } = w(this).sheet!;
  assert.ok(lines.includes(line) || lines.some((l) => l.includes(line)), `no "${line}" in ${JSON.stringify(lines)}`);
});
Then('the sheet shows the repeat bars {string} and {string} around the repeated lines', function (this: object, open: string, close: string) {
  const { lines } = w(this).sheet!;
  assert.ok(lines.some((l) => l.startsWith(open) && l.includes('Fire burning')), JSON.stringify(lines));
  assert.ok(lines.some((l) => l.includes('Sing it') && l.endsWith(close)), JSON.stringify(lines));
});
Then('the sheet shows the source line {string} under the lyrics', function (this: object, line: string) {
  const { lines } = w(this).sheet!;
  assert.ok(lines.indexOf(line) > lines.findIndex((l) => l.includes('Amen')), JSON.stringify(lines));
});
Then(/^the sheet prints none of the labels (.+)$/, function (this: object, list: string) {
  const labels = [...list.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(labels.length >= 2);
  const all = w(this).sheet!.lines.join('\n');
  for (const label of labels) assert.ok(!all.includes(label), `"${label}" printed`);
  assert.doesNotMatch(all, /undefined|null|NaN/);
});
Then('the sheet shows the same source lines as the song page, primary first', function (this: object) {
  const song = w(this).song!;
  const en = getPdfLabels('en');
  const screen = formatSourceLines(song.sources, song.title, ((k: string, p?: Record<string, string | number>) =>
    (DICTIONARIES.en as Record<string, string>)[k].replace(/\{(\w+)\}/g, (_, n: string) => String(p?.[n]))) as never, 'en').map((l) => l.text);
  assert.deepEqual(screen, ['Songbook A · p. 38', 'Songbook B · p. 2']);
  assert.deepEqual(en.sourceLines(song.sources, song.title), screen);
  const { lines } = w(this).sheet!;
  assert.deepEqual(lines.filter((l) => screen.includes(l)), screen);
});
Then('the repeated lines start at the same indent, right of the other lines', function (this: object) {
  const s = w(this).sheet!;
  assert.ok(lyricX(s, 'Fire') > lyricX(s, 'Rise'));
  assert.equal(lyricX(s, 'Sing'), lyricX(s, 'Fire'));
  assert.equal(lyricX(s, 'Amen'), lyricX(s, 'Rise'));
});
Then('the closing bar with {string} follows the last repeated line', function (this: object, times: string) {
  assert.ok(w(this).sheet!.lines.some((l) => l.includes('Sing it') && l.endsWith(`:‖ ${times}`)));
  assert.equal(repeatEndText(2), `:‖ ${times}`);
});
Then('the sheet prints no repeat bars', function (this: object) {
  assert.doesNotMatch(w(this).sheet!.lines.join(''), /‖/);
});
Then('the chords on the sheet are {string} and {string}', function (this: object, a: string, b: string) {
  const { lines } = w(this).sheet!;
  assert.ok(lines.includes(a) && lines.includes(b), JSON.stringify(lines));
});
Then('the sheet shows the meta line and source line in {string}', function (this: object, locale: Locale) {
  const song = w(this).song!;
  const l = getPdfLabels(locale);
  const meta = [l.by(song.author!), ...l.technical(song)].join(' · ');
  const { lines } = w(this).sheet!;
  assert.ok(lines.includes(meta), `${meta} not in ${JSON.stringify(lines)}`);
  assert.ok(lines.includes(l.sourceLines(song.sources, song.title)[0]));
  assert.ok(meta.includes(DICTIONARIES[locale]['song.meta.capo'].replace('{capo}', '5')));
});
Then('the meta line, the source line and the repeat bars are printed at 9 pt or larger', function (this: object) {
  const { drawn } = w(this).sheet!;
  for (const needle of ['Key E', 'Songbook A', '‖:', ':‖']) {
    assert.ok(drawn.find((d) => d.text.includes(needle))!.size >= 9, needle);
  }
});

// ── pinned version ──────────────────────────────────────────────────────────
const version = (id: string, key: string, capo: number, beats: string | null, book: string, lyrics: string) => ({
  id, key, capo, tuning: 'Standard', beats, content_chordpro: lyrics,
  song_version_sources: [source(book, '1', null)],
  compositions: { id: 'c1', title: 'Rise Up', original_author: 'Author A' },
});
Given(
  'a song with a first version in key {string} with capo 5 and a second version in key {string} without capo, both from different books',
  function (this: object, k1: string, k2: string) {
    w(this).items = [
      { id: 'i1', transposition_override: null, song_versions: version('v1', k1, 5, '8', 'Songbook A', '[E]First') },
      { id: 'i2', transposition_override: 2, song_versions: version('v2', k2, 0, null, 'Songbook B', '[G]Second') },
    ];
  }
);
Given('a playlist item pinned to the second version', function () {
  // the second item above is the one pinned to the second version
});
When('the export reads the playlist item', function (this: object) {
  w(this).exported = exportSongFromItem(w(this).items![1]);
});
Then('the exported song has the key, capo, beats, sources and lyrics of the second version', function (this: object) {
  const e = w(this).exported!;
  assert.equal(e.key, 'G');
  assert.equal(e.capo, 0);
  assert.equal(e.beats, undefined);
  assert.equal(e.transposition, 2);
  assert.equal(e.content, '[G]Second');
  assert.deepEqual(e.sources!.map((s) => s.songbooks), [{ id: 'Songbook B', title: 'Songbook B', short_name: null, compiler: null }]);
});
Given('a song that has a translation', function () {
  // translations live in song_translations; the export select below must not read them
});
Then('the export asks for no translations, so the sheet shows the original lyrics', function () {
  assert.doesNotMatch(PLAYLIST_EXPORT_SELECT, /song_translations/);
});
Then('the playlist export select embeds the sources once, from the shared fragment', function () {
  assert.equal(PLAYLIST_EXPORT_SELECT.match(/song_version_sources(![\w]+)?\s*\(/g)?.length, 1);
  assert.ok(PLAYLIST_EXPORT_SELECT.includes(VERSION_SOURCES_SELECT));
});
When('the beats or the sources of the song change', function () {
  // handled in the assertion below
});
Then('the cached PDF is not reused', async function (this: object) {
  const song = w(this).song!;
  const base = { userId: 'u', playlistId: 'p', locale: 'en', title: 'T' };
  const before = await exportFingerprint({ ...base, songs: [song] });
  assert.notEqual(await exportFingerprint({ ...base, songs: [{ ...song, beats: '4' }] }), before);
  assert.notEqual(await exportFingerprint({ ...base, songs: [{ ...song, sources: [] }] }), before);
});

// ── @seed ───────────────────────────────────────────────────────────────────
Then('the select of the playlist export runs against the local API without error', async function () {
  // The scenario's seed transaction is invisible to PostgREST, so this reads whatever the local database holds (a guest
  // sees no playlist items of private lists). PostgREST plans the whole embed, so a doubled `song_version_sources (` (42803) fails here.
  const { url, key } = localApi();
  const { error } = await createClient(url, key, { auth: { persistSession: false } }).from('setlist_items').select(PLAYLIST_EXPORT_SELECT).limit(5);
  assert.equal(error, null, `PostgREST rejected the export select: ${error?.message}`);
});

Given(
  'a public playlist whose item is pinned to the second version of a song with a source and transposed by 2',
  async function (this: object) {
    const db = await seedDb();
    // Any seeded profile owns the fixtures; the scenario reads them as a guest, so which one does not matter.
    const owner = (await db.query<{ id: string }>('SELECT id FROM public.profiles ORDER BY created_at LIMIT 1')).rows[0]?.id;
    assert.ok(owner, 'a seeded profile');
    const song = (await db.query<{ id: string }>(`INSERT INTO public.compositions (title, original_author, is_public, owner_id) VALUES ('BDD Export Song', 'Author A', true, $1) RETURNING id`, [owner])).rows[0].id;
    const first = (await db.query<{ id: string }>(`INSERT INTO public.song_versions (composition_id, content_chordpro, key, capo) VALUES ($1, '[E]First', 'E', 5) RETURNING id`, [song])).rows[0].id;
    const second = (await db.query<{ id: string }>(`INSERT INTO public.song_versions (composition_id, content_chordpro, key, capo, beats) VALUES ($1, '[G]Second', 'G', 0, '4') RETURNING id`, [song])).rows[0].id;
    await db.query(`INSERT INTO public.songbooks (id, title, compiler) VALUES ('bdd-520-book', 'Songbook B', 'Compiler B') ON CONFLICT (id) DO NOTHING`);
    await db.query(`INSERT INTO public.song_version_sources (song_version_id, songbook_id, page, is_primary) VALUES ($1, 'bdd-520-book', '2', true)`, [second]);
    const list = (await db.query<{ id: string }>(`INSERT INTO public.setlists (owner_id, title, is_public) VALUES ($1, 'BDD export list', true) RETURNING id`, [owner])).rows[0].id;
    const item = (await db.query<{ id: string }>(`INSERT INTO public.setlist_items (setlist_id, song_version_id, order_index, transposition_override) VALUES ($1, $2, 0, 2) RETURNING id`, [list, second])).rows[0].id;
    w(this).pinned = { id: item, second };
    void first;
  }
);
Then('the rows a guest reads for that item export the second version with its source and transposition', async function (this: object) {
  const { id } = w(this).pinned!;
  const rows = await queryAsAnon<{
    transposition_override: number; v_key: string; capo: number; beats: string; content: string; book: string; page: string; compiler: string; song_id: string; title: string; author: string;
  }>(
    `SELECT i.transposition_override, v.key AS v_key, v.capo, v.beats, v.content_chordpro AS content, b.title AS book, s.page, b.compiler,
            c.id AS song_id, c.title, c.original_author AS author
     FROM public.setlist_items i
     JOIN public.song_versions v ON v.id = i.song_version_id
     JOIN public.compositions c ON c.id = v.composition_id
     JOIN public.song_version_sources s ON s.song_version_id = v.id
     JOIN public.songbooks b ON b.id = s.songbook_id
     WHERE i.id = $1`,
    [id]
  );
  assert.equal(rows.length, 1);
  const r = rows[0];
  const exported = exportSongFromItem({
    id,
    transposition_override: r.transposition_override,
    song_versions: {
      key: r.v_key, capo: r.capo, beats: r.beats, content_chordpro: r.content,
      song_version_sources: [source(r.book, r.page, r.compiler)],
      compositions: { id: r.song_id, title: r.title, original_author: r.author },
    },
  });
  assert.equal(exported.content, '[G]Second');
  assert.equal(exported.key, 'G');
  assert.equal(exported.beats, '4');
  assert.equal(exported.transposition, 2);
  const sheet = await recordPlaylistPdf({ title: 'Circle', songs: [exported] });
  assert.ok(sheet.lines.includes('Songbook B · p. 2 · compiled by Compiler B'), JSON.stringify(sheet.lines));
  assert.ok(sheet.lines.some((l) => l.includes('Key A')), 'G transposed by 2 is A');
});
