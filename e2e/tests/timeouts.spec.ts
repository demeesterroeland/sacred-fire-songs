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
    // Inject authenticated member storage state to trigger real getUser and profile calls
    test.use({ storageState: ROLES.member.storage });

    test('Auth getUser timeout falls back to guest mode', async ({ page }) => {
      const warnings: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'warning') {
          warnings.push(msg.text());
        }
      });

      // Intercept auth user call and delay by 20s (longer than the 15s AUTH_TIMEOUT_MS in useAuth)
      await page.route('**/supabase-api/auth/v1/user', async (route) => {
        console.log('[Playwright Router] Intercepted user verify call, delaying by 20s...');
        await new Promise((resolve) => setTimeout(resolve, 20000));
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'timeout simulated' }),
        });
      });

      // Provide mock response for composition data to prevent hanging
      await page.route('**/supabase-api/rest/v1/compositions?*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{
            title: "Mock Song with Media",
            original_author: "Mock Artist",
            owner_id: "some-owner-id",
            is_public: true,
            has_chords: true,
            has_melody: false,
            song_versions: [
              {
                id: "mock-version-id",
                version_name: "Standard Version",
                content_chordpro: "{title: Mock Song with Media}\n[G]Hello [C]World",
                key: "G",
                capo: 0,
                tuning: "Standard",
                youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                spotify_url: "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC",
                soundcloud_url: null,
                melody_notation: null
              }
            ],
            song_category_map: []
          }])
        });
      });

      await page.goto(songUrl);

      // Wait for the auth timeout to trigger (15s) plus buffer for Next.js render
      await page.waitForTimeout(22000);

      // Verify auth timeout warning is in console logs
      const hasAuthTimeoutLog = warnings.some(txt => txt.includes('Auth resolution failed'));
      expect(hasAuthTimeoutLog).toBe(true);

      // Verify skeleton resolved/unblocked and song detail content is visible (wait dynamically up to 15s)
      const skeleton = page.locator('.animate-pulse');
      await expect(skeleton).toHaveCount(0, { timeout: 15000 });
    });
  });

  test.describe('Without session', () => {
    test('Skeleton loading timeout displays "Taking too long..." Retry UI', async ({ page }) => {
      const warnings: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'warning') {
          warnings.push(msg.text());
        }
      });

      // Delay auth and compositions queries indefinitely
      await page.route('**/supabase-api/auth/v1/user', async () => {
        await new Promise(() => {}); // never resolves
      });
      await page.route('**/supabase-api/rest/v1/compositions?*', async () => {
        await new Promise(() => {}); // never resolves
      });

      await page.goto(songUrl);

      // Wait for the 10s skeleton timeout to trigger
      await page.waitForTimeout(12000);

      // Verify warning is logged in console
      const hasSkeletonTimeoutLog = warnings.some(txt => txt.includes('Skeleton timed out after 10s'));
      expect(hasSkeletonTimeoutLog).toBe(true);

      // Verify "Taking too long..." error UI is visible
      const errorHeading = page.locator('h2', { hasText: 'Taking too long' });
      await expect(errorHeading).toBeVisible();

      const retryButton = page.locator('button', { hasText: 'Retry' });
      await expect(retryButton).toBeVisible();
    });
  });
});
