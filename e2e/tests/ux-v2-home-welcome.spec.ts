import { test, expect, type Page } from '@playwright/test';
import { ROLES } from '../fixtures/roles';

/**
 * Story 6.1.28 / G6.3 (#412): a first-time visitor sees a welcome line, a search field and a
 * "Recently added" row on Home. Members keep "Your library".
 * Gherkin: docs/testing/ux-v2-home-welcome.feature (@e2e).
 */
test.use({ viewport: { width: 390, height: 844 } });

const LOCALE_KEY = 'sacred-fire-songs-locale';
const pinEnglish = (page: Page) => page.addInitScript(([k, v]) => localStorage.setItem(k, v), [LOCALE_KEY, 'en']);
const homeSearch = (page: Page) => page.getByRole('search').getByRole('searchbox', { name: 'Search songs' });
const recent = (page: Page) => page.getByTestId('recently-added');

test.describe('guest', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('first visit: welcome line, search field and Recently added are visible', async ({ page }) => {
    await pinEnglish(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Welcome' })).toBeVisible();
    await expect(page.getByText(/shared songbook of medicine songs/)).toBeVisible();
    await expect(homeSearch(page)).toBeVisible();
    await expect(recent(page).getByRole('heading', { name: 'Recently added' })).toBeVisible();
    const rows = recent(page).getByTestId('song-row');
    expect(await rows.count()).toBeGreaterThan(0);
    expect(await rows.count()).toBeLessThanOrEqual(10);
    // The welcome block comes before the category grid.
    const field = (await homeSearch(page).boundingBox())!;
    const grid = (await page.getByTestId('category-grid').boundingBox())!;
    expect(field.y).toBeLessThan(grid.y);
    expect(field.height).toBeGreaterThanOrEqual(44);
  });

  test('the header has no second search field on Home (the inline one replaces it)', async ({ page }) => {
    await pinEnglish(page);
    await page.goto('/');
    await expect(homeSearch(page)).toBeVisible();
    await expect(page.locator('#app-navbar').getByRole('textbox')).toHaveCount(0);
    await expect(page.getByRole('searchbox')).toHaveCount(1);
    // other pages keep the header field
    await page.goto('/songs');
    await expect(page.locator('#app-navbar').getByRole('textbox')).toHaveCount(1);
  });

  test('searching from Home opens the song list filtered by the term', async ({ page }) => {
    await pinEnglish(page);
    await page.goto('/');
    await expect(page.getByTestId('bottom-nav')).toBeVisible();
    await homeSearch(page).fill('agua');
    await homeSearch(page).press('Enter');
    await expect(page).toHaveURL(/\/songs\?search=agua/);
  });

  test('focusing the Home search offers the category chips (G7.1 panel)', async ({ page }) => {
    await pinEnglish(page);
    await page.goto('/');
    await homeSearch(page).click();
    const panel = page.getByTestId('search-suggestions');
    await expect(panel).toBeVisible();
    await panel.getByRole('region', { name: 'Categories' }).getByRole('button').first().click();
    await expect(page).toHaveURL(/\/songs\?category=/);
  });

  test('a Recently added row opens the song', async ({ page }) => {
    await pinEnglish(page);
    await page.goto('/');
    await recent(page).getByTestId('song-row').first().getByRole('link').first().click();
    await expect(page).toHaveURL(/\/songs\/[0-9a-f-]{36}/);
  });
});

test.describe('member', () => {
  test.use({ storageState: ROLES.member.storage });

  test('keeps Your library and gets no welcome block', async ({ page }) => {
    await pinEnglish(page);
    await page.goto('/');
    await expect(page.getByText('Your library')).toBeVisible();
    await expect(page.getByTestId('recently-added')).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1, name: 'Welcome' })).toHaveCount(0);
    // members keep the header search field on Home
    await expect(page.locator('#app-navbar').getByRole('textbox')).toHaveCount(1);
  });
});
