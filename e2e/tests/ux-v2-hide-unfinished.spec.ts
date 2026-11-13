import { test, expect } from '@playwright/test';
import { ROLES } from '../fixtures/roles';

/**
 * Story 6.1.5 / G1.5 (#389): no "Coming soon" placeholder in Library, Account Settings or the song form.
 * Gherkin: docs/testing/ux-v2-hide-unfinished.feature (@e2e).
 */
test.use({ viewport: { width: 390, height: 844 }, storageState: ROLES.member.storage });

const LOCALE_KEY = 'sacred-fire-songs-locale';
const pinEnglish = (page: import('@playwright/test').Page) =>
  page.addInitScript(([k, v]) => localStorage.setItem(k, v), [LOCALE_KEY, 'en']);
const COMING_SOON = /coming soon|will be available soon|not yet active/i;

test('Library shows no "Coming soon" element', async ({ page }) => {
  await pinEnglish(page);
  for (const path of ['/library/playlists', '/library/recently-viewed', '/library/artists']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await expect(page.getByText(COMING_SOON)).toHaveCount(0);
  }
});

test('Account Settings: no Privacy & Data tab, no avatar block, no placeholder rows', async ({ page }) => {
  await pinEnglish(page);
  await page.goto('/account/settings');
  const tabs = page.getByRole('button', { name: /^(Profile|Security|Preferences|Privacy)/ });
  await expect(tabs).toHaveCount(3);
  await expect(page.getByRole('button', { name: /Privacy/ })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Avatar' })).toHaveCount(0);
  await expect(page.getByText(COMING_SOON)).toHaveCount(0);

  await page.getByRole('button', { name: /Preferences/ }).click();
  await expect(page.getByText('Keep Screen Awake')).toBeVisible();
  await expect(page.getByText(/Auto-scroll|Offline mode/i)).toHaveCount(0);
  await expect(page.getByText(COMING_SOON)).toHaveCount(0);
});

test('a hidden ?tab=privacy deep link opens Profile', async ({ page }) => {
  await pinEnglish(page);
  await page.goto('/account/settings?tab=privacy');
  await expect(page.getByLabel(/display name/i)).toBeVisible();
  await expect(page.getByText('Privacy Settings')).toHaveCount(0);
});

test('Add song form has no "Melody notation (Coming soon)" section', async ({ page }) => {
  await pinEnglish(page);
  await page.goto('/songs/add');
  await expect(page.getByRole('button', { name: /^save|publish/i }).first()).toBeVisible();
  await expect(page.getByText(COMING_SOON)).toHaveCount(0);
  await expect(page.getByText(/melody notation/i)).toHaveCount(0);
});
