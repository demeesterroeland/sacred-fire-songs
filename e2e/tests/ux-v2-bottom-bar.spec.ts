import { test, expect, type Page } from '@playwright/test';
import { ROLES } from '../fixtures/roles';

/**
 * Story 6.1.24 / G5.3 (#408), UXD-1: the bottom bar is Home · Search · Library.
 * Gherkin: docs/testing/ux-v2-bottom-bar.feature (@e2e).
 */
test.use({ viewport: { width: 390, height: 844 } });

const LOCALE_KEY = 'sacred-fire-songs-locale';
const pinEnglish = (page: Page) => page.addInitScript(([k, v]) => localStorage.setItem(k, v), [LOCALE_KEY, 'en']);
// The bottom bar is the only <nav> fixed to the bottom of the viewport.
const bar = (page: Page) => page.getByTestId('bottom-nav');

test.describe('guest', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const route of ['/', '/songs', '/library/playlists']) {
    test(`bar shows exactly Home, Search, Library on ${route}`, async ({ page }) => {
      await pinEnglish(page);
      await page.goto(route);
      const links = bar(page).getByRole('link');
      await expect(links).toHaveCount(3);
      await expect(links).toHaveText(['Home', 'Search', 'Library']);
      await expect(bar(page).getByRole('button')).toHaveCount(0);

      for (const link of await links.all()) {
        const box = (await link.boundingBox())!;
        expect(box.height).toBeGreaterThanOrEqual(44);
        const size = await link.locator('span').last().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
        expect(size).toBeGreaterThanOrEqual(12);
      }
      expect(await bar(page).locator('[aria-current="page"]').count()).toBeLessThanOrEqual(1);
    });
  }

  test('Search opens the song list with the search field focused', async ({ page }) => {
    await pinEnglish(page);
    // A tap before React hydrates is a plain navigation (no focus request): wait for the
    // bar's hydration flag once, then tap a single time.
    await page.goto('/');
    await expect(bar(page)).toHaveAttribute('data-hydrated', 'true');
    await bar(page).getByRole('link', { name: 'Search' }).click();
    await expect(page).toHaveURL(/\/songs$/);
    await expect(page.getByPlaceholder(/Search \d+\+ songs/)).toBeFocused();
    await expect(bar(page).getByRole('link', { name: 'Search' })).toHaveAttribute('aria-current', 'page');
  });

  // #574: Explore has no page of its own; old links redirect to the song list (ux-v2-explore-redirect.spec.ts).
  test('/explore opens the song list', async ({ page }) => {
    await page.goto('/explore');
    await expect(page).toHaveURL(/\/songs$/);
    await expect(page.getByRole('heading', { name: 'Page not found' })).toHaveCount(0);
  });
});

test.describe('member', () => {
  test.use({ storageState: ROLES.member.storage });

  test('Create is a "+" in Library that offers Add Song and New Playlist', async ({ page }) => {
    await pinEnglish(page);
    await page.goto('/library/playlists');
    await expect(bar(page).getByRole('link')).toHaveCount(3);
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    const sheet = page.getByRole('dialog');
    await expect(sheet.getByRole('button', { name: 'Add Song' })).toBeVisible();
    await expect(sheet.getByRole('button', { name: 'New Playlist' })).toBeVisible();
    await sheet.getByRole('button', { name: 'New Playlist' }).click();
    await expect(page).toHaveURL(/\/library\/playlists\/add/);
  });

  test('"+" is not on Home or the song list', async ({ page }) => {
    await pinEnglish(page);
    for (const route of ['/', '/songs']) {
      await page.goto(route);
      await expect(page.getByRole('button', { name: 'Create', exact: true })).toHaveCount(0);
    }
  });
});
