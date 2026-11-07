import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import pg from 'pg';
import { ROLES, passwordFor } from '../fixtures/roles';
import { clickPractice } from '../fixtures/songActions';
import { PUBLISH_CONSENT_FIXTURE_IDS as IDS } from '../fixtures/ids';

/**
 * Story 6.1.21 / G4.8 (#405), UXD-2: guests hear public takes (with the singer consent) on the
 * Listen tab, read only. Gherkin: docs/testing/ux-v2-publish-consent.feature (@e2e).
 *
 * The member owns a public song with one public take; its audio is uploaded through the Storage
 * API into the member's own folder and removed again afterwards. Fixed ids; e2e/global-teardown.ts
 * removes the rows.
 */
test.use({ storageState: { cookies: [], origins: [] }, viewport: { width: 390, height: 844 } });
test.describe.configure({ timeout: 90_000, mode: 'serial' });

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const SONG_TITLE = 'E2E Guest Takes Song';
const EMPTY_SONG_TITLE = 'E2E Guest Empty Song';
const TAKE = 'E2E Guest Take';

let storageKey = '';
const supabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
    { auth: { persistSession: false } }
  );

test.beforeAll(async ({}, testInfo) => {
  if (!/mobile/.test(testInfo.project.name)) return;
  // The audio file goes into the member's own folder through the Storage API.
  const api = supabase();
  const { data, error } = await api.auth.signInWithPassword({ email: ROLES.member.email, password: passwordFor('member') });
  if (error || !data.user) throw new Error(`Member sign-in failed: ${error?.message}`);
  const member = data.user.id;
  storageKey = `${member}/e2e-guest-takes-${IDS.guestTake}.wav`;
  const upload = await api.storage
    .from('rehearsals')
    .upload(storageKey, fs.readFileSync('e2e/fixtures/dummy-audio.wav'), { contentType: 'audio/wav', upsert: true });
  if (upload.error) throw new Error(`Upload failed: ${upload.error.message}`);

  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    const song = async (id: string, version: string, title: string) => {
      await client.query(
        `INSERT INTO public.compositions (id, title, original_author, owner_id, is_public)
         VALUES ($1, $2, 'E2E Author', $3, true)
         ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, owner_id = EXCLUDED.owner_id, is_public = true`,
        [id, title, member]
      );
      await client.query(
        `INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, contributor_id)
         VALUES ($1, $2, 'E2E Version', '{title: E2E}', $3)
         ON CONFLICT (id) DO UPDATE SET contributor_id = EXCLUDED.contributor_id`,
        [version, id, member]
      );
    };
    await song(IDS.guestSong, IDS.guestVersion, SONG_TITLE);
    await song(IDS.emptySong, IDS.emptyVersion, EMPTY_SONG_TITLE);
    await client.query(
      `INSERT INTO public.user_recordings
         (id, user_id, song_version_id, recording_name, storage_path, duration_seconds, is_public, singer_consent_confirmed)
       VALUES ($1, $2, $3, $4, $5, 2, true, true)
       ON CONFLICT (id) DO UPDATE SET is_public = true, singer_consent_confirmed = true, storage_path = EXCLUDED.storage_path`,
      [IDS.guestTake, member, IDS.guestVersion, TAKE, storageKey]
    );
  } finally {
    await client.end();
  }
});

test.afterAll(async ({}, testInfo) => {
  if (!/mobile/.test(testInfo.project.name) || !storageKey) return;
  const api = supabase();
  const { error } = await api.auth.signInWithPassword({ email: ROLES.member.email, password: passwordFor('member') });
  if (!error) await api.storage.from('rehearsals').remove([storageKey]);
});

test.beforeEach(async ({}, testInfo) => {
  test.skip(!/mobile/.test(testInfo.project.name), 'phone project only');
});

test('a guest sees a public take on the Listen tab, read only, and can play it', async ({ page }) => {
  await page.goto(`/songs/${IDS.guestSong}`);
  await clickPractice(page);
  await expect(page.getByTestId('practice-drawer')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('practice-tab-listen')).toHaveAttribute('aria-selected', 'true');

  const list = page.getByTestId('guest-public-takes');
  await expect(list).toBeVisible();
  const row = list.locator('[data-recording-id]', { hasText: TAKE });
  await expect(row).toHaveCount(1, { timeout: 15_000 });
  // Read only: no actions, no drag handle.
  await expect(row.locator('button[aria-label="More actions"]')).toHaveCount(0);
  await expect(row.locator('[aria-label*="rag"]')).toHaveCount(0);

  const play = row.locator('button[title="Play"]');
  await expect(play).toBeEnabled({ timeout: 15_000 });
  await play.click();
  await expect(page.getByTestId('bottom-mini-player')).toBeVisible({ timeout: 10_000 });
  await expect(row.locator('button[title="Pause"]')).toBeVisible({ timeout: 10_000 });

  // The Record tab stays behind the sign-in gate.
  await page.getByTestId('practice-tab-record').click({ force: true });
  await expect(page.getByTestId('guest-gate').first()).toBeVisible();
});

test('a song without public takes shows an empty state to a guest', async ({ page }) => {
  await page.goto(`/songs/${IDS.emptySong}`);
  await clickPractice(page);
  await expect(page.getByTestId('practice-drawer')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('guest-public-takes-empty')).toHaveText('No public recordings of this song yet.', { timeout: 15_000 });
});

test('a take link opens a guest on Listen with that take highlighted, in view and playable', async ({ page }) => {
  await page.goto(`/songs/${IDS.guestSong}?recording=${IDS.guestTake}`);
  await expect(page.getByTestId('practice-drawer')).toBeVisible({ timeout: 15_000 });
  // Listen, not the Record gate.
  await expect(page.getByTestId('practice-tab-listen')).toHaveAttribute('aria-selected', 'true');
  const row = page.getByTestId('guest-public-takes').locator('[data-recording-id]', { hasText: TAKE });
  await expect(row).toHaveAttribute('aria-current', 'true', { timeout: 15_000 });
  await expect(row).toBeInViewport({ timeout: 10_000 });

  const play = row.locator('button[title="Play"]');
  await expect(play).toBeEnabled({ timeout: 15_000 });
  await play.click();
  await expect(row.locator('button[title="Pause"]')).toBeVisible({ timeout: 10_000 });
});

test('a link to a take that is not there keeps the sign-in prompt of the Record tab', async ({ page }) => {
  await page.goto(`/songs/${IDS.guestSong}?recording=00000000-0000-4000-a000-0000000000bb`);
  await expect(page.getByTestId('practice-drawer')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('guest-gate').first()).toBeVisible({ timeout: 10_000 });
});

test.describe('on a wide screen', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('Practice opens a guest on Listen, not on the Record gate', async ({ page }) => {
    await page.goto(`/songs/${IDS.guestSong}`);
    await clickPractice(page);
    await expect(page.getByTestId('practice-drawer')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('practice-tab-listen')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('guest-public-takes').locator('[data-recording-id]', { hasText: TAKE })).toHaveCount(1, { timeout: 15_000 });
  });
});
