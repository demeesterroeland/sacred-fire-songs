import { test, expect, type Page } from '@playwright/test';
import pg from 'pg';
import { ROLES } from '../fixtures/roles';
import { clickPractice } from '../fixtures/songActions';
import { PUBLISH_CONSENT_FIXTURE_IDS as IDS } from '../fixtures/ids';

/**
 * Story 6.1.21 / G4.8 (#405): the publish dialog names the song and says who will hear the take.
 * Gherkin: docs/testing/ux-v2-publish-consent.feature (@e2e).
 *
 * The member owns private takes on a public song and on a private song. Fixed ids;
 * e2e/global-teardown.ts removes the rows.
 */
test.use({ storageState: ROLES.member.storage, viewport: { width: 390, height: 844 } });
test.describe.configure({ timeout: 90_000, mode: 'serial' });

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const SONG_TITLE = 'E2E Publish Consent Song';
const PRIVATE_SONG_TITLE = 'E2E Private Consent Song';
const TAKE = 'E2E Consent Take';
const LONG_TAKE = `E2E${'W'.repeat(90)}Take`;
const PRIVATE_TAKE = 'E2E Private Song Take';
const GUESTS = 'Everyone visiting this song, including guests, will be able to listen.';

async function withDb<T>(fn: (c: pg.Client) => Promise<T>): Promise<T> {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

const takeRow = (id: string = IDS.take) =>
  withDb(async (c) => {
    const { rows } = await c.query<{ is_public: boolean; singer_consent_confirmed: boolean }>(
      'SELECT is_public, singer_consent_confirmed FROM public.user_recordings WHERE id = $1',
      [id]
    );
    return rows[0];
  });

test.beforeAll(async ({}, testInfo) => {
  if (!/mobile/.test(testInfo.project.name)) return;
  await withDb(async (client) => {
    const { rows } = await client.query<{ id: string }>('SELECT id FROM public.profiles WHERE email = $1', [ROLES.member.email]);
    if (!rows[0]) throw new Error(`Seeded profile missing: ${ROLES.member.email}`);
    const member = rows[0].id;
    const song = async (id: string, version: string, title: string, isPublic: boolean) => {
      await client.query(
        `INSERT INTO public.compositions (id, title, original_author, owner_id, is_public)
         VALUES ($1, $2, 'E2E Author', $3, $4)
         ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, owner_id = EXCLUDED.owner_id, is_public = EXCLUDED.is_public`,
        [id, title, member, isPublic]
      );
      await client.query(
        `INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, contributor_id)
         VALUES ($1, $2, 'E2E Version', '{title: E2E}', $3)
         ON CONFLICT (id) DO UPDATE SET contributor_id = EXCLUDED.contributor_id`,
        [version, id, member]
      );
    };
    const take = async (id: string, version: string, name: string) => {
      await client.query(
        `INSERT INTO public.user_recordings
           (id, user_id, song_version_id, recording_name, storage_path, duration_seconds, is_public, singer_consent_confirmed)
         VALUES ($1, $2, $3, $4, $5, 42, false, false)
         ON CONFLICT (id) DO UPDATE SET is_public = false, singer_consent_confirmed = false, recording_name = EXCLUDED.recording_name`,
        [id, member, version, name, `e2e-publish-consent/${id}.webm`]
      );
    };
    await song(IDS.song, IDS.version, SONG_TITLE, true);
    await take(IDS.take, IDS.version, TAKE);
    await take(IDS.longTake, IDS.version, LONG_TAKE);
    await song(IDS.privateSong, IDS.privateVersion, PRIVATE_SONG_TITLE, false);
    await take(IDS.privateTake, IDS.privateVersion, PRIVATE_TAKE);
  });
});

test.beforeEach(async ({}, testInfo) => {
  test.skip(!/mobile/.test(testInfo.project.name), 'phone project only (take actions sheet)');
});

async function openPublishDialog(page: Page, songId: string, takeName: string) {
  await page.goto(`/songs/${songId}`);
  await clickPractice(page);
  await expect(page.locator('h3:has-text("Practice")')).toBeVisible({ timeout: 10_000 });
  const recordTab = page.locator('[data-testid="practice-tab-record"]');
  if (await recordTab.count()) await recordTab.first().click({ force: true });
  const row = page.locator('[data-recording-id]', { hasText: takeName });
  await expect(row).toHaveCount(1, { timeout: 15_000 });
  await row.locator('button[aria-label="More actions"]').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Make Public', exact: true }).click();
  const dialog = page.getByTestId('publish-dialog');
  await expect(dialog).toBeVisible({ timeout: 10_000 });
  return { dialog, row };
}

test('the dialog names the take and the song and says guests can listen', async ({ page }) => {
  const { dialog, row } = await openPublishDialog(page, IDS.song, TAKE);
  await expect(dialog).toContainText(TAKE);
  await expect(dialog).toContainText(SONG_TITLE);
  await expect(dialog.getByTestId('publish-audience')).toHaveText(GUESTS);
  await expect(dialog).toContainText(
    "You can make the take private again at any time. New visitors then can't listen, but this can't undo what someone already heard or saved."
  );
  // The audience sentence is a status line and the dialog's description.
  await expect(dialog.getByTestId('publish-audience')).toHaveAttribute('role', 'status');
  const describedBy = (await dialog.getAttribute('aria-describedby')) ?? '';
  const audienceId = await dialog.getByTestId('publish-audience').getAttribute('id');
  expect(describedBy.split(' ')).toContain(audienceId);

  const publish = dialog.getByRole('button', { name: 'Publish Take' });
  await expect(publish).toBeDisabled();
  for (const button of await dialog.getByRole('button').all()) {
    const box = await button.boundingBox();
    expect(box!.height, await button.innerText()).toBeGreaterThanOrEqual(44);
  }

  // Cancel changes nothing and focus returns to the take, not to the page body.
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByTestId('publish-dialog')).toHaveCount(0);
  expect(await takeRow()).toEqual({ is_public: false, singer_consent_confirmed: false });
  await expect(row.locator('button[aria-label="More actions"]')).toBeFocused();
});

