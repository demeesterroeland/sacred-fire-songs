import { test, expect, type Page } from '@playwright/test';
import pg from 'pg';
import { ROLES } from '../fixtures/roles';
import { SHARE_EXPLAIN_FIXTURE_IDS as IDS } from '../fixtures/ids';
import { clickPractice } from '../fixtures/songActions';

/**
 * Story 6.1.18 / G4.5 (#402): the Share dialog explains who can be found and what sharing does on
 * a private song, and changes nothing until the owner confirms.
 * Gherkin: docs/testing/ux-v2-share-explain.feature.
 *
 * The member owns a private song with one take (fixed ids, removed by e2e/global-teardown.ts).
 * The journey turns the song public, so it runs on the mobile project only: two projects on the
 * same rows would race.
 */
test.use({ storageState: ROLES.member.storage, viewport: { width: 390, height: 844 } });
test.describe.configure({ timeout: 90_000 });

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const SONG_TITLE = 'E2E Share Explain Song';
const TAKE = 'E2E Share Explain Take';

async function withDb<T>(fn: (client: pg.Client) => Promise<T>): Promise<T> {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}
const songIsPublic = () =>
  withDb(async (c) => {
    const { rows } = await c.query<{ is_public: boolean }>('SELECT is_public FROM public.compositions WHERE id = $1', [IDS.song]);
    return rows[0].is_public;
  });
const shareCount = () =>
  withDb(async (c) => {
    const { rows } = await c.query<{ n: string }>('SELECT count(*) AS n FROM public.recording_shares WHERE recording_id = $1', [IDS.take]);
    return Number(rows[0].n);
  });

test.beforeEach(async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chrome-headless', 'mutates the fixture song; mobile project only');
  await withDb(async (client) => {
    const { rows } = await client.query<{ id: string }>('SELECT id FROM public.profiles WHERE email = $1', [ROLES.member.email]);
    if (!rows[0]) throw new Error('Seeded member profile missing');
    const member = rows[0].id;
    await client.query(
      `INSERT INTO public.compositions (id, title, original_author, owner_id, is_public)
       VALUES ($1, $2, 'E2E Author', $3, false)
       ON CONFLICT (id) DO UPDATE SET is_public = false, owner_id = EXCLUDED.owner_id`,
      [IDS.song, SONG_TITLE, member]
    );
    await client.query(
      `INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, contributor_id)
       VALUES ($1, $2, 'E2E Version', '{title: E2E}', $3)
       ON CONFLICT (id) DO UPDATE SET contributor_id = EXCLUDED.contributor_id`,
      [IDS.version, IDS.song, member]
    );
    await client.query(
      `INSERT INTO public.user_recordings (id, user_id, song_version_id, recording_name, storage_path, duration_seconds)
       VALUES ($1, $2, $3, $4, $5, 42)
       ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, recording_name = EXCLUDED.recording_name`,
      [IDS.take, member, IDS.version, TAKE, `e2e-share-explain/${IDS.take}.webm`]
    );
    await client.query('DELETE FROM public.recording_shares WHERE recording_id = $1', [IDS.take]);
  });
});

async function openShareDialog(page: Page) {
  await page.goto(`/songs/${IDS.song}`);
  await clickPractice(page); // phone: the action bar (#393)
  await expect(page.getByTestId('practice-drawer')).toBeVisible({ timeout: 10_000 });
  const recordTab = page.locator('[data-testid="practice-tab-record"]');
  if (await recordTab.count()) await recordTab.first().click({ force: true });
  const row = page.getByTestId('rehearsal-drawer-body').locator('[data-recording-id]', { hasText: TAKE });
  await row.locator('button[aria-label="More actions"]').click();
  // The take's actions are a bottom sheet (#401); Share opens the dialog once the sheet has closed.
  const sheet = page.getByRole('dialog').filter({ has: page.getByRole('button', { name: 'Share', exact: true }) });
  await sheet.getByRole('button', { name: 'Share', exact: true }).click();
  const dialog = page.getByTestId('share-dialog');
  await expect(dialog).toBeVisible({ timeout: 10_000 });
  return dialog;
}

test('sharing a take on a private own song explains both effects and changes nothing until confirmed', async ({ page }) => {
  const dialog = await openShareDialog(page);

  const confirmation = dialog.getByTestId('share-private-confirm');
  await expect(confirmation).toBeVisible({ timeout: 15_000 });
  await expect(dialog.getByRole('heading', { name: 'Make the song public to share this recording?' })).toBeVisible();
  await expect(confirmation).toContainText('The song lyrics become public');
  await expect(confirmation).toContainText(`The recording "${TAKE}" is shared with the members you pick next`);
  await expect(confirmation).toContainText('Nothing changes until you confirm');
  await expect(dialog.getByPlaceholder(/Search user/)).toHaveCount(0);
  expect(await songIsPublic()).toBe(false);
  expect(await shareCount()).toBe(0);

  // Cancel: still nothing changed.
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByTestId('share-dialog')).toHaveCount(0);
  expect(await songIsPublic()).toBe(false);

  // Confirm: the song becomes public and the member search (with its hint) appears.
  const again = await openShareDialog(page);
  await again.getByRole('button', { name: 'Make song public and continue' }).click();
  await expect(again.getByText('You can share with registered members only. Someone without an account needs to sign up first.')).toBeVisible({ timeout: 15_000 });
  expect(await songIsPublic()).toBe(true);
  await expect(again.getByPlaceholder(/Search user/)).toBeFocused();
  expect(await shareCount()).toBe(0);

  // Empty search state.
  await again.getByPlaceholder(/Search user/).fill('zzqxjv');
  await expect(again.getByTestId('share-no-results')).toContainText('No registered member found for "zzqxjv"');
  await expect(again.getByTestId('share-no-results')).toContainText('Someone without an account needs to sign up first.');
});
