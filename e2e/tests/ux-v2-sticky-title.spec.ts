import { test, expect } from '@playwright/test';
import pg from 'pg';

/**
 * Story 6.1.8 / G2.3 (#392): the sticky song title truncates at the end. Validation 2 (item 6): it is a copy that only
 * shows once the full, wrapping title in the page has scrolled away.
 * Gherkin: docs/testing/ux-v2-song-header.feature (@e2e).
 */
const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

test.use({ viewport: { width: 390, height: 844 } });

test('long title in the sticky bar (after scrolling past the full title) shows its beginning and an ellipsis', async ({ page }) => {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  const {
    rows: [song],
  } = await client
    .query<{ id: string; title: string }>(
      // A public song with a long title AND enough lyrics to scroll the page (a short song cannot scroll).
      `SELECT c.id, c.title
         FROM public.compositions c
         JOIN public.song_versions v ON v.composition_id = c.id
        WHERE c.is_public
          AND length(c.title) >= 40
          AND cardinality(string_to_array(v.content_chordpro, E'\\n')) >= 40
        ORDER BY length(c.title) DESC, length(v.content_chordpro) DESC
        LIMIT 1`
    )
    .finally(() => client.end());
  test.skip(!song, 'no public song with a long title and enough lyrics to scroll seeded');

  await page.goto(`/songs/${song.id}`);
  const title = page.getByTestId('sticky-song-title');
  const header = title.locator('xpath=ancestor::div[1]'); // the 56 px bar inside the zero-height sticky header
  await expect(title).toHaveText(song.title);
  await expect(page.getByTestId('song-title')).toHaveText(song.title); // the full title, in the page

  const headerTop = await header.evaluate((el) => el.getBoundingClientRect().top);
  await page.mouse.wheel(0, 800);
  // The page scrolls in the window or an inner container; either must have moved.
  await expect
    .poll(() =>
      page.evaluate(() =>
        Math.max(
          document.scrollingElement?.scrollTop ?? 0,
          ...[...document.querySelectorAll('*')].map((el) => el.scrollTop)
        )
      )
    )
    .toBeGreaterThan(0);
  await expect(title).toBeVisible(); // the full title has scrolled away: the copy shows
  await expect(header).toBeInViewport();
  // Sticky: it stays pinned at (or above) where it started instead of scrolling away.
  const pinnedTop = await header.evaluate((el) => el.getBoundingClientRect().top);
  expect(pinnedTop).toBeGreaterThanOrEqual(0);
  expect(pinnedTop).toBeLessThanOrEqual(headerTop);

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
      scrollLeft: el.scrollLeft,
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
  expect(box.scrollLeft).toBe(0); // the text starts at its first letter
});
