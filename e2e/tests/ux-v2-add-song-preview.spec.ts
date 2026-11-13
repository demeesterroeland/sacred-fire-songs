import { test, expect } from '@playwright/test';
import { ROLES } from '../fixtures/roles';

/**
 * Story 6.1.31 / G8.2 (#415): live chord preview and a visible upload button on Add Song.
 * Gherkin: docs/testing/ux-v2-add-song-preview.feature (@e2e).
 */
test.use({ viewport: { width: 390, height: 844 }, storageState: ROLES.member.storage });

const LOCALE_KEY = 'sacred-fire-songs-locale';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(([k, v]) => localStorage.setItem(k, v), [LOCALE_KEY, 'en']);
});

// A failing test must not leave its draft in the shared storage state.
test.afterEach(async ({ page }) => {
  await page.evaluate(() => localStorage.removeItem('song-form-draft')).catch(() => {});
});

test('preview while typing: the chord is rendered above its word, the box does not jump @story-6.1.31', async ({ page }) => {
  await page.goto('/songs/add');
  const box = page.getByTestId('lyrics-box');
  await page.locator('form textarea').first().fill('[Dm]Abre tus alas');

  const pageTop = () => box.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const before = await box.boundingBox();
  const topBefore = await pageTop();
  const toggle = page.getByRole('button', { name: 'Preview' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');

  const preview = page.getByTestId('song-form-preview');
  const chord = preview.getByTestId('chord');
  await expect(chord).toHaveText('Dm');
  const lyric = preview.getByTestId('lyric').first();
  await expect(lyric).toContainText('Abre');
  const c = await chord.boundingBox();
  const l = await lyric.boundingBox();
  expect(c!.y + c!.height).toBeLessThanOrEqual(l!.y + 1);
  expect(Math.abs(c!.x - l!.x)).toBeLessThan(2);

  // Same box, same size: nothing below it moves.
  const after = await box.boundingBox();
  expect(after!.height).toBe(before!.height);
  expect(await pageTop()).toBe(topBefore);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  // Back to editing keeps the text.
  await toggle.click();
  await expect(preview).toHaveCount(0);
  await expect(page.locator('form textarea').first()).toHaveValue('[Dm]Abre tus alas');
});

test('Upload .cho / .txt is visible without opening anything, at least 44 px tall, and fills the form @story-6.1.31', async ({ page }) => {
  await page.goto('/songs/add');
  const upload = page.getByRole('button', { name: 'Upload .cho / .txt' });
  await expect(upload).toBeVisible();
  const b = await upload.boundingBox();
  expect(b!.height).toBeGreaterThanOrEqual(44);

  await page.getByTestId('song-file-input').setInputFiles({
    name: 'song.cho',
    mimeType: 'text/plain',
    buffer: Buffer.from('{title: Fire Song}\n{artist: Anon}\n[Am]Hello [G]fire\n'),
  });
  await expect(page.locator('#title')).toHaveValue('Fire Song');
  await expect(page.locator('form textarea').first()).toHaveValue(/\[Am\]Hello \[G\]fire/);

  await page.getByRole('button', { name: 'Preview' }).click();
  await expect(page.getByTestId('song-form-preview').getByTestId('chord').first()).toHaveText('Am');
});

test('melody notation stays hidden @story-6.1.31', async ({ page }) => {
  await page.goto('/songs/add');
  await expect(page.getByText('Melody notation')).toHaveCount(0);
});

for (const locale of ['en', 'ru', 'fr']) {
  test(`Preview and Upload share one row at 390 px in ${locale} @story-6.1.31`, async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: LOCALE_KEY, value: locale, url: baseURL! }]);
    await page.addInitScript(([k, v]) => localStorage.setItem(k, v), [LOCALE_KEY, locale]);
    await page.goto('/songs/add');
    const buttons = page.getByTestId('lyrics-tools').getByRole('button');
    await expect(buttons).toHaveCount(2);
    await buttons.first().scrollIntoViewIfNeeded();
    // Measure both buttons in one frame: two separate boundingBox() calls can
    // straddle a layout shift above the row (page fade-in, hydration) and
    // report a false offset. Poll until the row has settled.
    const measure = () =>
      buttons.evaluateAll((els) =>
        els.map((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height };
        }),
      );
    await expect.poll(async () => {
      const [first, second] = await measure();
      return Math.abs(first.y - second.y);
    }).toBeLessThanOrEqual(2);
    const [a, b] = await measure();
    expect(Math.abs(a!.y - b!.y)).toBeLessThanOrEqual(2);
    expect(Math.abs(a!.height - b!.height)).toBeLessThanOrEqual(2);
    expect(a!.height).toBeGreaterThanOrEqual(44);
    expect(b!.height).toBeGreaterThanOrEqual(44);
    expect(a!.x + a!.width).toBeLessThanOrEqual(b!.x + 1);
    expect(b!.x + b!.width).toBeLessThanOrEqual(390);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
