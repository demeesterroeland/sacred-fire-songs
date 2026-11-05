import { test, expect, type Page } from '@playwright/test';
import pg from 'pg';
import { ROLES } from '../fixtures/roles';

/**
 * Story 6.1.9 / G2.4 (#393): sticky Practice · Playlist · ♥ action bar on the song page (phones).
 * Gherkin: docs/testing/ux-v2-song-action-bar.feature (@e2e). Read-only: seeded public songs only.
 */
const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

test.use({ viewport: { width: 390, height: 844 } });
test.describe.configure({ timeout: 90_000 });

let withMedia = '';
let withoutMedia = '';

test.beforeAll(async () => {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    const pick = async (hasMedia: boolean) => {
      const { rows } = await client.query<{ id: string }>(
        `SELECT c.id FROM public.compositions c
          WHERE c.is_public
            -- one version only: the page decides on media from the version it shows first
            AND (SELECT count(*) FROM public.song_versions v WHERE v.composition_id = c.id) = 1
            AND ${hasMedia ? '' : 'NOT'} EXISTS (
              SELECT 1 FROM public.song_versions v
               WHERE v.composition_id = c.id
                 AND (coalesce(v.youtube_url, '') <> '' OR coalesce(v.spotify_url, '') <> '' OR coalesce(v.soundcloud_url, '') <> ''))
          ORDER BY c.title LIMIT 1`,
      );
      return rows[0]?.id ?? '';
    };
    withMedia = await pick(true);
    withoutMedia = await pick(false);
  } finally {
    await client.end();
  }
});

async function openSong(page: Page, id: string) {
  await page.goto(`/songs/${id}`);
  await page.evaluate(() => localStorage.setItem('sacred-fire-songs-locale', 'en'));
  await page.reload();
  await expect(page.getByTestId('song-action-bar')).toBeVisible({ timeout: 20_000 });
}

/** The page is short on some seeds: make it long enough to scroll. */
async function makeScrollable(page: Page) {
  await page.evaluate(() => {
    document.body.style.minHeight = '4000px';
  });
}

