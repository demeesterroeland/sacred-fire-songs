import { test, expect, type Page } from '@playwright/test';
import { ROLES } from '../fixtures/roles';
import { clickPractice } from '../fixtures/songActions';

/**
 * Story 6.1.20 / G4.7 (#404): level meter, optional count-in and remaining time in the
 * Practice recorder. Gherkin: docs/testing/ux-v2-recording-meter.feature (@e2e).
 *
 * Chromium's fake microphone (a repeating beep) feeds the meter. Nothing is saved:
 * every test discards its take, so no rows are written.
 */
test.use({
  storageState: ROLES.member.storage,
  viewport: { width: 390, height: 844 },
  permissions: ['microphone'],
  launchOptions: {
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  },
});
test.describe.configure({ timeout: 90_000 });

async function openRecorder(page: Page) {
  await page.goto('/songs');
  const link = page.locator('a[href^="/songs/"]:not([href="/songs/add"])').first();
  await expect(link).toBeVisible({ timeout: 15_000 });
  const href = await link.getAttribute('href');
  await page.goto(href!);
  // The first tap can land before the page hydrates: tap again until the drawer is open.
  const title = page.getByTestId('practice-drawer');
  await expect(async () => {
    if (!(await title.isVisible())) await clickPractice(page, 5_000);
    await expect(title).toBeVisible({ timeout: 2_500 });
  }).toPass({ timeout: 20_000 });
  // The drawer slides in and hydrates: click the Record tab until the recorder shows.
  const recordTab = page.locator('[data-testid="practice-tab-record"]');
  const ready = page.getByText('Ready to record');
  await expect(async () => {
    if (await recordTab.count()) await recordTab.first().click({ force: true });
    await expect(ready).toBeVisible({ timeout: 1_500 });
  }).toPass({ timeout: 15_000 });
}

test('count-in is optional, in words, a 44 px target, and states the limit @ux-v2', async ({ page }) => {
  await openRecorder(page);
  await expect(page.getByText('Maximum take length: 3 minutes')).toBeVisible();
  const toggle = page.getByRole('switch', { name: 'Count in 3-2-1 before recording' });
  await expect(toggle).toBeChecked();
  const box = await toggle.locator('xpath=ancestor::label').boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await toggle.uncheck();
  await expect(toggle).not.toBeChecked();
});

test('count-in on: 3-2-1 is announced while the meter already listens, then recording starts @ux-v2', async ({ page }) => {
  await openRecorder(page);
  await page.locator('button[title="Start recording"]').click();
  await expect(page.getByRole('status').filter({ hasText: /^Starting in \d$/ })).toBeVisible();
  await expect(page.getByRole('meter', { name: 'Input level' })).toBeVisible();
  await expect(page.getByText('Recording...')).toBeVisible({ timeout: 8_000 });
  await page.locator('button[title="Cancel and discard"]').click();
  await expect(page.getByText('Ready to record')).toBeVisible();
});

test('count-in off: recording starts at once; the meter moves with the input @ux-v2', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openRecorder(page);
  await page.getByRole('switch', { name: 'Count in 3-2-1 before recording' }).uncheck();
  await page.locator('button[title="Start recording"]').click();
  await expect(page.getByText('Recording...')).toBeVisible({ timeout: 3_000 });

  const meter = page.getByRole('meter', { name: 'Input level' });
  await expect(meter).toBeVisible();
  // Sample for 4 s: the fake device beeps, so the level rises above 0 and the bars grow taller.
  const seen = await page.evaluate(async () => {
    const el = document.querySelector('[data-testid="recorder-level-meter"]')!;
    let maxLevel = 0;
    let maxBar = 0;
    for (let i = 0; i < 40; i++) {
      maxLevel = Math.max(maxLevel, Number(el.getAttribute('data-level')));
      el.querySelectorAll<HTMLElement>('[data-bar]').forEach((b) => {
        maxBar = Math.max(maxBar, parseFloat(b.style.height));
      });
      await new Promise((r) => setTimeout(r, 100));
    }
    return { maxLevel, maxBar };
  });
  expect(seen.maxLevel).toBeGreaterThan(0);
  expect(seen.maxBar).toBeGreaterThan(8);

  // Reduced motion: no transition on the bars, no pulsing icon.
  const motion = await page.evaluate(() => {
    const bar = document.querySelector<HTMLElement>('[data-testid="recorder-level-meter"] [data-bar]')!;
    const icon = document.querySelector<SVGElement>('h3 svg')!;
    return { transition: getComputedStyle(bar).transitionDuration, animation: getComputedStyle(icon).animationName };
  });
  expect(parseFloat(motion.transition)).toBeLessThan(0.001); // global reduced-motion rule: ~0 s
  expect(motion.animation).toBe('none');

  // The no-sound hint stays away while sound is heard.
  await expect(page.getByText(/No sound yet/)).toHaveCount(0);
  await page.locator('button[title="Cancel and discard"]').click();
});

test('time left shows in the last minute; auto-stop leads to a review with Save as the single primary @ux-v2', async ({ page }) => {
  await openRecorder(page);
  await page.getByRole('switch', { name: 'Count in 3-2-1 before recording' }).uncheck();
  // The e2e flag runs the recorder clock 100x faster (see AudioRecorder).
  await page.evaluate(() => {
    (window as unknown as { __E2E_FAST_TIMER__: boolean }).__E2E_FAST_TIMER__ = true;
    const w = window as unknown as { __left: string[] };
    w.__left = [];
    new MutationObserver(() => {
      const el = document.querySelector('[data-testid="recorder-time-left"]');
      const text = el?.textContent?.trim();
      if (text && w.__left[w.__left.length - 1] !== text) w.__left.push(text);
    }).observe(document.body, { subtree: true, childList: true, characterData: true });
  });
  await page.locator('button[title="Start recording"]').click();
  await expect(page.getByText('Review your take')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('03:00')).toBeVisible();

  const left = await page.evaluate(() => (window as unknown as { __left: string[] }).__left);
  expect(left.length).toBeGreaterThan(0);
  for (const text of left) expect(text).toMatch(/^[01]:\d\d left$/);
  expect(left[0]).toMatch(/^(1:00|0:\d\d) left$/);

  // Review: Save is the full-width primary, Discard a text button below it, both 44 px high.
  const save = page.getByRole('button', { name: 'Save Take' });
  const discard = page.getByRole('button', { name: 'Discard' });
  const [s, d] = [await save.boundingBox(), await discard.boundingBox()];
  expect(s!.width).toBeGreaterThan(280);
  expect(s!.height).toBeGreaterThanOrEqual(44);
  expect(d!.height).toBeGreaterThanOrEqual(44);
  expect(d!.y).toBeGreaterThan(s!.y);
  expect(Math.abs(d!.width - s!.width)).toBeLessThan(2);
  const [saveBg, discardBg] = await Promise.all([
    save.evaluate((el) => getComputedStyle(el).backgroundColor),
    discard.evaluate((el) => getComputedStyle(el).backgroundColor),
  ]);
  expect(saveBg).not.toBe('rgba(0, 0, 0, 0)');
  expect(discardBg).toBe('rgba(0, 0, 0, 0)');

  await discard.click();
  await expect(page.getByText('Ready to record')).toBeVisible();
});
