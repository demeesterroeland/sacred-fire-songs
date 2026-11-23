import { test, expect } from '@playwright/test';
import { ROLES } from '../fixtures/roles';

/** Cross-review of validation rounds 2 and 3: what only a real browser can measure. */
test.use({ viewport: { width: 390, height: 844 } });

test.describe('member', () => {
  test.use({ storageState: ROLES.member.storage });

  for (const locale of ['en', 'nl', 'es', 'it', 'ru', 'qu', 'fr', 'pt']) {
    test(`${locale}: every Your library label stays inside its cell at 390 px`, async ({ page }) => {
      await page.addInitScript((l) => localStorage.setItem('sacred-fire-songs-locale', l), locale);
      await page.goto('/');
      const cells = page.locator('a:has(p.text-caption)');
      await expect(cells.first()).toBeVisible();
      const over = await cells.evaluateAll((els) =>
        els.filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => el.textContent),
      );
      expect(over).toEqual([]);
    });
  }

  test('the playlist menu button is at least 44 px', async ({ page }) => {
    await page.goto('/library/playlists');
    const button = page.getByRole('button', { name: /options/i }).first();
    await expect(button).toBeVisible();
    const box = await button.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});
