import { test, expect } from '@playwright/test';

/**
 * Story 6.1.4 / G1.4 (#388): calm category grid, every link a 44 px target.
 * Gherkin: docs/testing/ux-v2-calm-categories.feature (@e2e).
 */
test.use({ viewport: { width: 390, height: 844 }, storageState: { cookies: [], origins: [] } });

test('Category links are easy to tap on a phone', async ({ page }) => {
  await page.goto('/');
  const grid = page.getByTestId('category-grid');
  await expect(grid).toBeVisible();
  const links = grid.locator('a:visible, button:visible');
  await expect(links.first()).toBeVisible();
  const count = await links.count();
  expect(count).toBeGreaterThan(3);
  for (let i = 0; i < count; i++) {
    const box = await links.nth(i).boundingBox();
    expect(box?.height ?? 0, `link ${i}`).toBeGreaterThanOrEqual(44);
  }
});
