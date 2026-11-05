import pg from 'pg';

/**
 * Story 6.1.33 / G9.1 (#417): leave no test fixtures behind in the shared
 * database, so demos and screenshots show real-looking data.
 *
 * Runs once after all projects (desktop + mobile share the same fixed ids, so
 * a per-spec afterAll would delete rows the other project still uses).
 * Removes the admin-users fixtures by id and any "Smoke Test Playlist <ms>"
 * left over when the smoke spec failed before its own UI clean-up.
 */
const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

// Keep in sync with e2e/tests/admin-users.spec.ts.
export const ADMIN_USERS_FIXTURE_IDS = {
  song: 'eeeeeeee-3610-4000-a000-000000000001',
  version: 'eeeeeeee-3610-4000-a000-000000000002',
  playlist: 'eeeeeeee-3610-4000-a000-000000000003',
} as const;

export default async function globalTeardown(): Promise<void> {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
  } catch (err) {
    console.warn('[e2e globalTeardown] database unreachable, skipping clean-up:', err);
    return;
  }
  try {
    const ids = ADMIN_USERS_FIXTURE_IDS;
    await client.query('DELETE FROM public.setlists WHERE id = $1', [ids.playlist]);
    await client.query('DELETE FROM public.song_versions WHERE id = $1', [ids.version]);
    await client.query('DELETE FROM public.compositions WHERE id = $1', [ids.song]);
    const { rowCount } = await client.query(
      "DELETE FROM public.setlists WHERE title ~ '^Smoke Test Playlist [0-9]+$'"
    );
    console.log(`[e2e globalTeardown] removed test fixtures (${rowCount ?? 0} smoke playlists).`);
  } finally {
    await client.end();
  }
}
