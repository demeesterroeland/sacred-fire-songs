import pg from 'pg';
import { ADMIN_USERS_FIXTURE_IDS, SHARED_TAKES_FIXTURE_IDS } from './fixtures/ids';

/**
 * Story 6.1.33 / G9.1 (#417): leave no test fixtures behind in the shared
 * database, so demos and screenshots show real-looking data.
 *
 * Runs once after all projects (desktop + mobile share the same fixed ids, so
 * a per-spec afterAll would delete rows the other project still uses).
 * Removes the admin-users fixtures by id, plus timestamped smoke playlists and
 * E2E practice takes older than ten minutes (a concurrent run against the same
 * database keeps its in-flight rows). Clean-up never fails the test run.
 */
const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

const STALE = "created_at < now() - interval '10 minutes'";

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
    const shared = SHARED_TAKES_FIXTURE_IDS;
    await client.query('BEGIN');
    // Takes first (their shares and notifications cascade), then version and song.
    await client.query('DELETE FROM public.user_recordings WHERE id = ANY($1)', [[shared.sharedTake, shared.ownTake]]);
    await client.query('DELETE FROM public.song_versions WHERE id = $1', [shared.version]);
    await client.query('DELETE FROM public.compositions WHERE id = $1', [shared.song]);
    await client.query('DELETE FROM public.setlists WHERE id = $1', [ids.playlist]);
    await client.query('DELETE FROM public.song_versions WHERE id = $1', [ids.version]);
    await client.query('DELETE FROM public.compositions WHERE id = $1', [ids.song]);
    const playlists = await client.query(
      `DELETE FROM public.setlists WHERE title ~ '^Smoke Test Playlist [0-9]+$' AND ${STALE}`
    );
    const takes = await client.query(
      `DELETE FROM public.user_recordings
        WHERE recording_name ~ '^E2E (Practice|Uploaded File|Continuity Test) - [0-9]+$' AND ${STALE}`
    );
    await client.query('COMMIT');
    console.log(
      `[e2e globalTeardown] removed test fixtures (${playlists.rowCount ?? 0} smoke playlists, ${takes.rowCount ?? 0} E2E takes).`
    );
  } catch (err) {
    await client.query('ROLLBACK').catch(() => undefined);
    console.warn('[e2e globalTeardown] clean-up failed, fixtures left in place:', err);
  } finally {
    await client.end();
  }
}
