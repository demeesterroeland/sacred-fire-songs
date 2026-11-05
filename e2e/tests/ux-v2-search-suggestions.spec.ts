import { test, expect, type Page } from '@playwright/test';

/**
 * Story 6.1.29 / G7.1 (#413): recent searches and category chips when the search field is focused.
 * Gherkin: docs/testing/ux-v2-search-suggestions.feature (@e2e).
 */
test.use({ viewport: { width: 390, height: 844 }, storageState: { cookies: [], origins: [] } });

const LOCALE_KEY = 'sacred-fire-songs-locale';
const HISTORY_KEY = 'sacred-fire-songs-search-history';
const pinEnglish = (page: Page) => page.addInitScript(([k, v]) => localStorage.setItem(k, v), [LOCALE_KEY, 'en']);
const field = (page: Page) => page.getByPlaceholder(/Search \d+\+ songs/);
const panel = (page: Page) => page.getByTestId('search-suggestions');
const recent = (page: Page) => page.getByRole('region', { name: 'Recent searches' });
const stored = (page: Page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '[]'), HISTORY_KEY);

// Seed once per test (an init script would re-seed after every navigation and undo "clear").
async function seedHistory(page: Page, terms: string[]) {
  await page.goto('/songs');
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [HISTORY_KEY, JSON.stringify(terms)]);
  await page.reload();
}

test('a search made earlier is offered under "Recent searches"', async ({ page }) => {
  await pinEnglish(page);
  await page.goto('/songs');
  await field(page).fill('agua');
  await field(page).press('Enter');
  await expect(page).toHaveURL(/search=agua/);

  await page.goto('/songs');
  await field(page).click();
  await expect(recent(page).getByRole('button', { name: 'agua', exact: true })).toBeVisible();
});

test('tapping a recent search repeats it', async ({ page }) => {
  await pinEnglish(page);
  await seedHistory(page, ['agua']);
  await field(page).click();
  await recent(page).getByRole('button', { name: 'agua', exact: true }).click();
  await expect(page).toHaveURL(/search=agua/);
  await expect(panel(page)).toHaveCount(0);
});

test('lists at most 5, clears one at a time and all at once', async ({ page }) => {
  await pinEnglish(page);
  await seedHistory(page, ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8']);
  await field(page).click();
  const terms = recent(page).getByRole('listitem');
  await expect(terms).toHaveCount(5);

  await recent(page).getByRole('button', { name: 'Remove "t2"' }).click();
  await expect(terms).toHaveCount(4);
  expect(await stored(page)).toEqual(['t1', 't3', 't4', 't5']);

  await recent(page).getByRole('button', { name: 'Clear all' }).click();
  await expect(recent(page)).toHaveCount(0);
  expect(await stored(page)).toEqual([]);
  // The categories stay.
  await expect(panel(page).getByRole('region', { name: 'Categories' })).toBeVisible();
});

test('category chips narrow the song list and show the selected one', async ({ page }) => {
  await pinEnglish(page);
  await page.goto('/songs');
  await field(page).click();
  const chips = panel(page).getByRole('region', { name: 'Categories' }).getByRole('button');
  await expect(chips.first()).toBeVisible();

  for (const chip of await chips.all()) {
    const box = (await chip.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
    const size = await chip.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(size).toBeGreaterThanOrEqual(12);
  }

  const name = (await chips.first().textContent())!.trim();
  await chips.first().click();
  await expect(page).toHaveURL(/\/songs\?.*category=/);
  await expect(panel(page)).toHaveCount(0);

  await field(page).click();
  await expect(chips.filter({ hasText: name }).first()).toHaveAttribute('aria-pressed', 'true');
  // A second tap removes the filter again.
  await chips.filter({ hasText: name }).first().click();
  await expect(page).not.toHaveURL(/category=/);
});

test('Escape and an outside tap close the panel', async ({ page }) => {
  await pinEnglish(page);
  await seedHistory(page, ['agua']);
  await field(page).click();
  await expect(panel(page)).toBeVisible();
  await field(page).press('Escape');
  await expect(panel(page)).toHaveCount(0);

  await field(page).click();
  await expect(panel(page)).toBeVisible();
  // Top-left corner of the header bar: outside the search field, never a link.
  await page.locator('#app-navbar').click({ position: { x: 1, y: 1 } });
  await expect(panel(page)).toHaveCount(0);
});

test('the keyboard reaches the suggestions and Escape returns to the field', async ({ page }) => {
  await pinEnglish(page);
  await seedHistory(page, ['agua', 'fuego']);
  await field(page).click();
  await expect(field(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(field(page)).toHaveAttribute('aria-controls', 'search-suggestions');
  // ArrowDown skips "Clear all": ArrowDown + Enter must never wipe the history.
  await field(page).press('ArrowDown');
  await expect(recent(page).getByRole('button', { name: 'agua', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(panel(page)).toHaveCount(0);
  await expect(field(page)).toBeFocused();
});

test('the Search tab of the bottom bar opens the suggestions', async ({ page }) => {
  await pinEnglish(page);
  await page.goto('/');
  const bar = page.getByTestId('bottom-nav');
  await expect(bar).toHaveAttribute('data-hydrated', 'true');
  await bar.getByRole('link', { name: 'Search' }).click();
  await expect(page).toHaveURL(/\/songs$/);
  await expect(field(page)).toBeFocused();
  await expect(panel(page)).toBeVisible();
});
