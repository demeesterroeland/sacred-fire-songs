import { test, expect } from '@playwright/test';
import { ROLES } from '../fixtures/roles';

// #321: a logged-in user opening "New Playlist" was bounced to /auth/login
// (without next=) on the first render and from there to the home page.
test.describe('New Playlist auth guard', () => {
  test.describe('logged in', () => {
    test.use({ storageState: ROLES.member.storage });

    test('stays on /library/playlists/add and shows the name input', async ({ page }) => {
      await page.goto('/library/playlists/add');
      await expect(page.getByPlaceholder(/playlist name/i)).toBeVisible({ timeout: 10000 });
      // Give a late client-side redirect the chance to fire before asserting.
      await page.waitForTimeout(1500);
      await expect(page).toHaveURL(/\/library\/playlists\/add$/);
    });
  });

  test.describe('guest', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('sees the GuestGate whose Sign in carries next= back to the form', async ({ page }) => {
      await page.goto('/library/playlists/add');
      await expect(page).toHaveURL(/\/library\/playlists\/add$/);
      const gate = page.getByTestId('guest-gate');
      await expect(gate).toHaveAttribute('data-feature', 'newPlaylist');
      await expect(gate.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/auth/login?next=%2Flibrary%2Fplaylists%2Fadd');
    });
  });
});
