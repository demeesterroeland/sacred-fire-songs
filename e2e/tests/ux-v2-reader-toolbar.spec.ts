import { test, expect, type Page } from '@playwright/test';
import { openSongControls } from '../fixtures/songControls';
import pg from 'pg';
import { DEFAULT_LYRIC_STEP, LYRIC_STEPS } from '../../lib/design/tokens';

/**
 * Story 6.1.6 / G2.1 (#390): `Chords · A− · A+` reader toolbar under the song title.
 * Gherkin: docs/testing/ux-v2-reader-toolbar.feature (@e2e).
 */
const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

test.use({ viewport: { width: 390, height: 844 } });

let songId = '';

test.beforeAll(async () => {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    // A public song whose ChordPro really contains chords.
    const { rows } = await client.query<{ id: string }>(`
      SELECT c.id FROM public.compositions c
       WHERE c.is_public AND c.has_chords
         AND EXISTS (SELECT 1 FROM public.song_versions v
                      WHERE v.composition_id = c.id AND v.content_chordpro ~ '\\[[A-G]')
       ORDER BY c.title LIMIT 1`);
    songId = rows[0]?.id ?? '';
  } finally {
    await client.end();
  }
});

const lyricPx = (page: Page) =>
  page.getByTestId('lyric').first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));

test.beforeEach(async ({ page }) => {
  await openSongControls(page);
  test.skip(!songId, 'no public song with chords in the seed');
  // Start every test from the defaults on this device, in English.
  await page.goto(`/songs/${songId}`);
  await page.evaluate(() => {
    localStorage.setItem('sacred-fire-songs-locale', 'en');
    localStorage.removeItem('sacred-fire-songs-reader');
  });
  await page.reload();
  await expect(page.getByTestId('reader-toolbar')).toBeVisible();
});

test('Text size persists across reload', async ({ page }) => {
  const toolbar = page.getByTestId('reader-toolbar');
  await expect.poll(() => lyricPx(page)).toBe(LYRIC_STEPS[DEFAULT_LYRIC_STEP]);

  const larger = toolbar.getByRole('button', { name: 'Larger text' });
  await larger.click();
  await larger.click();
  await expect.poll(() => lyricPx(page)).toBe(LYRIC_STEPS[DEFAULT_LYRIC_STEP + 2]);

  await page.reload();
  await expect(page.getByTestId('reader-toolbar')).toBeVisible();
  await expect.poll(() => lyricPx(page)).toBe(LYRIC_STEPS[DEFAULT_LYRIC_STEP + 2]);

  // Every toolbar control is at least 44 px tall.
  for (const box of await toolbar.locator('button').evaluateAll((els) =>
    els.map((el) => el.getBoundingClientRect().height),
  )) {
    expect(box).toBeGreaterThanOrEqual(44);
  }
});

test('Chords off hides the chord layer without merging lines', async ({ page }) => {
  const lines = page.getByTestId('lyric-line');
  const before = await lines.count();
  expect(before).toBeGreaterThan(0);
  await expect(page.getByTestId('chord').first()).toBeVisible();

  const sw = page.getByTestId('reader-toolbar').getByRole('switch', { name: 'Chords' });
  await expect(sw).toHaveAttribute('aria-checked', 'true');
  await sw.click();
  await expect(sw).toHaveAttribute('aria-checked', 'false');

  await expect(page.getByTestId('chord')).toHaveCount(0);
  await expect(page.getByTestId('song-display')).toHaveAttribute('data-chords', 'off');
  await expect(lines).toHaveCount(before);

  // Distinct lyric lines still sit on distinct rows.
  const tops = await lines.evaluateAll((els) => els.slice(0, 6).map((el) => el.getBoundingClientRect().top));
  for (let i = 1; i < tops.length; i++) expect(tops[i]).toBeGreaterThan(tops[i - 1]);
});
