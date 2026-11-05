import { test, expect } from '@playwright/test';
import pg from 'pg';

/**
 * Story 6.1.8 / G2.3 (#392): the sticky song title truncates at the end.
 * Gherkin: docs/testing/ux-v2-song-header.feature (@e2e).
 */
const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

test.use({ viewport: { width: 390, height: 844 } });

test('long title in the sticky header shows its beginning and an ellipsis', async ({ page }) => {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  const {
    rows: [song],
  } = await client
    .query<{ id: string; title: string }>(
      'SELECT id, title FROM public.compositions WHERE is_public ORDER BY length(title) DESC LIMIT 1'
    )
    .finally(() => client.end());
  test.skip(!song, 'no public song seeded');

  await page.goto(`/songs/${song.id}`);
  const header = page.locator('header').filter({ has: page.getByTestId('sticky-song-title') });
  const title = page.getByTestId('sticky-song-title');
  await expect(title).toHaveText(song.title);

  await page.mouse.wheel(0, 800);
  await expect(header).toBeInViewport();

  const box = await title.evaluate((el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const h = el.closest('header')!.getBoundingClientRect();
    return {
      overflowing: el.scrollWidth > el.clientWidth,
      textOverflow: cs.textOverflow,
      whiteSpace: cs.whiteSpace,
      textAlign: cs.textAlign,
      animation: cs.animationName,
      transform: cs.transform,
      leftGap: r.left - h.left,
      fontPx: parseFloat(cs.fontSize),
    };
  });
  expect(box.overflowing).toBe(true);
  expect(box.textOverflow).toBe('ellipsis');
  expect(box.whiteSpace).toBe('nowrap');
  expect(['left', 'start']).toContain(box.textAlign);
  expect(box.animation).toBe('none');
  expect(box.transform).toBe('none');
  expect(box.leftGap).toBeGreaterThanOrEqual(16);
  expect(box.fontPx).toBeGreaterThanOrEqual(12);
});
