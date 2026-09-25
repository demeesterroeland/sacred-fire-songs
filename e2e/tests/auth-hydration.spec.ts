import { test, expect } from '@playwright/test';
import { ROLES } from '../fixtures/roles';

test.describe('Auth Hydration FOIC', () => {
  // Use a seeded authenticated session
  test.use({ storageState: ROLES.member.storage });

  test('does not flash "Sign In" button on heavy pages when authenticated', async ({ page }) => {
    // Navigate to a page and commit (do not wait for full load to catch the flash)
    // The flash happens during initial hydration before JS evaluates fully
    const responsePromise = page.waitForResponse(r => r.url().includes('/songs'));
    await page.goto('/songs', { waitUntil: 'commit' });

    // Assert that the "Sign In" link is not visible at any point during load
    // If there is a flash, it will be in the DOM initially
    await expect(page.getByRole('link', { name: 'Sign In', exact: true })).not.toBeVisible();

    // Verify the page eventually settles to show the profile button
    // The profile button has an image or a gradient fallback with initials
    await expect(page.locator('.relative > button.rounded-full')).toBeVisible({ timeout: 10000 });
  });
});
