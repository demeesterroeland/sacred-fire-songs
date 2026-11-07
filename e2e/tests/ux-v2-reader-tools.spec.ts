import { test, expect, type Page } from '@playwright/test';
import pg from 'pg';
import { ROLES } from '../fixtures/roles';

/**
 * Story 6.1.10 / G2.5 (#394): auto-scroll and transpose live in the reader toolbar (phones, 390 px).
 * Gherkin: docs/testing/ux-v2-reader-tools.feature (@e2e). Read-only: seeded public songs only.
 */
const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

test.use({ viewport: { width: 390, height: 844 } });
test.describe.configure({ timeout: 90_000 });

let keyESong = '';
let longSong = '';

test.beforeAll(async () => {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    // A public song in key E whose first chord is E (E + 2 semitones = F#).
    const e = await client.query<{ id: string }>(
      `SELECT c.id FROM public.compositions c
        JOIN public.song_versions v ON v.composition_id = c.id
       WHERE c.is_public AND c.has_chords AND v.key = 'E' AND v.content_chordpro ~ '\\[E\\]'
         AND (SELECT count(*) FROM public.song_versions x WHERE x.composition_id = c.id) = 1
       ORDER BY c.title LIMIT 1`,
    );
    keyESong = e.rows[0]?.id ?? '';
    const l = await client.query<{ id: string }>(
      `SELECT c.id FROM public.compositions c
        JOIN public.song_versions v ON v.composition_id = c.id
       WHERE c.is_public AND c.has_chords AND v.content_chordpro ~ '\\[[A-G]'
         AND (SELECT count(*) FROM public.song_versions x WHERE x.composition_id = c.id) = 1
       ORDER BY length(v.content_chordpro) DESC LIMIT 1`,
    );
    longSong = l.rows[0]?.id ?? '';
  } finally {
    await client.end();
  }
});

async function openSong(page: Page, id: string, opts: { wakeLock?: boolean } = {}) {
  if (opts.wakeLock) {
    await page.addInitScript(() => {
      const sentinel = { release: async () => {}, addEventListener: () => {} };
      Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: async () => sentinel } });
    });
  }
  await page.goto(`/songs/${id}`);
  await page.evaluate(() => {
    localStorage.setItem('sacred-fire-songs-locale', 'en');
    localStorage.removeItem('sacred-fire-songs-reader');
  });
  await page.reload();
  await expect(page.getByTestId('reader-toolbar')).toBeVisible({ timeout: 20_000 });
}

/**
 * Seeded songs are short. Auto-scroll is only offered when the end of the lyrics is below the fold, so
 * the tests that scroll use a short phone window (the lyrics run below it) and a tall page.
 */
async function makeScrollable(page: Page) {
  await page.setViewportSize({ width: 390, height: 520 });
  await page.evaluate(() => {
    document.body.style.minHeight = '6000px';
  });
  await expect(page.getByTestId('autoscroll-toggle')).toBeVisible();
}

const box = async (page: Page, testId: string) => (await page.getByTestId(testId).boundingBox())!;

