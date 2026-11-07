import { test, expect } from '@playwright/test';
import { ROLES } from '../fixtures/roles';

// Story 6.1.22 (G5.1, #406): an unknown URL is a real 404 for every role, never a login redirect.
//
// Two different mechanisms, two different HTTP statuses (measured on the production build):
// - Unmatched URL (no route): Next answers a real HTTP 404 with `app/not-found.tsx`.
// - notFound() thrown inside a streamed route (unknown song id, private playlist): because
//   `app/loading.tsx` flushes the shell first, the status line (200) is already sent when the
//   page calls notFound(). Next then renders the not-found UI and adds
//   `<meta name="robots" content="noindex">`, so crawlers do not index it, but the HTTP status
//   stays 200. We assert that real behaviour, not a status the framework cannot give here.
const UNKNOWN = '/this-page-does-not-exist';

async function expectGenericNotFound(page: import('@playwright/test').Page) {
  const response = await page.goto(UNKNOWN);
  expect(response?.status()).toBe(404);
  await expect(page).toHaveURL(new RegExp(`${UNKNOWN}$`));
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', '/');
}

test.describe('unknown URL is a real 404', () => {
  test.describe('guest', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('shows the 404 page, not the login page', async ({ page }) => {
      await expectGenericNotFound(page);
    });

    test('the home link leads home', async ({ page }) => {
      await page.goto(UNKNOWN);
      await page.getByRole('link', { name: 'Go home' }).click();
      await expect(page).toHaveURL(/\/$/);
    });

    test('protected /admin still sends a guest to login', async ({ page }) => {
      await page.goto('/admin');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('an unknown song id keeps the song-specific page', async ({ page }) => {
      const response = await page.goto('/songs/00000000-0000-4000-a000-000000000000');
      // Streamed route (see the note at the top): status 200, not-found UI, noindex.
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { name: 'Song Not Found' })).toBeVisible();
      await expect(page.locator('meta[name="robots"][content="noindex"]')).toHaveCount(1);
    });
  });

  test.describe('member', () => {
    test.use({ storageState: ROLES.member.storage });
    test('shows the 404 page', async ({ page }) => {
      await expectGenericNotFound(page);
    });
  });

  test.describe('admin', () => {
    test.use({ storageState: ROLES.admin.storage });
    test('shows the 404 page', async ({ page }) => {
      await expectGenericNotFound(page);
    });
  });
});
