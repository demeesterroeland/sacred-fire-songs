import { test, expect } from '@playwright/test';
import { ROLES } from '../fixtures/roles';

test.describe('Song Detail Timeout & Fallbacks', () => {
  let songUrl: string;

  test.beforeAll(async ({ playwright }) => {
    // Navigate to `/songs` to dynamically discover a valid song URL
    const browser = await playwright.chromium.launch({ channel: 'chrome' });
    const page = await browser.newPage();
    await page.goto('/songs');
    // Grab the href of the first song link
    const firstSongLink = page.locator('a[href^="/songs/"]:not([href="/songs/add"])').first();
    await expect(firstSongLink).toBeVisible();
    const href = await firstSongLink.getAttribute('href');
    if (!href) throw new Error('Could not find a valid song link on /songs');
    songUrl = href;
    await browser.close();
    console.log(`Discovered song URL for timeout tests: ${songUrl}`);
  });

  test.describe('With authenticated session', () => {
    test.use({ storageState: ROLES.member.storage });

    // useAuth reads the session locally (getSession) and races the profile
    // lookup against a 5s timeout. A hanging profile request must not keep
    // the song page on its skeleton.
    test('Slow profile lookup does not block the song page', async ({ page }) => {
      await page.route('**/rest/v1/profiles?*', async () => {
        await new Promise(() => {}); // never resolves
      });

      await page.goto(songUrl);

      await expect(page.getByTestId('song-skeleton')).toHaveCount(0, { timeout: 15000 });
      await expect(page.locator('h2', { hasText: 'Taking too long' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Account menu' })).toBeVisible();
    });
  });

  test.describe('Without session', () => {
    // The song query has its own timeout plus one retry, and the page has a 10s
    // skeleton timeout. Whichever fires first, a hanging song request must end
    // in a Retry screen instead of an endless skeleton.
    test('Hanging song request ends in a Retry screen, not an endless skeleton', async ({ page }) => {
      await page.route('**/rest/v1/compositions?*', async () => {
        await new Promise(() => {}); // never resolves
      });

      await page.goto(songUrl);

      const errorHeading = page.locator('h2', { hasText: /Taking too long|Couldn't load this song/ });
      await expect(errorHeading).toBeVisible({ timeout: 20000 });
      await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
      await expect(page.getByTestId('song-skeleton')).toHaveCount(0);
    });
  });
});
