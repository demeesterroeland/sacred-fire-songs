import { test, expect, type Browser, type Page } from '@playwright/test';
import { ROLES } from '../fixtures/roles';

/**
 * UX v2 validation round 1, review round: findings B1 and H1 (search suggestions panel).
 * Gherkin: docs/testing/ux-v2-validation-1.feature (@e2e). Read-only on seeded data.
 *
 *  B1  A press on a song while the suggestions panel is open opens THAT song: the panel closes, but the page
 *      must not move between press and release (it did: the list jumped up and the click landed elsewhere).
 *  H1  Opening and closing the panel keeps the scroll position of the main column (desktop).
 */
test.use({ viewport: { width: 390, height: 844 } });

const searchField = (page: Page) => page.getByPlaceholder(/Search \d+\+ songs/);
const pinEnglish = (page: Page) => page.addInitScript(() => localStorage.setItem('sacred-fire-songs-locale', 'en'));

async function context(browser: Browser, kind: 'phone' | 'desktop', storageState?: string) {
  return browser.newContext(
    kind === 'phone'
      ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, storageState }
      : { viewport: { width: 1280, height: 800 }, hasTouch: false, isMobile: false, storageState },
  );
}

/** The first song row that lies fully below the open panel and inside the window, with its link target. */
async function rowBelowPanel(page: Page) {
  const panel = (await page.getByTestId('search-suggestions').boundingBox())!;
  const viewport = page.viewportSize()!;
  const rows = page.getByTestId('song-row');
  const n = await rows.count();
  for (let i = 0; i < n; i++) {
    const box = await rows.nth(i).boundingBox();
    if (box && box.y >= panel.y + panel.height && box.y + box.height <= viewport.height - 60) {
      const href = await rows.nth(i).locator('a[href^="/songs/"]').first().getAttribute('href');
      return { x: box.x + 60, y: box.y + box.height / 2, href: href! };
    }
  }
  throw new Error('no song row below the panel inside the window');
}

/** A press that lasts a moment, like a finger or a mouse button: the page may react in between. */
async function press(page: Page, kind: 'phone' | 'desktop', at: { x: number; y: number }) {
  if (kind === 'desktop') {
    await page.mouse.move(at.x, at.y);
    await page.mouse.down();
    await page.waitForTimeout(150);
    await page.mouse.up();
    return;
  }
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: at.x, y: at.y }] });
  await page.waitForTimeout(150);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

// ── B1 ─────────────────────────────────────────────────────────────────────────────────────────────────────
for (const kind of ['phone', 'desktop'] as const) {
  test(`B1 ${kind}: a press on a song below the open suggestions opens that song and closes the panel`, async ({ browser }) => {
    const ctx = await context(browser, kind);
    const page = await ctx.newPage();
    await pinEnglish(page);
    await page.goto('/songs');
    await expect(page.getByTestId('song-row').first()).toBeVisible();
    await searchField(page).click();
    await expect(page.getByTestId('search-suggestions')).toBeVisible();

    const target = await rowBelowPanel(page);
    await press(page, kind, target);

    await expect(page).toHaveURL(new RegExp(`${target.href}$`));
    await expect(page.getByTestId('search-suggestions')).toHaveCount(0);
    await ctx.close();
  });
}

test('B1 phone: a press on a song below the open panel on guest Home opens that song', async ({ browser }) => {
  const ctx = await context(browser, 'phone');
  const page = await ctx.newPage();
  await pinEnglish(page);
  await page.goto('/');
  const field = page.getByRole('searchbox');
  await expect(field).toBeVisible();
  await expect(page.getByTestId('song-row').first()).toBeVisible();
  await field.click();
  await expect(page.getByTestId('search-suggestions')).toBeVisible();

  const target = await rowBelowPanel(page);
  await press(page, 'phone', target);

  await expect(page).toHaveURL(new RegExp(`${target.href}$`));
  await ctx.close();
});

test('B1 desktop: a tap on empty page space still closes the panel', async ({ browser }) => {
  const ctx = await context(browser, 'desktop');
  const page = await ctx.newPage();
  await pinEnglish(page);
  await page.goto('/songs');
  await searchField(page).click();
  await expect(page.getByTestId('search-suggestions')).toBeVisible();
  await page.locator('#app-navbar').click({ position: { x: 1, y: 1 } });
  await expect(page.getByTestId('search-suggestions')).toHaveCount(0);
  await ctx.close();
});

// ── H1 ─────────────────────────────────────────────────────────────────────────────────────────────────────
const scrollTopOfMain = (page: Page) => page.locator('main').first().evaluate((el) => Math.round(el.scrollTop));

for (const [label, path, role] of [
  ['song list', '/songs', undefined],
  ['Home (member)', '/', 'member'],
  ['Playlists (member)', '/library/playlists', 'member'],
] as const) {
  test(`H1 desktop: opening and closing the suggestions keeps the scroll position (${label})`, async ({ browser }) => {
    const ctx = await context(browser, 'desktop', role ? ROLES[role].storage : undefined);
    const page = await ctx.newPage();
    await pinEnglish(page);
    await page.goto(path);
    await expect(searchField(page)).toBeVisible();
    // Make sure there is something to scroll on every page, and let the page settle where it was scrolled to.
    await page.waitForLoadState('networkidle');
    await page.locator('main').first().evaluate((el) => {
      el.style.paddingBottom = '4000px';
      el.scrollTop = 1395;
    });
    await page.waitForTimeout(500);
    const before = await scrollTopOfMain(page);
    expect(before).toBeGreaterThan(300);

    await searchField(page).click();
    const panel = page.getByTestId('search-suggestions');
    await expect(panel).toBeVisible();
    expect(await scrollTopOfMain(page)).toBe(before);
    // Visible: inside the scrolling area, not hidden behind the header.
    const main = (await page.locator('main').first().boundingBox())!;
    const p = (await panel.boundingBox())!;
    expect(p.y).toBeGreaterThanOrEqual(main.y - 1);
    expect(p.y + p.height).toBeLessThanOrEqual(main.y + main.height + 1);

    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
    expect(await scrollTopOfMain(page)).toBe(before);
    await ctx.close();
  });
}
