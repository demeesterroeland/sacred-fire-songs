import { test, expect, type Page } from '@playwright/test';
import en from '../../messages/en';
import { ROLES } from '../fixtures/roles';

/**
 * Issue #353 – @e2e scenarios of docs/testing/offline.feature. Service worker
 * decisions and the offline page's language choice are covered at @unit level
 * (testing/unit/tests/offlineFallback.test.ts); these journeys only prove the
 * pieces work together in a real browser.
 */

const songLink = (page: Page) => page.locator('a[href^="/songs/"]:not([href="/songs/add"])').first();

/** The offline fallback needs an active service worker that has stored the page. */
async function waitForServiceWorker(page: Page) {
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker.ready;
    return !!registration.active && !!navigator.serviceWorker.controller && !!(await caches.match('/offline.html'));
  });
}

test.describe('Offline navigation @offline', () => {
  test.use({ locale: 'en-US' });

  test('opening a song while offline shows the offline page until the connection is back', async ({ page, context }) => {
    await page.goto('/songs');
    await waitForServiceWorker(page);
    const href = await songLink(page).getAttribute('href');
    expect(href).toBeTruthy();

    await context.setOffline(true);
    // Client-side navigation, the path that fell back to the browser's error page.
    // Click a corner: the card's overlay link is covered by pills in the middle.
    await songLink(page).click({ position: { x: 4, y: 4 } });

    await expect(page.getByRole('heading', { name: en['offline.title'] })).toBeVisible();
    await expect(page).toHaveURL(href!);
    const retry = page.getByRole('button', { name: en['offline.retry'] });
    await expect(retry).toBeVisible();

    // Retry while still offline reloads into the offline page again (served by the service worker).
    await retry.click();
    await expect(page.getByRole('heading', { name: en['offline.title'] })).toBeVisible();

    // Back online: the page reloads itself on the `online` event and the song loads.
    await context.setOffline(false);
    await expect(page.getByRole('heading', { name: en['offline.title'] })).toHaveCount(0);
    await expect(page.locator('h1').first()).not.toBeEmpty();
  });

  test.describe('signed in', () => {
    test.use({ storageState: ROLES.member.storage });

    test('the session survives the offline page: still signed in after reconnecting', async ({ page, context }) => {
      await page.goto('/songs');
      const accountMenu = page.getByRole('button', { name: en['userMenu.trigger'] });
      await expect(accountMenu).toBeVisible();
      await waitForServiceWorker(page);

      await context.setOffline(true);
      await songLink(page).click({ position: { x: 4, y: 4 } });
      await expect(page.getByRole('heading', { name: en['offline.title'] })).toBeVisible();
      // The offline page is static: no account data, no sign-in UI.
      await expect(page.getByRole('link', { name: en['auth.login.submit'] })).toHaveCount(0);

      await context.setOffline(false);
      await expect(page.locator('h1').first()).not.toBeEmpty();
      await expect(accountMenu).toBeVisible();
      await expect(page.getByRole('link', { name: en['auth.login.submit'] })).toHaveCount(0);
    });
  });

  test('a song id that does not exist shows "not found", not a load error', async ({ page }) => {
    await page.goto('/songs/00000000-0000-4000-a000-000000000000');
    await expect(page.getByRole('heading', { name: en['feedback.notFound.title'] })).toBeVisible();
    await expect(page.getByText(en['song.error.loadFailed'])).toHaveCount(0);
  });
});