test('a very long take name stays inside the dialog and Publish stays reachable', async ({ page }) => {
  const { dialog } = await openPublishDialog(page, IDS.song, LONG_TAKE);
  await expect(dialog).toContainText(LONG_TAKE);
  const box = (await dialog.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 0.5);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 0.5);
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  await dialog.getByRole('checkbox').check();
  await expect(dialog.getByRole('button', { name: 'Publish Take' })).toBeInViewport();
});

test('a take on a private song cannot be published until the song is public', async ({ page }) => {
  await withDb((c) => c.query('UPDATE public.compositions SET is_public = false WHERE id = $1', [IDS.privateSong]));
  const { dialog } = await openPublishDialog(page, IDS.privateSong, PRIVATE_TAKE);
  await expect(dialog).toContainText(PRIVATE_TAKE);
  await expect(dialog).toContainText(PRIVATE_SONG_TITLE);
  const audience = dialog.getByTestId('publish-audience');
  await expect(audience).toContainText('private');
  await expect(audience).toContainText('public first');
  await expect(audience).not.toContainText('guests');
  await expect(dialog.getByRole('button', { name: 'Publish Take' })).toHaveCount(0);
  await expect(dialog.getByRole('checkbox')).toHaveCount(0);

  // The owner makes the song public from here, then can publish the take.
  await dialog.getByRole('button', { name: 'Make song public and continue' }).click();
  await expect(audience).toHaveText(GUESTS, { timeout: 10_000 });
  await expect(dialog.getByRole('button', { name: 'Publish Take' })).toBeDisabled();
  expect(await takeRow(IDS.privateTake)).toEqual({ is_public: false, singer_consent_confirmed: false });

  // Ticking the box now publishes the take on the song that has just been made public.
  await dialog.getByRole('checkbox').check();
  await dialog.getByRole('button', { name: 'Publish Take' }).click();
  await expect(page.getByTestId('publish-dialog')).toHaveCount(0, { timeout: 10_000 });
  await expect.poll(() => takeRow(IDS.privateTake)).toEqual({ is_public: true, singer_consent_confirmed: true });

  // Leave the song and its take private for the next run.
  await withDb(async (c) => {
    await c.query('UPDATE public.compositions SET is_public = false WHERE id = $1', [IDS.privateSong]);
    await c.query('UPDATE public.user_recordings SET is_public = false, singer_consent_confirmed = false WHERE id = $1', [IDS.privateTake]);
  });
});

test('confirming the singer consent publishes the take', async ({ page }) => {
  const { dialog } = await openPublishDialog(page, IDS.song, TAKE);
  await dialog.getByRole('checkbox').check();
  await dialog.getByRole('button', { name: 'Publish Take' }).click();
  await expect(page.getByTestId('publish-dialog')).toHaveCount(0, { timeout: 10_000 });
  await expect.poll(() => takeRow()).toEqual({ is_public: true, singer_consent_confirmed: true });
});
