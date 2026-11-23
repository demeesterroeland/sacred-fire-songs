import { test, expect } from '@playwright/test';
import { clickPractice } from '../fixtures/songActions';

test.describe('Practice Media Player E2E Tests', () => {
  let songUrl = '';

  test.beforeAll(async ({ playwright }) => {
    // Discover a valid song link dynamically
    const browser = await playwright.chromium.launch({ channel: 'chrome' });
    const page = await browser.newPage();
    await page.goto('/songs');
    const firstSongLink = page.locator('a[href^="/songs/"]:not([href="/songs/add"])').first();
    await expect(firstSongLink).toBeVisible();
    const href = await firstSongLink.getAttribute('href');
    if (!href) throw new Error('No song link found');
    songUrl = href;
    await browser.close();
  });

  test.beforeEach(async ({ page }) => {
    // Inject __E2E__ flag before scripts execute
    await page.addInitScript(() => {
      (window as any).__E2E__ = true;
    });

    // Intercept database fetch to return a mock song of Danza del Cielo Curandero
    await page.route('**/rest/v1/compositions?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: "Danza del Cielo Curandero",
          original_author: "Herbert Quinteros",
          owner_id: "some-owner-id",
          is_public: true,
          has_chords: true,
          has_melody: false,
          song_versions: [
            {
              id: "mock-version-id",
              version_name: "Standard Version",
              content_chordpro: "{title: Danza del Cielo Curandero}\n[G]Hello [C]World",
              key: "G",
              capo: 0,
              tuning: "Standard",
              youtube_url: "https://www.youtube.com/watch?v=dbbZGLR_e20",
              spotify_url: "https://open.spotify.com/track/2HZQQ8PriDD1z7tcvAU9KH",
              soundcloud_url: "https://soundcloud.com/user-778401370/la-curandera",
              melody_notation: null
            }
          ],
          song_category_map: []
        })
      });
    });

    await page.goto(songUrl);

    // Open Rehearsal Drawer Space (responsive: desktop header button or the phone action bar)
    await clickPractice(page);

    // Select Listen tab
    const referenceTracksTab = page.locator('[data-testid="practice-tab-listen"]');
    await expect(referenceTracksTab).toBeVisible();
    await referenceTracksTab.click();

    // Wait for YouTube player iframe to render
    const ytPlayer = page.locator('iframe[title="YouTube video player"]').first();
    await expect(ytPlayer).toBeVisible();
    await page.waitForTimeout(1000); // 1s buffer for hydration

    // Initialize E2E logs
    await page.evaluate(() => {
      (window as any).lastYtMessage = null;
      (window as any).lastScMessage = null;
    });
  });

  // =========================================================================
  // CATEGORY 1: TAB SWITCHING PERSISTENCE (6 Permutations)
  // =========================================================================

  test('Permutation 1: Play YT -> Switch to SC (audio persists, no pause sent)', async ({ page }) => {
    await page.evaluate(() => window.postMessage('{"event":"onStateChange","info":1}', '*'));
    await page.waitForTimeout(500);

    const scBtn = page.locator('button:has-text("SoundCloud")');
    await scBtn.click();
    await expect(scBtn).toHaveAttribute("aria-pressed", "true");

    const lastYtMessage = await page.evaluate(() => (window as any).lastYtMessage);
    expect(lastYtMessage).toBeNull(); // Did not receive pause command
  });

  test('Permutation 2: Play YT -> Switch to SP (audio persists, no pause sent)', async ({ page }) => {
    await page.evaluate(() => window.postMessage('{"event":"onStateChange","info":1}', '*'));
    await page.waitForTimeout(500);

    const spotifyBtn = page.locator('button:has-text("Spotify")');
    await spotifyBtn.click();
    await expect(spotifyBtn).toHaveAttribute("aria-pressed", "true");

    const lastYtMessage = await page.evaluate(() => (window as any).lastYtMessage);
    expect(lastYtMessage).toBeNull(); // Did not receive pause command
  });

  test('Permutation 3: Play SC -> Switch to YT (audio persists, no pause sent)', async ({ page }) => {
    const scBtn = page.locator('button:has-text("SoundCloud")');
    await scBtn.click();
    await expect(scBtn).toHaveAttribute("aria-pressed", "true");
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.postMessage('{"event":"play"}', '*'));
    await page.waitForTimeout(500);

    const ytBtn = page.locator('button:has-text("YouTube")');
    await ytBtn.click();
    await expect(ytBtn).toHaveAttribute("aria-pressed", "true");

    const lastScMessage = await page.evaluate(() => (window as any).lastScMessage);
    expect(lastScMessage).toBeNull(); // Did not receive pause command
  });

  test('Permutation 4: Play SC -> Switch to SP (audio persists, no pause sent)', async ({ page }) => {
    const scBtn = page.locator('button:has-text("SoundCloud")');
    await scBtn.click();
    await expect(scBtn).toHaveAttribute("aria-pressed", "true");
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.postMessage('{"event":"play"}', '*'));
    await page.waitForTimeout(500);

    const spotifyBtn = page.locator('button:has-text("Spotify")');
    await spotifyBtn.click();
    await expect(spotifyBtn).toHaveAttribute("aria-pressed", "true");

    const lastScMessage = await page.evaluate(() => (window as any).lastScMessage);
    expect(lastScMessage).toBeNull(); // Did not receive pause command
  });

  test('Permutation 5: Play SP -> Switch to YT (audio persists, no tab change override)', async ({ page }) => {
    const spotifyBtn = page.locator('button:has-text("Spotify")');
    await spotifyBtn.click();
    await expect(spotifyBtn).toHaveAttribute("aria-pressed", "true");
    await page.waitForTimeout(1000);

    // Focus Spotify iframe (this calls pauseYouTube + pauseSoundCloud internally)
    await page.evaluate(() => {
      const iframes = document.querySelectorAll('iframe');
      Object.defineProperty(Document.prototype, 'activeElement', { get: () => iframes[2], configurable: true });
      window.dispatchEvent(new Event('blur'));
    });
    await page.waitForTimeout(500);

    // Reset spies — we only care if SWITCHING TABS triggers an additional pause
    await page.evaluate(() => {
      (window as any).lastYtMessage = null;
      (window as any).lastScMessage = null;
    });

    const ytBtn = page.locator('button:has-text("YouTube")');
    await ytBtn.click();
    await expect(ytBtn).toHaveAttribute("aria-pressed", "true");

    const source = await page.evaluate(() => (window as any).lastYtMessage);
    expect(source).toBeNull(); // Tab switch alone should NOT send a pause to YouTube
  });

  test('Permutation 6: Play SP -> Switch to SC (audio persists, no tab change override)', async ({ page }) => {
    const spotifyBtn = page.locator('button:has-text("Spotify")');
    await spotifyBtn.click();
    await expect(spotifyBtn).toHaveAttribute("aria-pressed", "true");
    await page.waitForTimeout(1000);

    // Focus Spotify iframe (this calls pauseYouTube + pauseSoundCloud internally)
    await page.evaluate(() => {
      const iframes = document.querySelectorAll('iframe');
      Object.defineProperty(Document.prototype, 'activeElement', { get: () => iframes[2], configurable: true });
      window.dispatchEvent(new Event('blur'));
    });
    await page.waitForTimeout(500);

    // Reset spies — we only care if SWITCHING TABS triggers an additional pause
    await page.evaluate(() => {
      (window as any).lastYtMessage = null;
      (window as any).lastScMessage = null;
    });

    const scBtn = page.locator('button:has-text("SoundCloud")');
    await scBtn.click();
    await expect(scBtn).toHaveAttribute("aria-pressed", "true");

    const source = await page.evaluate(() => (window as any).lastScMessage);
    expect(source).toBeNull(); // Tab switch alone should NOT send a pause to SoundCloud
  });

  // =========================================================================
  // CATEGORY 2: AUTO-PAUSING & CROSS-FADE ON PLAY (6 Permutations)
  // =========================================================================

  test('Permutation 7: Play YT -> Start playing SC (YT pauses)', async ({ page }) => {
    await page.evaluate(() => window.postMessage('{"event":"onStateChange","info":1}', '*'));
    await page.waitForTimeout(500);

    const scBtn = page.locator('button:has-text("SoundCloud")');
    await scBtn.click();
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.postMessage('{"event":"play"}', '*'));
    await page.waitForTimeout(500);

    const lastYtMessage = await page.evaluate(() => (window as any).lastYtMessage);
    expect(lastYtMessage).toContain('pauseVideo');
  });

  test('Permutation 8: Play YT -> Focus SP (YT pauses)', async ({ page }) => {
    await page.evaluate(() => window.postMessage('{"event":"onStateChange","info":1}', '*'));
    await page.waitForTimeout(500);

    const spotifyBtn = page.locator('button:has-text("Spotify")');
    await spotifyBtn.click();
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      const iframes = document.querySelectorAll('iframe');
      Object.defineProperty(Document.prototype, 'activeElement', { get: () => iframes[2], configurable: true });
      window.dispatchEvent(new Event('blur'));
    });
    await page.waitForTimeout(500);

    const lastYtMessage = await page.evaluate(() => (window as any).lastYtMessage);
    expect(lastYtMessage).toContain('pauseVideo');
  });

  test('Permutation 9: Play SC -> Start playing YT (SC pauses)', async ({ page }) => {
    const scBtn = page.locator('button:has-text("SoundCloud")');
    await scBtn.click();
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.postMessage('{"event":"play"}', '*'));
    await page.waitForTimeout(500);

    const ytBtn = page.locator('button:has-text("YouTube")');
    await ytBtn.click();
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.postMessage('{"event":"onStateChange","info":1}', '*'));
    await page.waitForTimeout(500);

    const lastScMessage = await page.evaluate(() => (window as any).lastScMessage);
    expect(lastScMessage).toContain('pause');
  });

  test('Permutation 10: Play SC -> Focus SP (SC pauses)', async ({ page }) => {
    const scBtn = page.locator('button:has-text("SoundCloud")');
    await scBtn.click();
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.postMessage('{"event":"play"}', '*'));
    await page.waitForTimeout(500);

    const spotifyBtn = page.locator('button:has-text("Spotify")');
    await spotifyBtn.click();
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      const iframes = document.querySelectorAll('iframe');
      Object.defineProperty(Document.prototype, 'activeElement', { get: () => iframes[2], configurable: true });
      window.dispatchEvent(new Event('blur'));
    });
    await page.waitForTimeout(500);

    const lastScMessage = await page.evaluate(() => (window as any).lastScMessage);
    expect(lastScMessage).toContain('pause');
  });

  test('Permutation 11: Play SP -> Start playing YT (SP source gets deselected)', async ({ page }) => {
    const spotifyBtn = page.locator('button:has-text("Spotify")');
    await spotifyBtn.click();
    await page.waitForTimeout(1000);

    // Activate Spotify (pauses YT + SC internally)
    await page.evaluate(() => {
      const iframes = document.querySelectorAll('iframe');
      Object.defineProperty(Document.prototype, 'activeElement', { get: () => iframes[2], configurable: true });
      window.dispatchEvent(new Event('blur'));
    });
    await page.waitForTimeout(500);

    // Reset spies before switching to test that YT play (not Spotify setup) drives the outcome
    await page.evaluate(() => {
      (window as any).lastYtMessage = null;
      (window as any).lastScMessage = null;
    });

    const ytBtn = page.locator('button:has-text("YouTube")');
    await ytBtn.click();
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.postMessage('{"event":"onStateChange","info":1}', '*'));
    await page.waitForTimeout(500);

    // YT play sends pauseSoundCloud but NOT pauseVideo to itself
    const lastYtMessage = await page.evaluate(() => (window as any).lastYtMessage);
    expect(lastYtMessage).toBeNull(); // No pauseVideo — YouTube is the player starting, not being paused
    const lastScMessage = await page.evaluate(() => (window as any).lastScMessage);
    expect(lastScMessage).toContain('pause'); // YT starting pauses SoundCloud
  });

  test('Permutation 12: Play SP -> Start playing SC (SP source gets deselected)', async ({ page }) => {
    const spotifyBtn = page.locator('button:has-text("Spotify")');
    await spotifyBtn.click();
    await page.waitForTimeout(1000);

    // Activate Spotify (pauses YT + SC internally)
    await page.evaluate(() => {
      const iframes = document.querySelectorAll('iframe');
      Object.defineProperty(Document.prototype, 'activeElement', { get: () => iframes[2], configurable: true });
      window.dispatchEvent(new Event('blur'));
    });
    await page.waitForTimeout(500);

    // Reset spies before switching to test that SC play (not Spotify setup) drives the outcome
    await page.evaluate(() => {
      (window as any).lastYtMessage = null;
      (window as any).lastScMessage = null;
    });

    const scBtn = page.locator('button:has-text("SoundCloud")');
    await scBtn.click();
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.postMessage('{"event":"play"}', '*'));
    await page.waitForTimeout(500);

    // SC play sends pauseYouTube but NOT a pause to itself
    const lastScMessage = await page.evaluate(() => (window as any).lastScMessage);
    expect(lastScMessage).toBeNull(); // No SoundCloud pause — SoundCloud is starting, not being paused
    const lastYtMessage = await page.evaluate(() => (window as any).lastYtMessage);
    expect(lastYtMessage).toContain('pauseVideo'); // SC starting pauses YouTube
  });

  // =========================================================================
  // CATEGORY 3: BOTTOM MINI-PLAYER DISPLAY & SYNC (3 Permutations)
  // =========================================================================

  // Story 6.1.12 / G3.1 (#396), UXD-5: the mini player appears only after play.
  test('Mini-player is not rendered on load, appears after play, hides after stop', async ({ page }) => {
    const miniPlayer = page.locator('[data-testid="bottom-mini-player"]');
    const reserved = () => page.evaluate(() => document.documentElement.style.getPropertyValue('--mini-player-h'));

    // Fresh song page with the drawer open and a reference track preselected: no bar, nothing reserved
    await expect(miniPlayer).toHaveCount(0);
    expect(await reserved()).toBe('');

    // Press play: bar appears, and the drawer body reserves room so the last row is never covered
    await page.evaluate(() => window.postMessage('{"event":"onStateChange","info":1}', '*'));
    await expect(miniPlayer).toBeVisible();
    await expect.poll(reserved).toContain('3.5rem');
    const barHeight = (await miniPlayer.boundingBox())!.height;
    const bodyPad = await page.locator('[data-testid="rehearsal-drawer-body"]').evaluate(
      (el) => parseFloat(getComputedStyle(el).paddingBottom),
    );
    expect(bodyPad).toBeGreaterThanOrEqual(barHeight);

    // Scrolled to the end, the last visible block of the drawer ends above the bar
    // (reference-track bar: no seeded take with audio in this mocked song; the take case is in ux-v2-mini-player.spec.ts).
    const body = page.locator('[data-testid="rehearsal-drawer-body"]');
    await body.evaluate((el) => { el.scrollTop = el.scrollHeight; });
    await expect
      .poll(async () => {
        const barTop = (await miniPlayer.boundingBox())!.y;
        const lastBottom = await body.evaluate((el) => {
          const shown = [...el.children].filter((c) => (c as HTMLElement).offsetHeight > 0);
          return shown[shown.length - 1].getBoundingClientRect().bottom;
        });
        return barTop - lastBottom;
      })
      .toBeGreaterThanOrEqual(0);

    // Pause keeps the bar; closing the drawer keeps it too
    await page.evaluate(() => window.postMessage('{"event":"onStateChange","info":2}', '*'));
    await expect(miniPlayer).toBeVisible();
    await page.locator('button[aria-label="Close"]').first().click();
    await expect(miniPlayer).toBeVisible();

    // Stop removes the bar and the reserved space
    await miniPlayer.locator('[data-testid="mini-close-btn"]').click();
    await expect(miniPlayer).toHaveCount(0);
    await expect.poll(reserved).toBe('');
  });

  test('Permutation 13: YouTube Mini-Player display on drawer fold', async ({ page }) => {
    await page.evaluate(() => window.postMessage('{"event":"onStateChange","info":1}', '*'));
    await page.waitForTimeout(500);

    const closeBtn = page.locator('button[aria-label="Close"]').first();
    await closeBtn.click();

    const miniPlayer = page.locator('[data-testid="bottom-mini-player"]');
    await expect(miniPlayer).toBeVisible();
    await expect(miniPlayer.locator('text=Danza del Cielo Curandero').first()).toBeVisible();
    await expect(miniPlayer.getByTestId('mini-now-playing')).toContainText('YouTube');
  });

  test('Permutation 14: SoundCloud Mini-Player display on drawer fold', async ({ page }) => {
    const scBtn = page.locator('button:has-text("SoundCloud")');
    await scBtn.click();
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.postMessage('{"event":"play"}', '*'));
    await page.waitForTimeout(500);

    const closeBtn = page.locator('button[aria-label="Close"]').first();
    await closeBtn.click();

    const miniPlayer = page.locator('[data-testid="bottom-mini-player"]');
    await expect(miniPlayer).toBeVisible();
    await expect(miniPlayer.locator('text=Danza del Cielo Curandero').first()).toBeVisible();
    await expect(miniPlayer.getByTestId('mini-now-playing')).toContainText('SoundCloud');
  });

  // Owner decision (#342): the mini-player stays visible for every source, Spotify included.
  test('Permutation 15: Spotify active state keeps mini-player on fold @headed', async ({ page }) => {
    const spotifyBtn = page.locator('button:has-text("Spotify")');
    await expect(spotifyBtn).toBeVisible({ timeout: 10000 });
    await spotifyBtn.click();
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      const spotifyIframe = Array.from(document.querySelectorAll('iframe')).find(i => i.src.includes('spotify.com')) || document.querySelectorAll('iframe')[2];
      if (spotifyIframe) {
        Object.defineProperty(Document.prototype, 'activeElement', { get: () => spotifyIframe, configurable: true });
        window.dispatchEvent(new Event('blur'));
      }
    });
    await page.waitForTimeout(500);

    const closeBtn = page.locator('button[aria-label="Close"]').first();
    await closeBtn.click({ force: true });

    const miniPlayer = page.locator('[data-testid="bottom-mini-player"]');
    await expect(miniPlayer).toBeVisible();
    await expect(miniPlayer.getByTestId('mini-now-playing')).toContainText('Spotify');
  });


  test('Permutation 15a: Source Switcher dropdown interacts and switches tracks', async ({ page }) => {
    // The Practice drawer is open (beforeEach); the mini-player only appears after play (#396)
    await page.evaluate(() => window.postMessage('{"event":"onStateChange","info":1}', '*'));
    const closeBtn = page.locator('button[aria-label="Close"]').first();
    await closeBtn.click();
    
    const miniPlayer = page.locator('[data-testid="bottom-mini-player"]');
    await expect(miniPlayer).toBeVisible();

    // Open Dropdown
    const switcher = miniPlayer.locator('[data-testid="mini-source-switcher"]');
    await switcher.click();
    
    const dropdown = page.locator('[data-testid="mini-source-dropdown"]');
    await expect(dropdown).toBeVisible();
    await expect(dropdown.locator('text=YouTube')).toBeVisible();
    await expect(dropdown.locator('text=SoundCloud')).toBeVisible();

    // Switch to SoundCloud
    await dropdown.locator('text=SoundCloud').click();
    await expect(dropdown).toBeHidden();
    
    // Verify track switched
    await expect(miniPlayer.getByTestId('mini-now-playing')).toContainText('SoundCloud');
  });

  // =========================================================================
  // CATEGORY 4: PROGRESS BAR CLICK-TO-SEEK (3 Permutations)
  // =========================================================================

  test('Permutation 16: Click progress bar seeks YouTube player', async ({ page }) => {
    await page.evaluate(() => {
      window.postMessage('{"event":"onStateChange","info":1}', '*');
      window.postMessage('{"event":"infoDelivery","info":{"currentTime":50,"duration":100}}', '*');
    });
    await page.waitForTimeout(1000);

    const closeBtn = page.locator('button[aria-label="Close"]').first();
    await closeBtn.click({ force: true });

    const miniPlayer = page.locator('[data-testid="bottom-mini-player"]');
    await expect(miniPlayer).toBeVisible();

    const progressLine = miniPlayer.locator('[data-testid="mini-progress-bar"]');
    await expect(progressLine).toBeVisible();

    const box = await progressLine.boundingBox();
    const clickX = box ? box.width * 0.75 : 300;
    await progressLine.click({ position: { x: clickX, y: 4 } });
    await page.waitForTimeout(1000);

    const lastYtMessage = await page.evaluate(() => (window as any).lastYtMessage);
    expect(lastYtMessage).toContain('seekTo');
    const parsed = JSON.parse(lastYtMessage);
    expect(parsed.args[0]).toBeGreaterThan(70);
    expect(parsed.args[0]).toBeLessThan(80);
  });

  test('Permutation 17: Click progress bar seeks SoundCloud player', async ({ page }) => {
    const scBtn = page.locator('button:has-text("SoundCloud")');
    await scBtn.click();
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      window.postMessage('{"event":"play"}', '*');
      window.postMessage('{"event":"playProgress","value":{"currentPosition":50000,"duration":100000}}', '*');
    });
    await page.waitForTimeout(1000);

    const closeBtn = page.locator('button[aria-label="Close"]').first();
    await closeBtn.click({ force: true });

    const miniPlayer = page.locator('[data-testid="bottom-mini-player"]');
    await expect(miniPlayer).toBeVisible();

    const progressLine = miniPlayer.locator('[data-testid="mini-progress-bar"]');
    await expect(progressLine).toBeVisible();

    const box = await progressLine.boundingBox();
    const clickX = box ? box.width * 0.75 : 300;
    await progressLine.click({ position: { x: clickX, y: 4 } });
    await page.waitForTimeout(1000);

    const lastScMessage = await page.evaluate(() => (window as any).lastScMessage);
    expect(lastScMessage).toContain('seekTo');
    const parsed = JSON.parse(lastScMessage);
    expect(parsed.value).toBeGreaterThan(70000);
    expect(parsed.value).toBeLessThan(80000);
  });

  test('Permutation 18: Spotify player fold sends no seek command from the progress bar @headed', async ({ page }) => {
    const spotifyBtn = page.locator('button:has-text("Spotify")');
    await expect(spotifyBtn).toBeVisible({ timeout: 10000 });
    await spotifyBtn.click();
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      const spotifyIframe = Array.from(document.querySelectorAll('iframe')).find(i => i.src.includes('spotify.com')) || document.querySelectorAll('iframe')[2];
      if (spotifyIframe) {
        Object.defineProperty(Document.prototype, 'activeElement', { get: () => spotifyIframe, configurable: true });
        window.dispatchEvent(new Event('blur'));
      }
    });
    await page.waitForTimeout(500);

    const closeBtn = page.locator('button[aria-label="Close"]').first();
    await closeBtn.click({ force: true });

    const miniPlayer = page.locator('[data-testid="bottom-mini-player"]');
    await expect(miniPlayer).toBeVisible();

    // Spotify's embed has no seek API: clicking the bar must not seek YouTube or SoundCloud
    await miniPlayer.locator('[data-testid="mini-progress-bar"]').click({ position: { x: 50, y: 4 } });
    await page.waitForTimeout(500);
    const messages = await page.evaluate(() => [(window as any).lastYtMessage, (window as any).lastScMessage]);
    expect(messages.join(' ')).not.toContain('seekTo');
  });
});
