import { test, expect, type Page } from '@playwright/test';
import { clickPractice } from '../fixtures/songActions';
import { ROLES } from '../fixtures/roles';

/**
 * Story 6.1.13 / G3.2 (#397): the player and the reference tab are calm and exact.
 * Gherkin: docs/testing/ux-v2-calm-player.feature (@e2e).
 * Mocks the song (like media-player.spec.ts) so the links are known; guests may listen.
 */
test.use({ viewport: { width: 390, height: 844 } });

const LINKS = {
  youtube_url: 'https://www.youtube.com/watch?v=dbbZGLR_e20',
  spotify_url: 'https://open.spotify.com/track/2HZQQ8PriDD1z7tcvAU9KH',
  soundcloud_url: 'https://soundcloud.com/user-778401370/la-curandera',
};

async function openSong(page: Page, links: Partial<typeof LINKS>) {
  await page.goto('/songs');
  const first = page.locator('a[href^="/songs/"]:not([href="/songs/add"])').first();
  await expect(first).toBeVisible();
  const href = (await first.getAttribute('href'))!;

  await page.addInitScript(() => {
    (window as unknown as { __E2E__: boolean }).__E2E__ = true;
  });
  await page.route('**/rest/v1/compositions?*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        title: 'Danza del Cielo Curandero',
        original_author: 'Herbert Quinteros',
        owner_id: 'some-owner-id',
        is_public: true,
        has_chords: true,
        has_melody: false,
        song_versions: [
          {
            id: 'mock-version-id',
            version_name: 'Standard Version',
            content_chordpro: '{title: Danza del Cielo Curandero}\n[G]Hello [C]World',
            key: 'G',
            capo: 0,
            tuning: 'Standard',
            youtube_url: null,
            spotify_url: null,
            soundcloud_url: null,
            melody_notation: null,
            ...links,
          },
        ],
        song_category_map: [],
      }),
    });
  });
  await page.goto(href);
  await clickPractice(page);
  await page.getByTestId('practice-tab-listen').click();
}

test('only providers with a link are offered', async ({ page }) => {
  await openSong(page, { youtube_url: LINKS.youtube_url });
  const providers = page.getByTestId('reference-providers');
  await expect(providers.getByRole('button', { name: 'YouTube' })).toHaveAttribute('aria-pressed', 'true');
  await expect(providers.getByRole('button', { name: 'Spotify' })).toHaveCount(0);
  await expect(providers.getByRole('button', { name: 'SoundCloud' })).toHaveCount(0);
});

test('providers keep a fixed order and the chosen one is checked, not only coloured', async ({ page }) => {
  await openSong(page, LINKS);
  const buttons = page.getByTestId('reference-providers').getByRole('button');
  await expect(buttons).toHaveText(['YouTube', 'SoundCloud', 'Spotify']);
  await buttons.nth(2).click();
  await expect(buttons.nth(2)).toHaveAttribute('aria-pressed', 'true');
  await expect(buttons.nth(2).locator('svg')).toHaveCount(1);
  await expect(buttons.nth(0)).toHaveAttribute('aria-pressed', 'false');
  // Every provider button is a full touch target.
  for (let i = 0; i < 3; i++) expect((await buttons.nth(i).boundingBox())!.height).toBeGreaterThanOrEqual(44);
});

test('the mini player is a plain surface, accent only on play, and names its state in words', async ({ page }) => {
  await openSong(page, LINKS);
  await page.evaluate(() => window.postMessage('{"event":"onStateChange","info":1}', '*'));
  const bar = page.getByTestId('bottom-mini-player');
  await expect(bar).toBeVisible();

  const colours = await page.evaluate(() => {
    const css = (el: Element | null) => (el ? getComputedStyle(el).backgroundColor : '');
    const bar = document.querySelector('[data-testid="bottom-mini-player"]')!;
    const probe = document.createElement('div');
    probe.className = 'bg-accent';
    document.body.appendChild(probe);
    const accent = css(probe);
    const surface = (() => { probe.className = 'bg-surface'; return css(probe); })();
    probe.remove();
    return {
      bar: css(bar),
      play: css(bar.querySelector('[data-testid="mini-play-pause-btn"]')),
      expand: css(bar.querySelector('[data-testid="mini-expand-btn"]')),
      accent,
      surface,
    };
  });
  expect(colours.bar).toBe(colours.surface);
  expect(colours.bar).not.toBe(colours.accent);
  expect(colours.play).toBe(colours.accent);
  expect(colours.expand).not.toBe(colours.accent);

  // No decorative motion: no equalizer bars, nothing pulsing.
  await expect(bar.locator('[class*="animate-eq"], .animate-pulse')).toHaveCount(0);

  // Playing / Paused in words, with the provider.
  const line = page.getByTestId('mini-now-playing');
  await expect(line).toHaveText('Playing · YouTube');
  await expect(page.getByTestId('listen-now-playing')).toHaveText('Playing: YouTube Reference');
  // The playing provider carries a speaker next to its name, apart from the check of the shown one.
  await expect(page.getByTestId('reference-provider-youtube-playing')).toHaveCount(1);
  await page.evaluate(() => window.postMessage('{"event":"onStateChange","info":2}', '*'));
  await expect(line).toHaveText('Paused · YouTube');
  await expect(page.getByTestId('listen-now-playing')).toHaveText('Paused: YouTube Reference');
});

// The Record tab is a blurred, inert preview for guests: this one runs as a member.
test.describe('Record tab status line', () => {
  test.use({ storageState: ROLES.member.storage });
  test('the reference status line wraps instead of truncating, and "Open player" leads to the Listen tab', async ({ page }) => {
    await openSong(page, LINKS);
    await page.getByTestId('practice-tab-record').click();
    const status = page.getByTestId('reference-status');
    await expect(status).toContainText('Reference: YouTube video loaded');
    const text = status.locator('span').first();
    const truncated = await text.evaluate((el) => {
      const s = getComputedStyle(el);
      return s.textOverflow === 'ellipsis' || el.scrollWidth > el.clientWidth;
    });
    expect(truncated).toBe(false);
    const open = page.getByTestId('reference-open-player');
    await expect(open).toHaveText('Open player');
    expect((await open.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await open.click();
    await expect(page.getByTestId('reference-providers')).toBeVisible();
  });
});
