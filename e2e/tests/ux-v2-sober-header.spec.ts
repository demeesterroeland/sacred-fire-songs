// Story 6.1.35 (#485), group 4 — docs/testing/ux-v2-sober-header.feature, "The user menu and the notifications stay
// readable in light and dark mode": axe colour-contrast on the header, the open user menu and the open notification
// list, as a member, light and dark. Read-only: nothing is saved.
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

/** Wait until no CSS animation or transition runs inside `selector` (menus fade and zoom in). */
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

test.describe('sober header, user menu and notifications', () => {
  test.use({ storageState: ROLES.member.storage });
  test.describe.configure({ timeout: 60_000 });

  for (const theme of THEMES) {
    test(`header, user menu and notifications are readable (${theme})`, async ({ page }) => {
      await setTheme(page, theme);
      await page.goto('/songs');
      if (theme === 'dark') await expect(page.locator('html')).toHaveClass(/\bdark\b/);
      else await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);

      await expect(page.locator('#app-navbar')).toBeVisible();
      await contrast(page, '#app-navbar', `header (${theme})`);

      // User menu: the chosen theme is the one pressed button.
      const trigger = page.getByRole('button', { name: 'Account menu' });
      await expect(async () => {
        if (!(await page.getByTestId('user-menu').isVisible())) await trigger.click();
        await expect(page.getByTestId('user-menu')).toBeVisible({ timeout: 2_000 });
      }).toPass({ timeout: 15_000 });
      const menu = page.getByTestId('user-menu');
      const themeName = theme === 'dark' ? 'Dark' : 'Light';
      await expect(menu.getByRole('button', { name: themeName })).toHaveAttribute('aria-pressed', 'true');
      await expect(menu.locator('button[aria-pressed="true"]')).toHaveCount(1);
      await contrast(page, '[data-testid="user-menu"]', `user menu (${theme})`);
      // The trigger toggles the menu closed.
      await trigger.click();
      await expect(menu).toBeHidden();

      // Notifications: the list opens from the bell.
      const bell = page.getByRole('button', { name: /^Notifications/ });
      await bell.click();
      const list = page.getByRole('menu').filter({ hasText: 'Notifications' });
      await expect(list).toBeVisible();
      // The member may have no notifications: then only the empty state is measured (unread rows are covered
      // by the unit tests in testing/unit/tests/design/soberHeader.test.tsx).
      const id = await list.getAttribute('id');
      await contrast(page, `[id="${id}"]`, `notifications (${theme})`);
    });
  }
});