test.describe('Member @story-6.1.9', () => {
  test.use({ storageState: ROLES.member.storage });

  test('shows three labelled 44 px actions, labels at least 12 px', async ({ page }) => {
    test.skip(!withoutMedia, 'no public song without media in the seed');
    await openSong(page, withoutMedia);
    for (const id of ['song-action-practice', 'song-action-playlist', 'song-action-favorite']) {
      const action = page.getByTestId(id);
      await expect(action).toBeVisible();
      const box = await action.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      const fontPx = await action.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      expect(fontPx).toBeGreaterThanOrEqual(12);
    }
    await expect(page.getByTestId('song-action-practice')).toContainText('Practice');
    await expect(page.getByTestId('song-action-playlist')).toContainText('Playlist');
  });

  test('two taps to the recorder when the song has no media: Practice opens on Record', async ({ page }) => {
    test.skip(!withoutMedia, 'no public song without media in the seed');
    await openSong(page, withoutMedia);
    await page.getByTestId('song-action-practice').click(); // tap 1
    await expect(page.getByRole('button', { name: 'Upload File' })).toBeVisible({ timeout: 10_000 });
  });

  test('two taps to the recorder when the song has media: Practice → Record', async ({ page }) => {
    test.skip(!withMedia, 'no public song with media in the seed');
    await openSong(page, withMedia);
    await page.getByTestId('song-action-practice').click(); // tap 1: opens on Listen
    await expect(page.getByTestId('practice-tab-listen')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'Upload File' })).toBeHidden();
    await page.getByTestId('practice-tab-record').click(); // tap 2
    await expect(page.getByRole('button', { name: 'Upload File' })).toBeVisible();
  });

  test('the ⋮ sheet keeps share, edit and delete only', async ({ page }) => {
    test.skip(!withoutMedia, 'no public song without media in the seed');
    await openSong(page, withoutMedia);
    await page.getByRole('button', { name: 'More actions' }).first().click();
    const sheet = page.getByTestId('song-overflow-sheet');
    await expect(sheet.getByRole('button', { name: 'Share Song' })).toBeVisible();
    for (const gone of [/practice/i, /playlist/i, /liked songs/i]) {
      await expect(sheet.getByRole('button', { name: gone })).toHaveCount(0);
    }
  });

  test('the bar sits above the bottom nav and rises with the mini player', async ({ page }) => {
    test.skip(!withoutMedia, 'no public song without media in the seed');
    await openSong(page, withoutMedia);
    const bar = page.getByTestId('song-action-bar');
    const nav = page.getByTestId('bottom-nav');
    await expect(nav).toBeVisible();
    const barBox = (await bar.boundingBox())!;
    const navBox = (await nav.boundingBox())!;
    expect(barBox.y + barBox.height).toBeLessThanOrEqual(navBox.y + 1);

    // Simulate the mini player (56 px bar on top of the nav): the bar rises above it.
    const before = barBox.y;
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--mini-player-h', 'calc(3.5rem + var(--bottom-nav-height, 3.5rem))');
    });
    await expect.poll(async () => (await bar.boundingBox())!.y).toBeLessThanOrEqual(before - 55);
  });

  test('reserves its height on the page so the last lines are not covered', async ({ page }) => {
    test.skip(!withoutMedia, 'no public song without media in the seed');
    await openSong(page, withoutMedia);
    const reserved = await page.evaluate(() => document.documentElement.style.getPropertyValue('--action-bar-h'));
    expect(reserved).toBe('3.5rem');
  });

  test('hides when scrolling down and shows when scrolling up', async ({ page }) => {
    test.skip(!withoutMedia, 'no public song without media in the seed');
    await openSong(page, withoutMedia);
    await makeScrollable(page);
    const bar = page.getByTestId('song-action-bar');
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(bar).toHaveAttribute('data-visible', 'false');
    await expect(bar).toBeHidden();
    await page.evaluate(() => window.scrollTo(0, 500));
    await expect(bar).toHaveAttribute('data-visible', 'true');
    await expect(bar).toBeVisible();
  });

  test('stays visible while scrolling when the auto-hide preference is off', async ({ page }) => {
    test.skip(!withoutMedia, 'no public song without media in the seed');
    await openSong(page, withoutMedia);
    await page.evaluate(() => {
      const key = 'sacred-fire-songs-preferences';
      const prefs = JSON.parse(localStorage.getItem(key) ?? '{}');
      localStorage.setItem(key, JSON.stringify({ ...prefs, autoHideBottomNav: false }));
    });
    await page.reload();
    await expect(page.getByTestId('song-action-bar')).toBeVisible({ timeout: 20_000 });
    await makeScrollable(page);
    await page.evaluate(() => window.scrollTo(0, 800));
    await expect(page.getByTestId('song-action-bar')).toHaveAttribute('data-visible', 'true');
    // The bar must still clear the nav, which now stays on screen.
    const barBox = (await page.getByTestId('song-action-bar').boundingBox())!;
    const navBox = (await page.getByTestId('bottom-nav').boundingBox())!;
    expect(barBox.y + barBox.height).toBeLessThanOrEqual(navBox.y + 1);
  });
});

test.describe('Guest @story-6.1.9', () => {
  test('the heart opens the favourites gate with the current path in next=', async ({ page }) => {
    test.skip(!withoutMedia, 'no public song without media in the seed');
    await openSong(page, withoutMedia);
    await page.getByTestId('song-action-favorite').click();
    const gate = page.locator('[data-testid="guest-gate"][data-feature="favourites"]');
    await expect(gate).toBeVisible();
    await expect(gate.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      new RegExp(`/auth/login\\?next=%2Fsongs%2F${withoutMedia}`),
    );
  });

  test('Playlist opens the add-to-playlist gate', async ({ page }) => {
    test.skip(!withoutMedia, 'no public song without media in the seed');
    await openSong(page, withoutMedia);
    await page.getByTestId('song-action-playlist').click();
    await expect(page.locator('[data-testid="guest-gate"][data-feature="addToPlaylist"]')).toBeVisible();
  });

  test('Practice opens the drawer; Record shows the recorder gate', async ({ page }) => {
    test.skip(!withoutMedia, 'no public song without media in the seed');
    await openSong(page, withoutMedia);
    await page.getByTestId('song-action-practice').click();
    await expect(page.locator('[data-testid="guest-gate"][data-feature="recorder"]')).toBeVisible({ timeout: 10_000 });
  });
});
