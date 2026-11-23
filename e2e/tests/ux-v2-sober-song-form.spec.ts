// Story 6.1.35 (#485), group 7 — docs/testing/ux-v2-sober-song-form.feature, "Add Song stays readable in light and
// dark mode": axe colour-contrast on the Add Song form with every section open, as a member, light and dark.
// Read-only: nothing is saved.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ROLES } from '../fixtures/roles';

const THEMES = ['light', 'dark'] as const;

test.use({ storageState: ROLES.member.storage });

async function setTheme(page: Page, theme: (typeof THEMES)[number]) {
  await page.emulateMedia({ colorScheme: theme });
  await page.addInitScript((value) => {
    localStorage.setItem('sacred-fire-songs-locale', 'en');
    const key = 'sacred-fire-songs-preferences';
    const prefs = JSON.parse(localStorage.getItem(key) || '{}');
    localStorage.setItem(key, JSON.stringify({ ...prefs, theme: value }));
  }, theme);
}

test.afterEach(async ({ page }) => {
  await page.evaluate(() => localStorage.removeItem('song-form-draft')).catch(() => {});
});

for (const theme of THEMES) {
  test(`Add Song form is readable (${theme}) @story-6.1.35`, async ({ page }) => {
    await setTheme(page, theme);
    await page.goto('/songs/add');
    if (theme === 'dark') await expect(page.locator('html')).toHaveClass(/\bdark\b/);
    else await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);

    const form = page.locator('form').first();
    await expect(form).toBeVisible();
    await form.evaluate((el) => el.querySelectorAll('details').forEach((d) => { d.open = true; }));
    await expect(form.getByRole('button', { name: 'Publish Song' })).toBeVisible();
    await page.evaluate(() => document.fonts.ready.then(() => undefined));

    const results = await new AxeBuilder({ page }).include('form').withRules(['color-contrast']).analyze();
    const violations = results.violations.flatMap((v) => v.nodes.map((n) => `${n.target.join(' ')}: ${n.failureSummary}`));
    expect(violations, `Add Song (${theme}): colour-contrast violations`).toEqual([]);
  });
}