test.describe('Musician @story-6.1.10', () => {
  test.use({ storageState: ROLES.musician.storage });

  test('Transpose "+" twice from the toolbar: every chord two semitones higher, key reads F#', async ({ page }) => {
    test.skip(!keyESong, 'no public chord song in key E in the seed');
    await openSong(page, keyESong);
    await expect(page.getByTestId('song-meta-lines')).toContainText('Key E');
    await expect(page.getByTestId('chord').first()).toHaveText('E');

    await page.getByTestId('reader-tools-button').click();
    const sheet = page.getByRole('dialog', { name: 'Reading tools' });
    const up = sheet.getByRole('button', { name: 'Up a semitone' });
    await up.click();
    await up.click();
    await expect(sheet.getByTestId('transpose-value')).toHaveText('+2');
    await expect(sheet.getByTestId('transpose-key')).toContainText('F#');
    await sheet.getByRole('button', { name: 'Close' }).last().click();

    await expect(page.getByTestId('chord').first()).toHaveText('F#');
    await expect(page.getByTestId('song-meta-lines')).toContainText('Key F#');
    // The shift is visible in text on the ⋯ button.
    await expect(page.getByTestId('reader-tools-button')).toContainText('+2');

    // Original key restores everything.
    await page.getByTestId('reader-tools-button').click();
    await page.getByRole('button', { name: 'Original key' }).click();
    await page.getByRole('dialog', { name: 'Reading tools' }).getByRole('button', { name: 'Close' }).last().click();
    await expect(page.getByTestId('chord').first()).toHaveText('E');
    await expect(page.getByTestId('song-meta-lines')).toContainText('Key E');
  });

  test('the toolbar stays one row of 44 px controls on 390 px, clear of the action bar and the lyrics', async ({ page }) => {
    test.skip(!longSong, 'no public chord song in the seed');
    await openSong(page, longSong);
    await page.setViewportSize({ width: 390, height: 600 }); // lyrics run below the fold: ▶ is offered
    await expect(page.getByTestId('autoscroll-toggle')).toBeVisible();
    const toolbar = page.getByTestId('reader-toolbar');
    const buttons = toolbar.locator('button');
    expect(await buttons.count()).toBe(5); // Chords · A− · A+ · Auto-scroll · ⋯
    const rects = await buttons.evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top, height: r.height, right: r.right };
      }),
    );
    for (const r of rects) {
      expect(r.height).toBeGreaterThanOrEqual(44);
      expect(r.right).toBeLessThanOrEqual(390);
      expect(Math.abs(r.top - rects[0].top)).toBeLessThan(2); // one row
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

    // At rest the toolbar scrolls with the page and the lyrics start below it.
    await expect(page.getByTestId('reader-toolbar-wrap')).toHaveCSS('position', 'static');
    const t = await box(page, 'reader-toolbar');
    const firstLyric = (await page.getByTestId('lyric-line').first().boundingBox())!;
    expect(firstLyric.y).toBeGreaterThanOrEqual(t.y + t.height - 1);

    // The last line of the song can be read above the action bar. Scrolling down hides the bar
    // (auto-hide is on by default); a short scroll up brings it back, 20 px away from the end.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(300); // let the scroll event register before scrolling back up
    await page.evaluate(() => window.scrollBy(0, -20));
    await expect(page.getByTestId('song-action-bar')).toHaveAttribute('data-visible', 'true');
    await page.waitForTimeout(400);
    const last = (await page.getByTestId('lyric-line').last().boundingBox())!;
    const bar = await box(page, 'song-action-bar');
    expect(last.y + last.height - 20).toBeLessThanOrEqual(bar.y + 1);
  });

  test('Auto-scroll: starts, keeps the toolbar under the title bar, pauses on a touch', async ({ page }) => {
    test.skip(!longSong, 'no public chord song in the seed');
    await openSong(page, longSong);
    await makeScrollable(page);
    const toggle = page.getByTestId('autoscroll-toggle');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');

    // Faster, so the test does not wait long: open the tools, press Faster twice, close.
    await page.getByTestId('reader-tools-button').click();
    const sheet = page.getByRole('dialog', { name: 'Reading tools' });
    await sheet.getByRole('button', { name: 'Faster' }).click();
    await sheet.getByRole('button', { name: 'Faster' }).click();
    await expect(sheet.getByTestId('scroll-speed')).toHaveText('Speed 5 of 5');
    await sheet.getByRole('button', { name: 'Close' }).last().click();

    const before = await page.evaluate(() => window.scrollY);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 15_000 }).toBeGreaterThan(before + 120);

    // Stuck right under the sticky title bar, and not over the action bar.
    // The strip is only stuck once the page has scrolled it up to the title bar: how far that is depends on the
    // song (a few px more or less), so wait for it to arrive instead of sampling after a fixed distance. Then it
    // must stay there while the page keeps scrolling.
    const header = page.getByTestId('sticky-song-title').locator('xpath=ancestor::header[1]');
    const gap = async () => {
      const headerBox = (await header.boundingBox())!;
      const wrapBox = await box(page, 'reader-toolbar-wrap');
      return Math.abs(wrapBox.y - (headerBox.y + headerBox.height));
    };
    await expect.poll(gap, { timeout: 15_000 }).toBeLessThan(2);
    await page.waitForTimeout(300);
    expect(await gap()).toBeLessThan(2);
    const wrap = await box(page, 'reader-toolbar-wrap');
    const bar = page.getByTestId('song-action-bar');
    if ((await bar.getAttribute('data-visible')) === 'true') {
      const b = (await bar.boundingBox())!;
      expect(wrap.y + wrap.height).toBeLessThanOrEqual(b.y);
    }

    // Reading controls stay usable while it runs, and a tap on the lyrics pauses it.
    await page.touchscreen.tap(200, 300);
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    const stopped = await page.evaluate(() => window.scrollY);
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => window.scrollY)).toBe(stopped);
    // The strip goes back to scrolling away with the page.
    await expect(page.getByTestId('reader-toolbar-wrap')).toHaveCSS('position', 'static');
  });

  test('Auto-scroll speed and start/pause from the tools sheet; the speed is remembered', async ({ page }) => {
    test.skip(!longSong, 'no public chord song in the seed');
    await openSong(page, longSong);
    await makeScrollable(page);
    await page.getByTestId('reader-tools-button').click();
    const sheet = page.getByRole('dialog', { name: 'Reading tools' });
    await expect(sheet.getByTestId('scroll-speed')).toHaveText('Speed 3 of 5');
    await sheet.getByRole('button', { name: 'Slower' }).click();
    await expect(sheet.getByTestId('scroll-speed')).toHaveText('Speed 2 of 5');
    await sheet.getByRole('button', { name: 'Start' }).click();
    await expect(sheet.getByRole('button', { name: 'Pause' })).toBeVisible();
    // A tap inside the sheet does not pause it.
    await expect(page.getByTestId('autoscroll-toggle')).toHaveAttribute('aria-pressed', 'true');
    await sheet.getByRole('button', { name: 'Pause' }).click();
    await expect(page.getByTestId('autoscroll-toggle')).toHaveAttribute('aria-pressed', 'false');
    await sheet.getByRole('button', { name: 'Close' }).last().click();

    await page.reload();
    await expect(page.getByTestId('reader-toolbar')).toBeVisible();
    await page.getByTestId('reader-tools-button').click();
    await expect(page.getByRole('dialog', { name: 'Reading tools' }).getByTestId('scroll-speed')).toHaveText('Speed 2 of 5');
  });

  test('shows the stay-awake indicator while the screen lock is held', async ({ page }) => {
    test.skip(!longSong, 'no public chord song in the seed');
    await openSong(page, longSong, { wakeLock: true });
    await expect(page.getByTestId('stay-awake-indicator')).toBeVisible();
    await expect(page.getByTestId('stay-awake-indicator')).toHaveAttribute('aria-label', 'Screen stays on');
    await page.getByTestId('reader-tools-button').click();
    await expect(page.getByTestId('stay-awake-row')).toContainText('Screen stays on');
  });
});

