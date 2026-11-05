import { test, expect } from '@playwright/test';
import { ROLES, passwordFor } from '../fixtures/roles';

// Story 6.1.27 / G6.2 (#411) — docs/testing/ux-v2-guest-draft.feature
// A guest on Add Song sees before typing that saving needs an account; the draft
// stays in localStorage, so signing in from the banner brings them back to a filled form.
test.describe('Guest draft on Add Song', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('guest drafts a song, signs in from the banner and keeps the draft', async ({ page }) => {
    await page.goto('/songs/add');

    const banner = page.getByTestId('guest-draft-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Draft now — sign in to save');
    await expect(banner).toContainText('Saving a song needs an account');

    const title = 'Draft fire song ' + Date.now();
    const lyrics = '[Dm]Abre tus alas';
    await page.locator('#title').fill(title);
    await page.locator('form textarea').first().fill(lyrics);
    // The draft is written on every change.
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('song-form-draft') ?? ''))
      .toContain(title);

    const signIn = banner.getByRole('link', { name: 'Sign in' });
    await expect(signIn).toHaveAttribute('href', `/auth/login?next=${encodeURIComponent('/songs/add')}`);
    const box = await signIn.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    await signIn.click();

    await page.waitForURL((url) => url.pathname === '/auth/login');
    await page.getByRole('button', { name: 'Sign in with password' }).click();
    await page.locator('#email').fill(ROLES.member.email);
    await page.locator('#password').fill(passwordFor('member'));
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    await page.waitForURL((url) => url.pathname === '/songs/add');
    await expect(page.getByTestId('guest-draft-banner')).toHaveCount(0);
    await expect(page.locator('#title')).toHaveValue(title);
    await expect(page.locator('form textarea').first()).toHaveValue(lyrics);

    // Leave no draft behind for other specs.
    await page.evaluate(() => localStorage.removeItem('song-form-draft'));
  });
});
