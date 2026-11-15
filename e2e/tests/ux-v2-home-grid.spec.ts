import { test, expect, type Page } from '@playwright/test';
import pg from 'pg';
import { ROLES } from '../fixtures/roles';

/**
 * Story 6.1.36 (#488): on Home the recently added songs sit in the columns of the category grid
 * and of the song list on /songs, with titles lined up with the categories; signed in, the same
 * grid with Your library on top. One page background in dark mode.
 * Gherkin: docs/testing/ux-v2-home-grid.feature (@e2e).
 */
const GUEST = { cookies: [], origins: [] };
const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
// Seeded accounts (scripts/db/random-seeder.mjs USERS).
const MEMBER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
const GATEKEEPER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14';

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

  // #601 (#488): the list names the song and the member, not only the count. The seed shares nothing, so this test
  // shares one of the member's seeded takes with the gatekeeper and removes the share afterwards (the delete trigger
  // also removes the notification).
  test('the Home count matches the rows on the Shared by me page, each naming the song and the member', async ({ page }) => {
    const db = new pg.Client({ connectionString: DATABASE_URL });
    await db.connect();
    const { rows } = await db.query<{ id: string; title: string; name: string }>(
      `SELECT r.id, c.title, p.full_name AS name
         FROM public.user_recordings r
         JOIN public.song_versions v ON v.id = r.song_version_id
         JOIN public.compositions c ON c.id = v.composition_id
         JOIN public.public_profiles p ON p.id = $2
        WHERE r.user_id = $1
          AND NOT EXISTS (SELECT 1 FROM public.recording_shares s WHERE s.recording_id = r.id AND s.shared_with_user_id = $2)
        ORDER BY r.created_at LIMIT 1`,
      [MEMBER_ID, GATEKEEPER_ID],
    );
    const take = rows[0];
    // Fail, not skip: without a seeded take the test would prove nothing.
    expect(take, 'the seed has a take of the member and a named gatekeeper').toBeTruthy();
    const { rows: share } = await db.query<{ id: string }>(
      'INSERT INTO public.recording_shares (recording_id, shared_with_user_id) VALUES ($1, $2) RETURNING id',
      [take.id, GATEKEEPER_ID],
    );
    try {
      await pinEnglish(page);
      await page.goto('/');
      const stat = page.locator('[data-testid="library-stat"][data-key="sharedByMe"]');
      const count = Number(await stat.locator('p').first().innerText());
      expect(count).toBeGreaterThanOrEqual(1);
      await stat.click();
      await expect(page).toHaveURL(/\/library\/shared-by-me$/);
      await expect(page.getByRole('heading', { level: 1, name: /Shared by me/ })).toBeVisible();
      const rowsOnPage = page.getByTestId('shared-by-me-row');
      await expect(rowsOnPage).toHaveCount(count);
      const row = rowsOnPage.filter({ hasText: take.title }).filter({ hasText: `Shared with ${take.name}` });
      await expect(row).toHaveCount(1);
      await expect(row).toHaveAttribute('href', `/recordings/${take.id}`);
    } finally {
      await db.query('DELETE FROM public.recording_shares WHERE id = $1', [share[0].id]);
      await db.end();
    }
  });

  // Owner review: "Your recordings" counts the songs the list it opens shows, not the takes.
  test('the Your recordings count matches the songs on /songs?myRecordings=true', async ({ page }) => {
    await pinEnglish(page);
    await page.goto('/');
    const stat = page.locator('[data-testid="library-stat"][data-key="recordings"]');
    const count = Number(await stat.locator('p').first().innerText());
    await stat.click();
    await expect(page).toHaveURL(/myRecordings=true/);
    await expect(page.getByText(new RegExp(`^${count} results?$`))).toBeVisible();
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
