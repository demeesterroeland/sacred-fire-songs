import { test, expect } from '@playwright/test';
import { ROLES } from '../fixtures/roles';

/**
 * Story 6.1.2 / G1.2 (#386): compact song rows — title plus one grey meta line.
 * Gherkin: docs/testing/ux-v2-song-rows.feature (@e2e).
 */
test.use({ viewport: { width: 390, height: 844 } });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('sacred-fire-songs-locale', 'en'));
});

test('Compact song rows: at least 6 visible on a 390 px phone', async ({ page }) => {
  await page.goto('/songs');
  const rows = page.getByTestId('song-row');
  await expect(rows.first()).toBeVisible();
  await expect.poll(() => rows.count()).toBeGreaterThanOrEqual(6);

  // Fully inside the viewport, above any fixed bottom bar.
  const visible = await page.evaluate(() => {
    const vh = window.innerHeight;
    const barTops = [...document.querySelectorAll('body *')]
      .filter((el) => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return cs.position === 'fixed' && r.bottom >= vh - 1 && r.height > 0 && r.height < vh / 2;
      })
      .map((el) => el.getBoundingClientRect().top);
    const limit = Math.min(vh, ...barTops);
    return [...document.querySelectorAll('[data-testid="song-row"]')].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= limit;
    }).length;
  });
  expect(visible).toBeGreaterThanOrEqual(6);
});

test('each row shows the title and one meta line, with at most two coloured elements', async ({ page }) => {
  await page.goto('/songs');
  const rows = page.getByTestId('song-row');
  await expect(rows.first()).toBeVisible();

  const report = await rows.evaluateAll((els) => {
    const saturated = (c: string) => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return false;
      const [r, g, b, a = '1'] = m[1].split(/[ ,/]+/).filter(Boolean);
      if (parseFloat(a) < 0.2) return false;
      const v = [r, g, b].map(Number);
      return Math.max(...v) - Math.min(...v) > 40; // not grey
    };
    return els.slice(0, 12).map((row) => {
      const title = row.querySelector('h3')?.textContent?.trim() ?? '';
      const metas = row.querySelectorAll('[data-testid="song-row-meta"]');
      const metaHeight = metas[0]?.getBoundingClientRect().height ?? 0;
      const lineHeight = metas[0] ? parseFloat(getComputedStyle(metas[0]).lineHeight) || 20 : 0;
      const coloured = [row, ...row.querySelectorAll('*')].filter((el) => {
        const cs = getComputedStyle(el);
        const text = el.childNodes.length > 0 && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
        return (text && saturated(cs.color)) || saturated(cs.backgroundColor) || (el.tagName === 'svg' && saturated(cs.color));
      }).length;
      return { title, metaCount: metas.length, oneLine: metaHeight <= lineHeight * 1.5, coloured };
    });
  });

  expect(report.length).toBeGreaterThan(0);
  for (const r of report) {
    expect(r.title, JSON.stringify(r)).not.toBe('');
    expect(r.metaCount, r.title).toBe(1);
    expect(r.oneLine, r.title).toBe(true);
    expect(r.coloured, r.title).toBeLessThanOrEqual(2);
  }
});

test('heart and add-to-playlist are 44 px targets', async ({ page }) => {
  await page.goto('/songs');
  const row = page.getByTestId('song-row').first();
  await expect(row).toBeVisible();
  const heart = row.getByRole('button', { name: /favou?rite/i });
  const box = await heart.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.width).toBeGreaterThanOrEqual(44);
});

test.describe('as a member', () => {
  test.use({ storageState: ROLES.member.storage });

  test('heart and add-to-playlist are separate 44 px buttons on a song row', async ({ page }) => {
    await page.goto('/songs');
    const row = page.getByTestId('song-row').first();
    await expect(row).toBeVisible();
    for (const name of [/favou?rite/i, /playlist/i]) {
      const box = await row.getByRole('button', { name }).boundingBox();
      expect(box!.height, String(name)).toBeGreaterThanOrEqual(44);
      expect(box!.width, String(name)).toBeGreaterThanOrEqual(44);
    }
  });

  test('recently viewed uses the same row with one grey meta line', async ({ page }) => {
    // Open one song so the history is not empty.
    await page.goto('/songs');
    const first = page.getByTestId('song-row').first();
    const title = (await first.locator('h3').innerText()).trim();
    await first.getByRole('link').click();
    await expect(page).toHaveURL(/\/songs\/[0-9a-f-]+/);

    await page.goto('/library/recently-viewed');
    const rows = page.getByTestId('song-rows').getByTestId('song-row');
    await expect(rows.first()).toBeVisible();
    await expect(rows.filter({ hasText: title }).first()).toBeVisible();
    const metaCount = await rows.first().evaluate((el) => el.querySelectorAll('p').length);
    expect(metaCount).toBe(1);
    await expect(rows.first()).not.toContainText('Unknown');
  });
});

// #492: deleting is in the song page's ⋮ menu only; an admin (who may delete every song) sees no
// delete button on a row, and every row ends in the same buttons at the same x.
test.describe('as an admin', () => {
  test.use({ storageState: ROLES.admin.storage });

  test('song rows have no delete button and their buttons line up', async ({ page }) => {
    await page.goto('/songs');
    const rows = page.getByTestId('song-row');
    await expect(rows.first()).toBeVisible();
    await expect(page.getByTestId('song-list').getByRole('button', { name: /delete/i })).toHaveCount(0);
    const xs = await rows.evaluateAll((els) =>
      els.slice(0, 12).map((el) => Math.round(el.querySelector('button')!.getBoundingClientRect().right - el.getBoundingClientRect().left)),
    );
    expect(new Set(xs).size).toBe(1);
  });
});

