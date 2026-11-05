import { test, expect } from '@playwright/test';
import { ROLES } from '../fixtures/roles';

/**
 * Story 6.1.23 / G5.2 (#407): the Library tab row fits a phone and has no dead tab.
 * Gherkin: docs/testing/ux-v2-library-tabs.feature (@e2e).
 */
test.use({ viewport: { width: 390, height: 844 }, storageState: ROLES.member.storage });

test('Library tabs on a phone: every label visible, no "Coming soon" tab', async ({ page }) => {
  await page.goto('/library/playlists');
  const tabs = page.getByRole('navigation', { name: 'Library' }).getByRole('link');
  await expect(tabs).toHaveCount(3);
  await expect(page.locator('a[href="/library/albums"]')).toHaveCount(0);

  const vw = page.viewportSize()!.width;
  for (const tab of await tabs.all()) {
    const box = (await tab.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(vw);
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(await tab.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  }

  for (const href of await tabs.evaluateAll((els) => els.map((el) => el.getAttribute('href')!))) {
    await page.goto(href);
    await expect(page.getByText(/coming soon/i)).toHaveCount(0);
  }
});

test('the hidden Albums route renders the not-found page', async ({ page }) => {
  // The route streams (app/loading.tsx), so Next keeps HTTP 200 but renders the
  // not-found UI with a noindex robots tag (node_modules/next/dist/docs, not-found.md).
  await page.goto('/library/albums');
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
  await expect(page.getByText(/liked albums|coming soon/i)).toHaveCount(0);
});
