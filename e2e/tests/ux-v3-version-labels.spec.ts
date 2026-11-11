import { test, expect } from '@playwright/test';
import pg from 'pg';
import { VERSION_LABELS_FIXTURE_IDS as IDS } from '../fixtures/ids';

/**
 * Story 6.2.6 / G1.1 (#509): each version is named after its songbook or language, in the order original,
 * variants, translations, and four of them fit a 375 px phone without the page scrolling sideways.
 * Gherkin: docs/testing/ux-v3-version-labels.feature (@e2e).
 * Fixture ids in e2e/fixtures/ids.ts; removed by e2e/global-teardown.ts.
 */
const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

test.use({ viewport: { width: 375, height: 812 } });

const BOOKS = [
  [IDS.bookA, 'Songbook A', 'Songbook A, first edition'],
  [IDS.bookB, 'Songbook B', 'Songbook B, second edition'],
  // A long short name still has to fit the phone (the label is cut with an ellipsis, not wrapped).
  [IDS.bookC, 'Songbook C extended community edition', 'Songbook C extended community edition, third printing'],
] as const;

test.beforeAll(async () => {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    await client.query(
      `INSERT INTO public.compositions (id, title, original_author, is_public, has_chords, has_melody)
       VALUES ($1, 'E2E Version Labels Song', 'E2E Author', true, true, false)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, is_public = true`,
      [IDS.song],
    );
    for (const [id, short, title] of BOOKS) {
      await client.query(
        `INSERT INTO public.songbooks (id, title, short_name) VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, short_name = EXCLUDED.short_name`,
        [id, title, short],
      );
    }
    // Created in an order that is NOT the display order, so the test proves the kind order.
    const versions = [
      [IDS.translation, 'Dutch', 'translation', null, '2026-01-01T00:00:00Z'],
      [IDS.variantC, 'Standard', 'variant', IDS.bookC, '2026-01-03T00:00:00Z'],
      [IDS.variantB, 'Standard', 'variant', IDS.bookB, '2026-01-02T00:00:00Z'],
      [IDS.original, 'Standard', 'original', IDS.bookA, '2026-01-04T00:00:00Z'],
    ] as const;
    for (const [id, name, kind, book, created] of versions) {
      await client.query(
        `INSERT INTO public.song_versions (id, composition_id, version_name, version_kind, content_chordpro, key, created_at)
         VALUES ($1, $2, $3, $4, $5, 'E', $6)
         ON CONFLICT (id) DO UPDATE SET version_name = EXCLUDED.version_name, version_kind = EXCLUDED.version_kind,
           content_chordpro = EXCLUDED.content_chordpro, created_at = EXCLUDED.created_at`,
        [id, IDS.song, name, kind, `[E]Line of ${kind} ${id.slice(-1)}`, created],
      );
      if (book) {
        await client.query(
          `INSERT INTO public.song_version_sources (song_version_id, songbook_id, is_primary) VALUES ($1, $2, true)
           ON CONFLICT (song_version_id, songbook_id) DO NOTHING`,
          [id, book],
        );
      }
    }
  } finally {
    await client.end();
  }
});

test('versions are named after their book or language, original first', async ({ page }) => {
  await page.goto(`/songs/${IDS.song}`);
  const options = page.getByTestId('song-version-switch').getByRole('radio');
  await expect(options).toHaveCount(4);
  await expect(options.nth(0)).toHaveText('Songbook A');
  await expect(options.nth(1)).toHaveText('Songbook B');
  await expect(options.nth(2)).toHaveText('Songbook C extended community edition');
  // "Dutch" is the stored name; the label is the language in the app language (English here).
  await expect(options.nth(3)).toHaveText('Dutch');
  await expect(options.nth(0)).toHaveAttribute('aria-checked', 'true');
});

test('four versions fit a 375 px phone: every option reachable, the page never scrolls sideways', async ({ page }) => {
  await page.goto(`/songs/${IDS.song}`);
  const group = page.getByTestId('song-version-switch').getByRole('radiogroup');
  await expect(group).toBeVisible();
  const options = group.getByRole('radio');
  await expect(options).toHaveCount(4);

  const pageOverflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(await pageOverflow()).toBeLessThanOrEqual(0);

  // The strip stays inside the viewport and scrolls on its own when the options are wider than it.
  const box = await group.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(375 + 0.5);

  for (let i = 0; i < 4; i++) {
    const option = options.nth(i);
    await option.scrollIntoViewIfNeeded();
    const rect = await option.boundingBox();
    expect(rect!.height, `option ${i} is a 44 px target`).toBeGreaterThanOrEqual(44);
    // Fully inside the viewport once scrolled to, label cut with an ellipsis rather than wrapped.
    expect(rect!.x).toBeGreaterThanOrEqual(-0.5);
    expect(rect!.x + rect!.width).toBeLessThanOrEqual(375 + 0.5);
    const lines = await option.locator('span').evaluate((el) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)));
    expect(lines, `label ${i} stays on one line`).toBe(1);
    await option.click();
    await expect(option).toHaveAttribute('aria-checked', 'true');
    expect(await pageOverflow()).toBeLessThanOrEqual(0);
  }
});
