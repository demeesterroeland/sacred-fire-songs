import { test, expect } from '@playwright/test';
import { ROLES } from '../fixtures/roles';

// Story 6.1.22 (G5.1, #406): an unknown URL is a real 404 for every role, never a login redirect.
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
      await page.goto('/songs/00000000-0000-4000-a000-000000000000');
      await expect(page.getByRole('heading', { name: 'Song Not Found' })).toBeVisible();
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
