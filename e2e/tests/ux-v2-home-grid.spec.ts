import { test, expect, type Page } from '@playwright/test';

/**
 * Story 6.1.36 (#488): on Home a guest sees the recently added songs in the columns of the
 * category grid and of the song list on /songs, with titles lined up with the categories.
 * Gherkin: docs/testing/ux-v2-home-grid.feature (@e2e).
 */
test.use({ storageState: { cookies: [], origins: [] } });

const LOCALE_KEY = 'sacred-fire-songs-locale';
const pinEnglish = (page: Page) => page.addInitScript(([k, v]) => localStorage.setItem(k, v), [LOCALE_KEY, 'en']);

type Box = { x: number; width: number };

/** Left edges of the visible song rows, the category sections and their first texts. */
async function homeGeometry(page: Page) {
  await pinEnglish(page);
  await page.goto('/');
  await expect(page.getByTestId('recently-added')).toBeVisible();
  await expect(page.getByTestId('category-grid').locator('section').first()).toBeVisible();
  return page.evaluate(() => {
    const visible = (el: Element) => el.getBoundingClientRect().height > 0;
    const box = (el: Element): Box => {
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.left), width: Math.round(r.width) };
    };
    const rows = [...document.querySelectorAll('[data-testid="recently-added"] [data-testid="song-row"]')].filter(visible);
    const sections = [...document.querySelectorAll('[data-testid="category-grid"] > section')];
    return {
      rows: rows.map(box),
      titles: rows.map((r) => box(r.querySelector('h3')!)),
      sections: sections.map(box),
      categoryHeadings: sections.map((s) => box(s.querySelector('h3')!)),
      categoryLinks: sections.map((s) => s.querySelector('ul a')).filter(Boolean).map((a) => box(a!)),
      recentLabel: box(document.getElementById('recently-added-heading')!),
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    };
  });
}

async function songsPageColumns(page: Page): Promise<number[]> {
  await page.goto('/songs');
  const rows = page.getByTestId('song-list').getByTestId('song-row');
  await expect(rows.nth(1)).toBeVisible();
  const xs = await rows.evaluateAll((els) => els.slice(0, 2).map((e) => Math.round(e.getBoundingClientRect().left)));
  return xs;
}

for (const width of [768, 1280]) {
  test.describe(`${width} px`, () => {
    test.use({ viewport: { width, height: 1000 } });

    test('ten recently added songs in the two category columns, filled row by row', async ({ page }) => {
      const g = await homeGeometry(page);
      expect(g.rows).toHaveLength(10);
      const [left, right] = [g.sections[0], g.sections[1]];
      expect(right.x).toBeGreaterThan(left.x);
      // Row by row: 1 left, 2 right, 3 left, ...
      g.rows.forEach((row, i) => {
        const column = i % 2 === 0 ? left : right;
        expect(row.x, `row ${i + 1} x`).toBe(column.x);
        expect(row.width, `row ${i + 1} width`).toBe(column.width);
      });
    });

    test('titles, category headings, category links and labels start at the same x', async ({ page }) => {
      const g = await homeGeometry(page);
      const leftText = g.titles[0].x;
      expect(g.categoryHeadings[0].x).toBe(leftText);
      expect(g.categoryLinks[0].x).toBe(leftText);
      expect(g.recentLabel.x).toBe(leftText);
      expect(g.categoryHeadings[1].x).toBe(g.titles[1].x);
    });

    test('the song columns sit at the same x as on the Songs page', async ({ page }) => {
      const g = await homeGeometry(page);
      const songs = await songsPageColumns(page);
      expect(songs).toEqual([g.rows[0].x, g.rows[1].x]);
    });
  });
}

test.describe('390 px phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('five recently added songs in one column, lined up with the categories, no sideways scroll', async ({ page }) => {
    const g = await homeGeometry(page);
    expect(g.rows).toHaveLength(5);
    for (const row of g.rows) expect(row.x).toBe(g.sections[0].x);
    expect(g.categoryHeadings[0].x).toBe(g.titles[0].x);
    expect(g.recentLabel.x).toBe(g.titles[0].x);
    expect(g.scrollWidth).toBeLessThanOrEqual(g.innerWidth);
  });
});
