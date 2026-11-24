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

/**
 * Open the Practice drawer on its Record tab (#544). The drawer slides up with a spring: a click on
 * the tab while it is still below the fold fails with "Element is outside of the viewport", so wait
 * until the panel has settled on screen first. A song without reference tracks opens on Record and
 * has no tab bar.
 */
export async function openPracticeRecordTab(page: Page) {
  await clickPractice(page);
  const drawer = page.getByTestId('practice-drawer');
  await expect(drawer).toBeVisible({ timeout: 10_000 });
  await expect
    .poll(async () => {
      const box = await drawer.boundingBox();
      return box ? box.y + box.height : Infinity;
    })
    .toBeLessThanOrEqual(page.viewportSize()!.height + 1);
  const recordTab = page.locator('[data-testid="practice-tab-record"]');
  if (await recordTab.count()) await recordTab.first().click({ force: true });
}
