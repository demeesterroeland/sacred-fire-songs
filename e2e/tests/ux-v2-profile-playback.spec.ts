import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import { ROLES, passwordFor } from '../fixtures/roles';
import { PROFILE_PLAYBACK_FIXTURE_IDS as IDS } from '../fixtures/ids';

/**
 * #490: recordings on a singer profile play on the page, one at a time, and the row opens
 * the song with that take. Gherkin: docs/testing/ux-v2-profile-playback.feature (@e2e).
 *
 * The spec inserts two takes of the member attributed to the musician under fixed ids and
 * uploads a sample MP3 for each as the member (own folder); e2e/global-teardown.ts removes the rows.
 */
test.use({ storageState: ROLES.member.storage, viewport: { width: 390, height: 844 } });
// Serial: one worker runs beforeAll once, so parallel workers don't race on the fixture inserts.
test.describe.configure({ mode: 'serial', timeout: 90_000 });

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const FIRST = 'E2E Profile Take One';
const SECOND = 'E2E Profile Take Two';
let musicianId = '';

test.beforeAll(async () => {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  let memberId = '';
  try {
    const profile = async (email: string) => {
      const { rows } = await client.query<{ id: string }>('SELECT id FROM public.profiles WHERE email = $1', [email]);
      if (!rows[0]) throw new Error(`Seeded profile missing: ${email}`);
      return rows[0].id;
    };
    memberId = await profile(ROLES.member.email);
    musicianId = await profile(ROLES.musician.email);

    await client.query(
      `INSERT INTO public.compositions (id, title, original_author, owner_id, is_public)
       VALUES ($1, 'E2E Profile Playback Song', 'E2E Author', $2, true)
       ON CONFLICT (id) DO UPDATE SET owner_id = EXCLUDED.owner_id, is_public = true`,
      [IDS.song, memberId]
    );
    await client.query(
      `INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, contributor_id)
       VALUES ($1, $2, 'E2E Version', '{title: E2E}', $3)
       ON CONFLICT (id) DO UPDATE SET contributor_id = EXCLUDED.contributor_id`,
      [IDS.version, IDS.song, memberId]
    );
    for (const [id, name, minutesAgo] of [[IDS.first, FIRST, 2], [IDS.second, SECOND, 1]] as const) {
      await client.query(
        `INSERT INTO public.user_recordings
           (id, user_id, song_version_id, recording_name, storage_path, duration_seconds, singer_profile_id, created_at)
         VALUES ($1, $2, $3, $4, $5, 30, $6, now() - make_interval(mins => $7))
         ON CONFLICT (id) DO UPDATE SET singer_profile_id = EXCLUDED.singer_profile_id, storage_path = EXCLUDED.storage_path`,
        [id, memberId, IDS.version, name, `${memberId}/e2e-profile-playback/${id}.mp3`, musicianId, minutesAgo]
      );
    }
  } finally {
    await client.end();
  }

  // Real audio, uploaded as the member into the member's own folder.
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: ROLES.member.email,
    password: passwordFor('member'),
  });
  if (signInError) throw signInError;
  const body = readFileSync(path.join(process.cwd(), 'supabase/seeds/audio/sample-fire-circle.mp3'));
  for (const id of [IDS.first, IDS.second]) {
    const { error } = await supabase.storage
      .from('rehearsals')
      .upload(`${memberId}/e2e-profile-playback/${id}.mp3`, body, { contentType: 'audio/mpeg', upsert: true });
    if (error) throw error;
  }
});

test('a recording on a singer profile plays here, one at a time', async ({ page }) => {
  await page.goto(`/users/${musicianId}`);

  const playFirst = page.getByRole('button', { name: `Play ${FIRST}` });
  const playSecond = page.getByRole('button', { name: `Play ${SECOND}` });
  await expect(playFirst).toBeVisible({ timeout: 15_000 });
  await expect(playSecond).toBeVisible();

  // The audio loads through the app's own origin (/supabase-api proxy), never from the address
  // the server used to sign it, which a self-hosted server may only know internally.
  const audioRequest = page.waitForRequest((r) => r.url().includes(`/storage/v1/object/sign/rehearsals/`));
  await playFirst.click();
  expect(new URL((await audioRequest).url()).pathname).toMatch(/^\/supabase-api\/storage\/v1\/object\/sign\//);
  expect(new URL((await audioRequest).url()).origin).toBe(new URL(page.url()).origin);
  await expect(page.getByRole('button', { name: `Pause ${FIRST}` })).toBeVisible({ timeout: 10_000 });

  await playSecond.click();
  await expect(page.getByRole('button', { name: `Pause ${SECOND}` })).toBeVisible({ timeout: 10_000 });
  // Starting the second recording stopped the first.
  await expect(page.getByRole('button', { name: `Play ${FIRST}` })).toBeVisible();

  await page.getByRole('button', { name: `Pause ${SECOND}` }).click();
  await expect(page.getByRole('button', { name: `Play ${SECOND}` })).toBeVisible();
});

test('a paused recording plays again from the same button', async ({ page }) => {
  await page.goto(`/users/${musicianId}`);
  const play = page.getByRole('button', { name: `Play ${FIRST}` });
  const pause = page.getByRole('button', { name: `Pause ${FIRST}` });
  await expect(play).toBeVisible({ timeout: 15_000 });

  await play.click();
  await expect(pause).toBeVisible({ timeout: 10_000 });
  await pause.click();
  await expect(play).toBeVisible();

  // Resume: the same button starts the same take again.
  await play.click();
  await expect(pause).toBeVisible({ timeout: 10_000 });
});

test('the play button is a 44 px target and the row opens the song with that take', async ({ page }) => {
  await page.goto(`/users/${musicianId}`);
  const play = page.getByRole('button', { name: `Play ${FIRST}` });
  await expect(play).toBeVisible({ timeout: 15_000 });
  const box = await play.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);

  await page.getByRole('link', { name: new RegExp(FIRST) }).click();
  await expect(page).toHaveURL(new RegExp(`/songs/${IDS.song}\\?recording=${IDS.first}`), { timeout: 15_000 });
});
