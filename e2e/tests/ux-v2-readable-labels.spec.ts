import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ROLES } from '../fixtures/roles';

/**
 * Story 6.1.3 / G1.3 (#387): small labels are readable.
 * Gherkin: docs/testing/ux-v2-readable-labels.feature (@e2e).
 * axe-core `color-contrast` on the home, songs, song detail and library pages in
 * light and dark at 390 px, and no rendered text below 12 px.
 */
test.use({ viewport: { width: 390, height: 844 } });

const MIN_PX = 12;
const THEMES = ['light', 'dark'] as const;

async function setTheme(page: Page, theme: (typeof THEMES)[number]) {
  await page.emulateMedia({ colorScheme: theme });
  await page.addInitScript((value) => {
    localStorage.setItem('sacred-fire-songs-locale', 'en');
    const key = 'sacred-fire-songs-preferences';
    const prefs = JSON.parse(localStorage.getItem(key) || '{}');
    localStorage.setItem(key, JSON.stringify({ ...prefs, theme: value }));
  }, theme);
}

async function settle(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(500);
}

async function firstSongPath(page: Page): Promise<string> {
  await page.goto('/songs');
  const link = page.locator('a[href^="/songs/"]:not([href="/songs/add"])').first();
  await expect(link).toBeVisible();
  const href = await link.getAttribute('href');
  if (!href) throw new Error('No song link found');
  return href;
}

async function expectReadable(page: Page, where: string) {
  const results = await new AxeBuilder({ page })
    .withRules(['color-contrast'])
    .exclude('nextjs-portal') // Next.js dev-tools badge (dev server only)
    .analyze();
  const violations = results.violations.flatMap((v) =>
    v.nodes.map((n) => `${n.target.join(' ')} — ${n.any[0]?.message ?? v.help}`),
  );
  expect(violations, `${where}: color-contrast violations`).toEqual([]);

  const tooSmall = await page.evaluate((min) => {
    const out: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent?.trim()) continue;
      const el = n.parentElement;
      if (!el || el.closest('nextjs-portal, script, style, noscript')) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      if (parseFloat(cs.fontSize) < min) {
        out.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} ${cs.fontSize} "${n.textContent.trim().slice(0, 30)}"`);
      }
    }
    return out;
  }, MIN_PX);
  expect(tooSmall, `${where}: text below ${MIN_PX}px`).toEqual([]);
}

for (const theme of THEMES) {
  test.describe(`Readable labels, ${theme} @smoke`, () => {
    test.describe('guest', () => {
      test.beforeEach(({ page }) => setTheme(page, theme));

      for (const route of ['/', '/songs']) {
        test(`axe color-contrast on ${route} (${theme}, guest)`, async ({ page }) => {
          await page.goto(route);
          await settle(page);
          await expectReadable(page, `${route} guest ${theme}`);
        });
      }

      test(`axe color-contrast on a song page (${theme}, guest)`, async ({ page }) => {
        const href = await firstSongPath(page);
        await page.goto(href);
        await settle(page);
        await expectReadable(page, `${href} guest ${theme}`);
      });
    });

    test.describe('member', () => {
      test.use({ storageState: ROLES.member.storage });
      test.beforeEach(({ page }) => setTheme(page, theme));

      for (const route of ['/', '/songs', '/library']) {
        test(`axe color-contrast on ${route} (${theme}, member)`, async ({ page }) => {
          await page.goto(route);
          await settle(page);
          await expectReadable(page, `${route} member ${theme}`);
        });
      }

      test(`axe color-contrast on a song page (${theme}, member)`, async ({ page }) => {
        const href = await firstSongPath(page);
        await page.goto(href);
        await settle(page);
        await expectReadable(page, `${href} member ${theme}`);
      });
    });
  });
}
