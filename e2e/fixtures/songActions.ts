import { expect, type Page } from '@playwright/test';

/**
 * Open the Practice drawer from a song page (Story 6.1.9 / G2.4, #393).
 * Phones: Practice in the sticky action bar. Desktop: the header button.
 */
export async function clickPractice(page: Page, timeout = 15_000) {
  const header = page.locator('button[title="Practice"]').first();
  const bar = page.getByTestId('song-action-practice');
  await Promise.race([
    header.waitFor({ state: 'visible', timeout }).catch(() => {}),
    bar.waitFor({ state: 'visible', timeout }).catch(() => {}),
  ]);
  if (await header.isVisible()) await header.click();
  else {
    await expect(bar).toBeVisible({ timeout: 5_000 });
    await bar.click();
  }
}
