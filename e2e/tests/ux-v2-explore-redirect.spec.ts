import { test, expect } from '@playwright/test';

/**
 * #574: old /explore links land on /songs with a permanent redirect, query string kept.
 * Gherkin: docs/testing/ux-v2-explore-redirect.feature (@e2e).
 */
test('/explore redirects permanently to /songs', async ({ request }) => {
  const res = await request.get('/explore', { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  expect(res.headers()['location']).toBe('/songs');
});

test('/explore keeps its query string', async ({ page, request }) => {
  const res = await request.get('/explore?category=ceremony', { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  expect(res.headers()['location']).toBe('/songs?category=ceremony');

  await page.goto('/explore?category=ceremony');
  await expect(page).toHaveURL(/\/songs\?category=ceremony$/);
});
