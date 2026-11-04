/**
 * Generates supabase/seeds/03_songs_random_generated.sql from scripts/db/random-seeder.mjs.
 *
 * `npx supabase db reset` / `npx supabase start` load every file in supabase/seeds,
 * so this static file gives a fresh local database ~200 generated songs without
 * needing the Node seeder. The Playwright setup (scripts/db/setup-test-db.mjs) keeps
 * running the generator live.
 *
 * Usage:
 *   node scripts/db/export-random-seed.mjs            # 200 songs (default)
 *   node scripts/db/export-random-seed.mjs 300        # custom count
 *   DATABASE_URL=postgres://... node scripts/db/export-random-seed.mjs
 *
 * The generator runs inside a transaction that is rolled back, so the database
 * it connects to is left untouched. Timestamps are exported relative to now().
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { seedRandomData, ANCHOR_SONGS } from './random-seeder.mjs';

const count = parseInt(process.argv[2] || '200', 10);
const outFile = path.resolve(process.cwd(), 'supabase/seeds/03_songs_random_generated.sql');
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

const lit = (v) => {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number' || typeof v === 'bigint') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  const s = String(v);
  if (s.includes('\\')) return `E'${s.replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
  return `'${s.replace(/'/g, "''")}'`;
};
const ts = (secondsAgo) => `now() - interval '${Math.max(0, Math.round(Number(secondsAgo)))} seconds'`;

function block(title, table, columns, rows, { onConflict = '', batch = 50 } = {}) {
  if (rows.length === 0) return `-- ${title}: none\n\n`;
  let out = `-- ${title} (${rows.length})\n`;
  for (let i = 0; i < rows.length; i += batch) {
    out += `INSERT INTO public.${table} (${columns.join(', ')}) VALUES\n`;
    out += rows.slice(i, i + batch).map((r) => `  (${r.join(', ')})`).join(',\n');
    out += `${onConflict ? `\n${onConflict}` : ''};\n`;
  }
  return out + '\n';
}

const client = new pg.Client({ connectionString });
await client.connect();
try {
  await client.query('BEGIN');
  // Work on an empty song graph inside the transaction only.
  await client.query(`
    DELETE FROM public.song_views;
    DELETE FROM public.user_recordings;
    DELETE FROM public.setlist_items;
    DELETE FROM public.setlists;
    DELETE FROM public.song_category_map;
    DELETE FROM public.song_versions;
    DELETE FROM public.compositions;
    DELETE FROM public.categories WHERE slug LIKE 'artist-%';
  `);
  await seedRandomData(client, count);

  const q = async (sql) => (await client.query(sql)).rows;
  const compositions = await q(`SELECT id, title, original_author, is_public, owner_id, has_chords, has_melody,
      extract(epoch FROM now() - created_at) AS ago FROM public.compositions ORDER BY created_at DESC, id`);
  const versions = await q(`SELECT id, composition_id, version_name, content_chordpro, melody_notation, key, capo, tuning,
      contributor_id, youtube_url, spotify_url, soundcloud_url, extract(epoch FROM now() - created_at) AS ago
      FROM public.song_versions ORDER BY created_at DESC, id`);
  const artistCats = await q(`SELECT c.name, c.slug, c.emoji FROM public.categories c JOIN public.categories p ON p.id = c.parent_id
      WHERE p.slug = 'artists' ORDER BY c.slug`);
  const tagMaps = await q(`SELECT m.song_id, c.slug FROM public.song_category_map m JOIN public.categories c ON c.id = m.category_id
      ORDER BY m.song_id, c.slug`);
  const setlists = await q(`SELECT id, owner_id, title, description, is_public, extract(epoch FROM now() - created_at) AS ago
      FROM public.setlists ORDER BY title, id`);
  const items = await q(`SELECT setlist_id, song_version_id, order_index FROM public.setlist_items ORDER BY setlist_id, order_index`);
  const recordings = await q(`SELECT id, user_id, song_version_id, recording_name, storage_path, position, file_size_bytes, duration_seconds,
      extract(epoch FROM now() - created_at) AS ago FROM public.user_recordings ORDER BY song_version_id, position, id`);
  const views = await q(`SELECT user_id, song_id, extract(epoch FROM now() - viewed_at) AS ago FROM public.song_views ORDER BY user_id, song_id`);

  let sql = `-- 03_songs_random_generated.sql
-- ${compositions.length} generated songs for local development (\`supabase db reset\` / \`supabase start\`).
--
-- GENERATED FILE – do not edit by hand. Regenerate with:
--   npm run seed:generate            (or: node scripts/db/export-random-seed.mjs ${count})
-- Source generator: scripts/db/random-seeder.mjs (${ANCHOR_SONGS.length} deterministic anchor songs +
-- randomized songs covering every shape in docs/testing/song.feature).
-- Generated: ${new Date().toISOString()}
--
-- Depends on 01_auth_users.sql + 02_profiles.sql (owner ids) and the category
-- taxonomy created by the migrations. Timestamps are relative to now() so the
-- data always looks recent. The real song collection lives in the sibling
-- repository sacred-fire-songs-collection.

`;
  sql += block('Compositions', 'compositions',
    ['id', 'title', 'original_author', 'is_public', 'owner_id', 'has_chords', 'has_melody', 'created_at'],
    compositions.map((r) => [lit(r.id), lit(r.title), lit(r.original_author), lit(r.is_public), lit(r.owner_id), lit(r.has_chords), lit(r.has_melody), ts(r.ago)]));
  sql += block('Song versions', 'song_versions',
    ['id', 'composition_id', 'version_name', 'content_chordpro', 'melody_notation', 'key', 'capo', 'tuning', 'contributor_id', 'youtube_url', 'spotify_url', 'soundcloud_url', 'created_at'],
    versions.map((r) => [lit(r.id), lit(r.composition_id), lit(r.version_name), lit(r.content_chordpro), lit(r.melody_notation), lit(r.key), lit(r.capo), lit(r.tuning), lit(r.contributor_id), lit(r.youtube_url), lit(r.spotify_url), lit(r.soundcloud_url), ts(r.ago)]),
    { batch: 20 });
  sql += `-- Artist categories (${artistCats.length}); the parent "Artists" category is created when missing\n`;
  sql += `INSERT INTO public.categories (name, slug, emoji, parent_id) VALUES ('Artists', 'artists', '👤', NULL) ON CONFLICT (slug) DO NOTHING;\n`;
  if (artistCats.length) {
    sql += `INSERT INTO public.categories (name, slug, emoji, parent_id)\nSELECT v.name, v.slug, v.emoji, p.id FROM (VALUES\n`;
    sql += artistCats.map((c) => `  (${lit(c.name)}, ${lit(c.slug)}, ${lit(c.emoji)})`).join(',\n');
    sql += `\n) AS v(name, slug, emoji), public.categories p WHERE p.slug = 'artists'\nON CONFLICT (slug) DO NOTHING;\n`;
  }
  sql += '\n';
  sql += `-- Song ↔ category links by slug (${tagMaps.length})\n`;
  for (let i = 0; i < tagMaps.length; i += 100) {
    sql += `INSERT INTO public.song_category_map (song_id, category_id)\nSELECT v.song_id::uuid, c.id FROM (VALUES\n`;
    sql += tagMaps.slice(i, i + 100).map((m) => `  (${lit(m.song_id)}, ${lit(m.slug)})`).join(',\n');
    sql += `\n) AS v(song_id, slug) JOIN public.categories c ON c.slug = v.slug\nON CONFLICT DO NOTHING;\n`;
  }
  sql += '\n';
  sql += block('Playlists', 'setlists', ['id', 'owner_id', 'title', 'description', 'is_public', 'created_at'],
    setlists.map((r) => [lit(r.id), lit(r.owner_id), lit(r.title), lit(r.description), lit(r.is_public), ts(r.ago)]),
    { onConflict: 'ON CONFLICT (id) DO NOTHING' });
  sql += block('Playlist items', 'setlist_items', ['setlist_id', 'song_version_id', 'order_index'],
    items.map((r) => [lit(r.setlist_id), lit(r.song_version_id), lit(r.order_index)]));
  sql += block('Private rehearsal recordings (metadata only, no files in storage)', 'user_recordings',
    ['id', 'user_id', 'song_version_id', 'recording_name', 'storage_path', 'position', 'file_size_bytes', 'duration_seconds', 'created_at'],
    recordings.map((r) => [lit(r.id), lit(r.user_id), lit(r.song_version_id), lit(r.recording_name), lit(r.storage_path), lit(r.position), lit(r.file_size_bytes), lit(r.duration_seconds), ts(r.ago)]));
  sql += block('Recently viewed', 'song_views', ['user_id', 'song_id', 'viewed_at'],
    views.map((r) => [lit(r.user_id), lit(r.song_id), ts(r.ago)]),
    { onConflict: 'ON CONFLICT (user_id, song_id) DO NOTHING' });

  fs.writeFileSync(outFile, sql);
  console.log(`[export-random-seed] Wrote ${path.relative(process.cwd(), outFile)}: ${compositions.length} songs, ${versions.length} versions, ${tagMaps.length} tag links, ${setlists.length} playlists, ${recordings.length} recordings (${(sql.length / 1024).toFixed(0)} KB)`);
} finally {
  await client.query('ROLLBACK');
  await client.end();
}
