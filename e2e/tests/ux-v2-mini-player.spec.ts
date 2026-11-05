import { test, expect, type Page } from '@playwright/test';
import { ROLES } from '../fixtures/roles';

/**
 * Story 6.1.12 / G3.1 (#396), UXD-5: the mini player appears only after play.
 * Gherkin: docs/testing/ux-v2-mini-player.feature (@e2e).
 *
 * Uses a real take (uploaded from the dummy WAV, removed at the end; the global
 * teardown also removes leftovers whose name matches `E2E Practice - <ts>`).
 */
test.use({ storageState: ROLES.member.storage, viewport: { width: 390, height: 844 } });
test.describe.configure({ timeout: 90_000 });

async function songLinks(page: Page): Promise<string[]> {
  await page.goto('/songs');
  const links = page.locator('a[href^="/songs/"]:not([href="/songs/add"])');
  await expect(links.first()).toBeVisible();
  const hrefs = await links.evaluateAll((els) => els.map((e) => e.getAttribute('href') as string));
  return [...new Set(hrefs)];
}

async function openPractice(page: Page) {
  await page.locator('button[aria-label="More actions"]').first().click();
  await page.locator('button:has-text("Practice")').filter({ visible: true }).first().click();
  await expect(page.locator('h3:has-text("Practice")')).toBeVisible({ timeout: 10_000 });
  // Wait for the slide-in to finish: the drawer body ends inside the viewport.
  const body = page.getByTestId('rehearsal-drawer-body');
  await expect
    .poll(async () => {
      const box = await body.boundingBox();
      return box ? box.y + box.height : Infinity;
    })
    .toBeLessThanOrEqual(page.viewportSize()!.height + 1);
}

test('a playing take shows the bar, never covers the last row, and does not follow to another song', async ({ page }) => {
  const [songA, songB] = await songLinks(page);
  test.skip(!songA || !songB, 'needs two seeded songs');

  // Open song A from the list (client-side navigation keeps the global audio provider alive).
  // The card link is an invisible overlay under the tag chips: dispatch the click (Next's Link navigates client-side).
  await page.locator(`a[href="${songA}"]`).first().dispatchEvent('click');
  await expect(page).toHaveURL(new RegExp(`${songA}$`));
  await page.waitForLoadState('networkidle');
  // Fresh song page: no bar, nothing reserved.
  await expect(page.getByTestId('bottom-mini-player')).toHaveCount(0);

  await openPractice(page);
  await page.locator('[data-testid="practice-tab-record"]').first().click({ force: true });
  await page.getByRole('button', { name: 'Upload File' }).click({ force: true });
  const chooser = page.waitForEvent('filechooser');
  await page.locator('text=Click to select an audio file').click();
  await (await chooser).setFiles('e2e/fixtures/dummy-audio.wav');
  const name = `E2E Practice - ${Date.now()}`;
  // From here on a take may exist: the finally block always removes it.
  try {
    await page.locator('input[placeholder="Take Name (e.g. Take 1)"]').fill(name);
    await page.locator('button:has-text("Save Take")').click();
    const take = page.locator(`h4:has-text("${name}")`);
    await expect(take).toBeVisible({ timeout: 15_000 });
    // Saving a take is not "play": the bar is still hidden.
    await expect(page.getByTestId('bottom-mini-player')).toHaveCount(0);

    const row = take.locator('xpath=ancestor::div[contains(@class, "group")][1]');
    await row.locator('button[title="Play"]').click();
    const bar = page.getByTestId('bottom-mini-player');
    await expect(bar).toBeVisible({ timeout: 5000 });

    // Scrolled to the end, the last row of the drawer ends above the bar.
    const body = page.getByTestId('rehearsal-drawer-body');
    await body.evaluate((el) => { el.scrollTop = el.scrollHeight; });
    await expect
      .poll(async () => {
        const barTop = (await bar.boundingBox())!.y;
        const lastBottom = await body.evaluate((el) => {
          const visible = [...el.querySelectorAll('div.group')].filter((n) => (n as HTMLElement).offsetHeight > 0);
          const last = visible[visible.length - 1] ?? el.lastElementChild!;
          return last.getBoundingClientRect().bottom;
        });
        return barTop - lastBottom;
      })
      .toBeGreaterThanOrEqual(0);

    // Leave the song through the app (client-side): the take of song A does not show a bar on song B.
    await page.locator('button[aria-label="Close"]').first().click();
    await expect(bar).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/\/songs$/);
    await page.locator(`a[href="${songB}"]`).first().dispatchEvent('click');
    await expect(page).toHaveURL(new RegExp(`${songB}$`));
    await expect(page.getByTestId('rehearsal-drawer-body')).toHaveCount(0);
    await expect(page.getByTestId('bottom-mini-player')).toHaveCount(0);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue('--mini-player-h')))
      .toBe('');
  } finally {
    // Remove the take again (back on song A).
    await page.goto(songA);
    await openPractice(page);
    await page.locator('[data-testid="practice-tab-record"]').first().click({ force: true });
    const leftover = page.locator(`h4:has-text("${name}")`);
    if (await leftover.count()) {
      const row = leftover.locator('xpath=ancestor::div[contains(@class, "group")][1]');
      await row.locator('button[aria-label="More actions"]').click();
      await page.getByRole('dialog').getByRole('button', { name: 'Delete take', exact: true }).click();
      await page.getByRole('button', { name: 'Yes, delete' }).click();
      await expect(leftover).toHaveCount(0, { timeout: 10_000 });
    }
  }
});
