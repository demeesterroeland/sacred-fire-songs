import { expect, type Page } from '@playwright/test';

/**
 * Open the Practice drawer from a song page (Story 6.1.9 / G2.4, #393).
 * Phones: Practice in the sticky action bar. Desktop: the header button.
 */
export async function clickPractice(page: Page, timeout = 15_000) {
  const header = page.getByTestId('song-header-practice');
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

/**
 * The Practice panel is still open: not hidden from assistive technology (`inert`) and on screen.
 * Closing is animated, so a bare visibility check right after a key press can pass on a panel that is
 * sliding away; `inert` flips as soon as it is told to close, hence the short settle first.
 */
export async function expectPracticeStaysOpen(page: Page) {
  const panel = page.getByTestId('practice-drawer');
  await page.waitForTimeout(500);
  await expect(panel).not.toHaveAttribute('inert', '');
  await expect(panel).toBeVisible();
}