test.describe('Member @story-6.1.10', () => {
  test.use({ storageState: ROLES.member.storage });

  test('has auto-scroll but no Transpose', async ({ page }) => {
    test.skip(!longSong, 'no public chord song in the seed');
    await openSong(page, longSong);
    await page.setViewportSize({ width: 390, height: 520 });
    await expect(page.getByTestId('autoscroll-toggle')).toBeVisible();
    await page.getByTestId('reader-tools-button').click();
    const sheet = page.getByRole('dialog', { name: 'Reading tools' });
    await expect(sheet.getByRole('group', { name: 'Auto-scroll' })).toBeVisible();
    await expect(sheet.getByRole('group', { name: 'Transpose' })).toHaveCount(0);
  });
});

test.describe('Guest @story-6.1.10', () => {
  test('has auto-scroll but no Transpose', async ({ page }) => {
    test.skip(!longSong, 'no public chord song in the seed');
    await openSong(page, longSong);
    await page.setViewportSize({ width: 390, height: 520 });
    await expect(page.getByTestId('autoscroll-toggle')).toBeVisible();
    await page.getByTestId('reader-tools-button').click();
    await expect(page.getByRole('dialog', { name: 'Reading tools' }).getByRole('group', { name: 'Transpose' })).toHaveCount(0);
  });
});

test.describe('Auto-scroll only when the song does not fit @validation-1', () => {
  test('a song that fits the screen has no ▶ and no tools button for a guest; shrinking the window brings ▶ back', async ({ page }) => {
    test.skip(!longSong, 'no public chord song in the seed');
    await page.setViewportSize({ width: 390, height: 5000 });
    await openSong(page, longSong);
    await page.setViewportSize({ width: 390, height: 5000 });
    await expect(page.getByTestId('reader-toolbar')).toBeVisible();
    await expect(page.getByTestId('autoscroll-toggle')).toHaveCount(0);
    await expect(page.getByTestId('reader-tools-button')).toHaveCount(0); // guest: nothing else in the sheet
    // Viewport resize: the end of the lyrics is now below the fold.
    await page.setViewportSize({ width: 390, height: 520 });
    await expect(page.getByTestId('autoscroll-toggle')).toBeVisible();
    await expect(page.getByTestId('reader-tools-button')).toBeVisible();
    // ...and back: the button leaves again.
    await page.setViewportSize({ width: 390, height: 5000 });
    await expect(page.getByTestId('autoscroll-toggle')).toHaveCount(0);
  });

  test('a running scroll stops when the window grows until the song fits', async ({ page }) => {
    test.skip(!longSong, 'no public chord song in the seed');
    await openSong(page, longSong);
    await makeScrollable(page);
    const toggle = page.getByTestId('autoscroll-toggle');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await page.setViewportSize({ width: 390, height: 5000 });
    await expect(toggle).toHaveCount(0);
    await page.setViewportSize({ width: 390, height: 520 });
    await expect(page.getByTestId('autoscroll-toggle')).toHaveAttribute('aria-pressed', 'false'); // did not restart
  });

  test('the tools sheet of a musician has no Auto-scroll section on a song that fits, but still Transpose', async ({ browser }) => {
    test.skip(!longSong, 'no public chord song in the seed');
    const ctx = await browser.newContext({ storageState: ROLES.musician.storage, viewport: { width: 390, height: 5000 } });
    const page = await ctx.newPage();
    await openSong(page, longSong);
    await page.setViewportSize({ width: 390, height: 5000 });
    await expect(page.getByTestId('autoscroll-toggle')).toHaveCount(0);
    await page.getByTestId('reader-tools-button').click();
    const sheet = page.getByRole('dialog', { name: 'Reading tools' });
    await expect(sheet.getByRole('group', { name: 'Transpose' })).toBeVisible();
    await expect(sheet.getByRole('group', { name: 'Auto-scroll' })).toHaveCount(0);
    await ctx.close();
  });
});
