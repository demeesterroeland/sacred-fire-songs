// Story 6.1.35 (#485), group 5 — docs/testing/ux-v2-sober-account.feature, "Account settings tabs stay readable in
// light and dark mode": axe colour-contrast on Profile, Security and Preferences in /account/settings, as a member,
// light and dark. Read-only: nothing is saved.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ROLES } from '../fixtures/roles';

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

async function settled(page: Page, selector: string) {
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await expect
    .poll(() => page.evaluate((sel) => document.querySelector(sel)?.getAnimations({ subtree: true }).length ?? 0, selector))
    .toBe(0);
}

async function contrast(page: Page, selector: string, where: string) {
  await settled(page, selector);
  const results = await new AxeBuilder({ page }).include(selector).withRules(['color-contrast']).analyze();
  const found = results.violations.flatMap((v) => v.nodes.map((n) => `${n.target.join(' ')}: ${n.failureSummary}`));
  expect(found, `${where}: colour-contrast violations`).toEqual([]);
}

test.describe('sober account settings', () => {
  test.use({ storageState: ROLES.member.storage });
  test.describe.configure({ timeout: 60_000 });

  for (const theme of THEMES) {
    test(`account settings tabs are readable (${theme})`, async ({ page }) => {
      await setTheme(page, theme);
      await page.goto('/account/settings');
      if (theme === 'dark') await expect(page.locator('html')).toHaveClass(/\bdark\b/);
      else await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);

      await expect(page.getByRole('heading', { name: 'Account Settings' })).toBeVisible();

      // Profile tab (default)
      const profileTab = page.getByRole('button', { name: 'Profile', exact: true });
      await expect(profileTab).toHaveAttribute('aria-pressed', 'true');
      await contrast(page, 'main', `Profile tab (${theme})`);

      // Security tab
      const securityTab = page.getByRole('button', { name: 'Security', exact: true });
      await securityTab.click();
      await expect(securityTab).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByRole('heading', { name: 'Change Password' })).toBeVisible();
      await contrast(page, 'main', `Security tab (${theme})`);

      // Preferences tab
      const prefsTab = page.getByRole('button', { name: 'Preferences', exact: true });
      await prefsTab.click();
      await expect(prefsTab).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByRole('heading', { name: 'App Preferences' })).toBeVisible();
      const themeName = theme === 'dark' ? 'Dark' : 'Light';
      await expect(page.locator('main').getByRole('button', { name: themeName })).toHaveAttribute('aria-pressed', 'true');
      await contrast(page, 'main', `Preferences tab (${theme})`);
    });
  }
});
