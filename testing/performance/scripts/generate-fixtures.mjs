import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConnectionString = process.env.PROD_DB_URL || "postgresql://postgres.eiyhjlgmdguzzcvrckvs:zxX9YuvUmpNAVKdd@aws-1-eu-west-1.pooler.supabase.com:6543/postgres";

async function generate() {
  console.log("🔍 Fetching test song fixtures from live production database...");
  const client = new Client({ connectionString: dbConnectionString });
  await client.connect();

  // 1. Get 1 Public Playlist and its songs
  const playlistRes = await client.query(`
    SELECT s.id as playlist_id, s.title as playlist_title, s.description
    FROM setlists s
    WHERE s.is_public = true
    LIMIT 1
  `);

  let playlistInfo = null;
  let playlistSongs = [];

  if (playlistRes.rows.length > 0) {
    const pl = playlistRes.rows[0];
    const songsRes = await client.query(`
      SELECT DISTINCT c.id, c.title, si.order_index
      FROM setlist_items si
      JOIN song_versions sv ON sv.id = si.song_version_id
      JOIN compositions c ON c.id = sv.composition_id
      WHERE si.setlist_id = $1
      ORDER BY si.order_index ASC
    `, [pl.playlist_id]);

    playlistInfo = {
      id: pl.playlist_id,
      title: pl.playlist_title,
      description: pl.description,
      urlPath: "/library/playlists/" + pl.playlist_id
    };
    playlistSongs = songsRes.rows.map(r => ({ id: r.id, title: r.title }));
  }

  // 2. Get 10 Latest Added Songs
  const latestRes = await client.query(`
    SELECT c.id, c.title, c.created_at
    FROM compositions c
    ORDER BY c.created_at DESC
    LIMIT 10
  `);

  // 3. Get 25 Random Songs
  const randomRes = await client.query(`
    SELECT c.id, c.title 
    FROM compositions c 
    ORDER BY RANDOM() 
    LIMIT 25
  `);

  // 4. Get 10 Media Songs (YouTube / SoundCloud)
  const mediaRes = await client.query(`
    SELECT DISTINCT c.id, c.title, sv.youtube_url, sv.soundcloud_url
    FROM compositions c
    JOIN song_versions sv ON sv.composition_id = c.id
    WHERE (sv.youtube_url IS NOT NULL AND sv.youtube_url != '') 
       OR (sv.soundcloud_url IS NOT NULL AND sv.soundcloud_url != '')
    LIMIT 10
  `);

  // 5. Get 5 Longest Songs
  const longestRes = await client.query(`
    SELECT c.id, c.title, LENGTH(sv.content_chordpro) as content_length
    FROM compositions c
    JOIN song_versions sv ON sv.composition_id = c.id
    ORDER BY LENGTH(sv.content_chordpro) DESC
    LIMIT 5
  `);

  await client.end();

  const fixtureData = {
    updatedAt: new Date().toISOString(),
    description: "Configurable benchmark target fixtures (25 Random, 10 Media, 5 Longest, 10 Latest, 1 Public Playlist + Songs)",
    publicPlaylist: playlistInfo,
    playlistSongs: playlistSongs,
    latestSongs: latestRes.rows.map(r => ({ id: r.id, title: r.title, created_at: r.created_at })),
    randomSongs: randomRes.rows.map(r => ({ id: r.id, title: r.title })),
    mediaSongs: mediaRes.rows.map(r => ({ id: r.id, title: r.title, youtube_url: r.youtube_url, soundcloud_url: r.soundcloud_url })),
    longestSongs: longestRes.rows.map(r => ({ id: r.id, title: r.title, content_length: r.content_length }))
  };

  const targetDir = path.resolve(__dirname, "..");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const file = path.join(targetDir, "benchmark-song-fixtures.json");
  fs.writeFileSync(file, JSON.stringify(fixtureData, null, 2));
  console.log("✅ Successfully saved updated benchmark fixtures to:", file);
}

generate().catch(console.error);
