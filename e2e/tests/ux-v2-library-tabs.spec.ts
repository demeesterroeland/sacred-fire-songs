import { test, expect } from '@playwright/test';
import { ROLES } from '../fixtures/roles';

/**
 * Story 6.1.23 / G5.2 (#407): the Library tab row fits a phone and has no dead tab.
 * Gherkin: docs/testing/ux-v2-library-tabs.feature (@e2e).
 */
test.use({ viewport: { width: 390, height: 844 }, storageState: ROLES.member.storage });

const LOCALE_KEY = 'sacred-fire-songs-locale';
const pinLocale = (page: import('@playwright/test').Page, locale: string) =>
  page.addInitScript(([k, v]) => localStorage.setItem(k, v), [LOCALE_KEY, locale]);
const tabRow = (page: import('@playwright/test').Page) =>
  page.locator('main nav').filter({ has: page.locator('a[href="/library/playlists"]') }).first().getByRole('link');

const TAB_HREFS = ['/library/playlists', '/library/smart', '/library/recently-viewed', '/library/new', '/library/artists'];

/** Validation 4: five tabs are wider than a phone, so the row scrolls. Every tab, once scrolled to, sits inside the screen whole. */
async function expectReachable(page: import('@playwright/test').Page) {
  const vw = page.viewportSize()!.width;
  for (const tab of await tabRow(page).all()) {
    await tab.scrollIntoViewIfNeeded();
    const box = (await tab.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(vw);
    expect(await tab.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  }
}

test('Library tabs on a phone: Playlists | Smart | History | New | Artists, every label reachable, no "Coming soon" tab', async ({ page }) => {
  await pinLocale(page, 'en');
  await page.goto('/library/playlists');
  const tabs = tabRow(page);
  await expect(tabs).toHaveCount(5);
  expect(await tabs.evaluateAll((els) => els.map((el) => el.getAttribute('href')))).toEqual(TAB_HREFS);
  await expect(tabs).toHaveText(['Playlists', 'Smart', 'History', 'New', 'Artists']);
  await expect(page.locator('a[href="/library/albums"]')).toHaveCount(0);

  await expectReachable(page);
  for (const tab of await tabs.all()) {
    const box = (await tab.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
  }

  for (const href of await tabs.evaluateAll((els) => els.map((el) => el.getAttribute('href')!))) {
    await page.goto(href);
    await expect(page.getByText(/coming soon/i)).toHaveCount(0);
    // The open tab is scrolled into view.
    const active = page.locator(`main nav a[aria-current="page"][href="${href}"]`);
    const box = (await active.boundingBox())!;
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
});

// The longest labels (ru, qu) are reachable and never cut off on 390 px.
for (const [locale, playlists] of [['ru', 'Плейлисты'], ['qu', 'Listakuna']] as const) {
  test(`Library tabs on 390 px in ${locale}`, async ({ page }) => {
    await pinLocale(page, locale);
    await page.goto('/library/playlists');
    const tabs = tabRow(page);
    await expect(tabs).toHaveCount(5);
    await expect(tabs.first()).toHaveText(playlists);
    await expectReachable(page);
  });
}

test('the hidden Albums route renders the not-found page', async ({ page }) => {
  // The route streams (app/loading.tsx), so Next keeps HTTP 200 but renders the
  // not-found UI with a noindex robots tag (node_modules/next/dist/docs, not-found.md).
  await pinLocale(page, 'en');
  await page.goto('/library/albums');
  await expect(page.getByRole('heading', { level: 1 }).filter({ hasText: /not found/i })).toBeVisible();
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
  await expect(page.getByText(/liked albums|coming soon/i)).toHaveCount(0);
});
