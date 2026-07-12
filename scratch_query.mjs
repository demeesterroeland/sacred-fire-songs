import pg from 'pg';
const { Client } = pg;

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.REDACTED_STAGING_PROJECT_ID:F1o4GKbH3u5rboGu@aws-1-eu-west-1.pooler.supabase.com:5432/postgres'
  });

  try {
    await client.connect();
    const res = await client.query(`
      SELECT c.id, c.title, sv.youtube_url, sv.spotify_url, sv.soundcloud_url 
      FROM public.song_versions sv
      JOIN public.compositions c ON sv.composition_id = c.id
      WHERE sv.youtube_url IS NOT NULL 
        AND sv.spotify_url IS NOT NULL 
        AND sv.soundcloud_url IS NOT NULL
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await client.end();
  }
}

main();
