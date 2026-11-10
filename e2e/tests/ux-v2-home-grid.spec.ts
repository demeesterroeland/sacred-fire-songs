import { test, expect, type Page } from '@playwright/test';
import { ROLES } from '../fixtures/roles';

/**
 * Story 6.1.36 (#488): on Home the recently added songs sit in the columns of the category grid
 * and of the song list on /songs, with titles lined up with the categories; signed in, the same
 * grid with Your library on top. One page background in dark mode.
 * Gherkin: docs/testing/ux-v2-home-grid.feature (@e2e).
 */
const GUEST = { cookies: [], origins: [] };

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
      exploreLabel: box([...document.querySelectorAll('p')].find((p) => p.textContent === 'Explore by category')!),
      search: document.querySelector('[role="search"]') ? box(document.querySelector('[role="search"]')!) : null,
      library: document.querySelector('[data-testid="library-summary"]')
        ? {
            label: box(document.getElementById('library-summary-heading')!),
            stats: [...document.querySelectorAll('[data-testid="library-stat"]')].map((el) => ({
              key: el.getAttribute('data-key'),
              text: box(el.querySelector('p')!),
              y: Math.round(el.getBoundingClientRect().top),
            })),
            y: Math.round(document.querySelector('[data-testid="library-summary"]')!.getBoundingClientRect().top),
          }
        : null,
      recentY: Math.round(document.querySelector('[data-testid="recently-added"]')!.getBoundingClientRect().top),
      gridY: Math.round(document.querySelector('[data-testid="category-grid"]')!.getBoundingClientRect().top),
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
    test.use({ viewport: { width, height: 1000 }, storageState: GUEST });

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
      expect(g.categoryHeadings[1].x).toBe(g.titles[1].x);
      // Section labels start at the left edge of the search field and of the grid.
      expect(g.search!.x).toBe(g.sections[0].x);
      expect(g.recentLabel.x).toBe(g.sections[0].x);
      expect(g.exploreLabel.x).toBe(g.sections[0].x);
    });

    test('the song columns sit at the same x as on the Songs page', async ({ page }) => {
      const g = await homeGeometry(page);
      const songs = await songsPageColumns(page);
      expect(songs).toEqual([g.rows[0].x, g.rows[1].x]);
    });
  });
}

test.describe('390 px phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, storageState: GUEST });

  test('five recently added songs in one column, lined up with the categories, no sideways scroll', async ({ page }) => {
    const g = await homeGeometry(page);
    expect(g.rows).toHaveLength(5);
    for (const row of g.rows) expect(row.x).toBe(g.sections[0].x);
    expect(g.categoryHeadings[0].x).toBe(g.titles[0].x);
    expect(g.recentLabel.x).toBe(g.sections[0].x);
    expect(g.scrollWidth).toBeLessThanOrEqual(g.innerWidth);
  });
});

const LIBRARY_KEYS = ['favorites', 'drafts', 'mySongs', 'recordings', 'sharedWithMe', 'sharedByMe'];

for (const [width, height] of [[1280, 1000], [390, 844]] as const) {
  test.describe(`signed in, ${width} px`, () => {
    test.use({ viewport: { width, height }, storageState: ROLES.member.storage });

    test('Your library on top, then Recently added and the categories, in the guest grid', async ({ page }) => {
      const g = await homeGeometry(page);
      expect(g.library).not.toBeNull();
      const lib = g.library!;
      expect(lib.stats.map((s) => s.key)).toEqual(LIBRARY_KEYS);
      expect(lib.y).toBeLessThan(g.recentY);
      expect(g.recentY).toBeLessThan(g.gridY);
      expect(g.rows).toHaveLength(width >= 768 ? 10 : 5);
      // Labels on the grid edge, numbers on the title inset.
      expect(lib.label.x).toBe(g.sections[0].x);
      expect(g.recentLabel.x).toBe(g.sections[0].x);
      expect(g.exploreLabel.x).toBe(g.sections[0].x);
      expect(lib.stats[0].text.x).toBe(g.titles[0].x);
      expect(g.categoryHeadings[0].x).toBe(g.titles[0].x);
      if (width >= 768) {
        // Two groups of three, one above each column; the second group starts on the right column's inset.
        expect(lib.stats[3].text.x).toBe(g.titles[1].x);
        expect(new Set(lib.stats.map((s) => s.y)).size).toBe(1);
      } else {
        expect(g.scrollWidth).toBeLessThanOrEqual(g.innerWidth);
      }
    });
  });
}

test.describe('Shared by me', () => {
  test.use({ viewport: { width: 1280, height: 1000 }, storageState: ROLES.member.storage });

  test('the Home count matches the rows on the Shared by me page', async ({ page }) => {
    await pinEnglish(page);
    await page.goto('/');
    const stat = page.locator('[data-testid="library-stat"][data-key="sharedByMe"]');
    const count = Number(await stat.locator('p').first().innerText());
    await stat.click();
    await expect(page).toHaveURL(/\/library\/shared-by-me$/);
    await expect(page.getByRole('heading', { level: 1, name: /Shared by me/ })).toBeVisible();
    if (count === 0) await expect(page.getByTestId('shared-by-me-empty')).toBeVisible();
    else await expect(page.getByTestId('shared-by-me-row')).toHaveCount(count);
  });
});

test.describe('one background in dark mode', () => {
  test.use({ viewport: { width: 1280, height: 1000 }, storageState: ROLES.member.storage });

  for (const path of ['/songs', '/library/playlists']) {
    test(`${path} uses the app background`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.addInitScript(() => {
        localStorage.setItem('sacred-fire-songs-locale', 'en');
        const key = 'sacred-fire-songs-preferences';
        const prefs = JSON.parse(localStorage.getItem(key) || '{}');
        localStorage.setItem(key, JSON.stringify({ ...prefs, theme: 'dark' }));
      });
      await page.goto(path);
      await expect(page.locator('main')).toBeVisible();
      const [pageBg, appBg] = await page.evaluate(() => {
        const opaque = (el: Element | null): string => {
          for (let e = el; e; e = e.parentElement) {
            const c = getComputedStyle(e).backgroundColor;
            if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c;
          }
          return '';
        };
        const main = document.querySelector('main')!;
        const content = main.firstElementChild?.firstElementChild ?? main.firstElementChild ?? main;
        return [opaque(content), opaque(main.parentElement)];
      });
      expect(pageBg).toBe(appBg);
    });
  }
});
