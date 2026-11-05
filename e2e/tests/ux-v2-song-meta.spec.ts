import { test, expect } from '@playwright/test';
import pg from 'pg';

/**
 * Story 6.1.7 / G2.2 (#391): tags and Key · Capo · Tuning on one grey line each,
 * so the first lyric line is visible without scrolling on 390 × 844.
 * Gherkin: docs/testing/ux-v2-song-meta.feature (@e2e).
 */
const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

test.use({ viewport: { width: 390, height: 844 } });

let songs: { id: string; title: string }[] = [];

test.beforeAll(async () => {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    // Five public songs with lyrics, including the ones with the most tags.
    const { rows } = await client.query<{ id: string; title: string }>(`
      SELECT c.id, c.title
        FROM public.compositions c
        JOIN LATERAL (SELECT count(*) AS n FROM public.song_category_map m WHERE m.song_id = c.id) tags ON true
       WHERE c.is_public
         AND EXISTS (SELECT 1 FROM public.song_versions v WHERE v.composition_id = c.id AND length(v.content_chordpro) > 40)
       ORDER BY tags.n DESC, c.title
       LIMIT 5`);
    songs = rows;
  } finally {
    await client.end();
  }
});

test('Lyrics above the fold on five seeded songs', async ({ page }) => {
  expect(songs.length).toBeGreaterThan(0);
  for (const song of songs) {
    await page.goto(`/songs/${song.id}`);
    const meta = page.getByTestId('song-meta-lines');
    await expect(meta).toBeVisible();

    // Metadata occupies at most two lines: the 44 px meta-line button + one technical line.
    const { height, techHeight, maxTech } = await meta.evaluate((el) => {
      const tech = el.querySelector('[data-testid="song-technical-line"]');
      const fs = parseFloat(getComputedStyle(el).fontSize);
      return {
        height: el.getBoundingClientRect().height,
        techHeight: tech ? tech.getBoundingClientRect().height : 0,
        maxTech: fs * 1.6,
      };
    });
    expect(techHeight, song.title).toBeLessThanOrEqual(maxTech);
    expect(height, song.title).toBeLessThanOrEqual(44 + maxTech + 1);

    // First lyric line fully inside the viewport, above the fixed bottom bars.
    const first = page.getByTestId('lyric-line').first();
    await expect(first).toBeVisible();
    const visible = await first.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const bars = [...document.querySelectorAll('body *')]
        .filter((n) => ['fixed', 'sticky'].includes(getComputedStyle(n).position))
        .map((n) => n.getBoundingClientRect())
        .filter((b) => b.height > 0 && b.width > 0);
      const mid = window.innerHeight / 2;
      const limit = Math.min(window.innerHeight, ...bars.filter((b) => b.top > mid).map((b) => b.top));
      const floor = Math.max(0, ...bars.filter((b) => b.bottom < mid).map((b) => b.bottom));
      return { top: r.top, bottom: r.bottom, limit, floor };
    });
    // Below the sticky top bars, above the fixed bottom bars.
    expect(visible.top, song.title).toBeGreaterThanOrEqual(visible.floor);
    expect(visible.bottom, song.title).toBeLessThanOrEqual(visible.limit);
  }
});

test('the meta line expands into the full tag list', async ({ page }) => {
  test.skip(!songs.length, 'no public song with lyrics seeded');
  await page.goto(`/songs/${songs[0].id}`);
  const toggle = page.getByTestId('song-meta-line');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByTestId('song-meta-lines').getByRole('link').first()).toBeVisible();
});
