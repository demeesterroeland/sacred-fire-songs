import { test, expect } from '@playwright/test';
import en from '../../messages/en';

/**
 * #578: malformed [id] links render the not-found page (never a database UUID error),
 * and a real song load failure shows the translated message instead of raw error.message.
 * Gherkin: docs/testing/ux-v2-broken-song-links.feature (@e2e).
 */
const MISSING_UUID = '00000000-0000-4000-8000-000000000000';

test.describe('Broken song links (#578)', () => {
  test.use({ locale: 'en-US' });

  test('malformed id /songs/xyz shows the same not-found page as a missing UUID, with no Retry button', async ({
    page,
  }) => {
    await page.goto('/songs/xyz');
    await expect(page.getByRole('heading', { name: en['feedback.notFound.title'] })).toBeVisible();
    await expect(page.getByText(en['feedback.notFound.description'])).toBeVisible();
    await expect(page.getByRole('button', { name: en['song.error.retry'] })).toHaveCount(0);
    await expect(page.getByText(/invalid input syntax/i)).toHaveCount(0);

    await page.goto(`/songs/${MISSING_UUID}`);
    await expect(page.getByRole('heading', { name: en['feedback.notFound.title'] })).toBeVisible();
    await expect(page.getByText(en['feedback.notFound.description'])).toBeVisible();
    await expect(page.getByRole('button', { name: en['song.error.retry'] })).toHaveCount(0);
  });

  test('malformed ids on other [id] routes also render not-found', async ({ page }) => {
    await page.goto('/songs/xyz/edit');
    await expect(page.getByRole('heading', { name: en['feedback.notFound.title'] })).toBeVisible();

    await page.goto('/users/xyz');
    await expect(page.getByRole('heading', { name: en['feedback.notFound.page.title'] })).toBeVisible();
    await expect(page.getByText(en['feedback.notFound.page.description'])).toBeVisible();

    await page.goto('/library/playlists/xyz');
    await expect(page.getByRole('heading', { name: en['feedback.notFound.page.title'] })).toBeVisible();

    await page.goto('/recordings/xyz');
    await expect(page.getByRole('heading', { name: en['feedback.notFound.recording.title'] })).toBeVisible();
  });

  test('a real load failure shows the translated error with Retry and hides raw error.message', async ({ page }) => {
    const rawDbMessage = 'raw postgrest failure: relation compositions is locked';
    await page.route('**/rest/v1/compositions*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'XX000',
          message: rawDbMessage,
          details: null,
          hint: null,
        }),
      });
    });

    await page.goto(`/songs/${MISSING_UUID}`);
    await expect(page.getByRole('heading', { name: en['song.error.loadFailed'] })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(en['song.error.unexpected'])).toBeVisible();
    await expect(page.getByRole('button', { name: en['song.error.retry'] })).toBeVisible();
    await expect(page.getByText(rawDbMessage)).toHaveCount(0);
  });
});
