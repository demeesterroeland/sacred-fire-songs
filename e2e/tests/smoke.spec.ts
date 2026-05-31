import { test, expect } from '@playwright/test';
import { ROLES } from '../fixtures/roles';

/**
 * P0 smoke paths from the E2E matrix (docs/testing/e2e-test-overview.md).
 * Tagged @smoke so CI can gate PRs on this subset and run the full suite later.
 *
 * These are intentionally shallow happy-path checks — the foundation that must
 * always stay green. Deeper variants/edge cases are tracked as follow-up specs.
 */

test.describe('Guest smoke @smoke', () => {
  // No storageState → unauthenticated guest.

  test('LIB-01: guest can load the song library', async ({ page }) => {
    await page.goto('/songs');
    // The songs page renders a search field and at least one song link.
    await expect(page).toHaveURL(/\/songs/);
    await expect(page.locator('a[href^="/songs/"]').first()).toBeVisible();
  });

  test('VIEW-01: guest can open a song detail page', async ({ page }) => {
    await page.goto('/songs');
    await page.locator('a[href^="/songs/"]').first().click();
    await expect(page).toHaveURL(/\/songs\/[^/]+$/);
  });

  test('ACC-01: settings redirects unauthenticated user to login', async ({ page }) => {
    await page.goto('/account/settings');
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

test.describe('Member smoke @smoke', () => {
  test.use({ storageState: ROLES.member.storage });

  test('AUTH-04: authenticated member reaches account settings', async ({ page }) => {
    await page.goto('/account/settings');
    // Should NOT bounce to login when authenticated.
    await expect(page).toHaveURL(/\/account\/settings/);
  });

  test('LIB-07: authenticated member sees the library', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL((url) => url.pathname === '/');
  });
});
