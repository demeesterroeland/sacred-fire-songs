import { test, expect } from '@playwright/test';
import pg from 'pg';

/**
 * Story 6.1.25 / G5.4 (#409): auth pages have no fake ✕; "Back" returns to the page the
 * guest came from, else Home. Gherkin: docs/testing/ux-v2-auth-back.feature (@e2e).
 * Seeded ids change on reseed, so the spec looks up a public song.
 */
test.use({ storageState: { cookies: [], origins: [] }, viewport: { width: 390, height: 844 } });

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
let songPath = '';

test.beforeAll(async () => {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    const { rows } = await client.query<{ id: string }>(
      'SELECT id FROM public.compositions WHERE is_public = true ORDER BY title LIMIT 1'
    );
    if (!rows[0]) throw new Error('No public song seeded');
    songPath = `/songs/${rows[0].id}`;
  } finally {
    await client.end();
  }
});

test.describe('Auth pages: an honest way back', () => {
  test('login: no ✕, Back returns to the song the guest came from', async ({ page }) => {
    await page.goto(`/auth/login?next=${encodeURIComponent(songPath)}`);
    await expect(page.getByRole('button', { name: /close/i })).toHaveCount(0);
    const back = page.getByTestId('auth-back');
    await expect(back).toHaveText('Back');
    await expect(back).toHaveAttribute('href', songPath);
    const box = await back.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    await back.click();
    await page.waitForURL((url) => url.pathname === songPath);
  });

  test('login without next: Back leads Home', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByTestId('auth-back')).toHaveAttribute('href', '/');
  });

  test('login with a hostile next: Back leads Home', async ({ page }) => {
    await page.goto(`/auth/login?next=${encodeURIComponent('//evil.example')}`);
    await expect(page.getByTestId('auth-back')).toHaveAttribute('href', '/');
  });

  test('sign-up keeps the way back and has no ✕', async ({ page }) => {
    await page.goto(`/auth/login?next=${encodeURIComponent(songPath)}`);
    await page.getByRole('link', { name: 'Join the Circle' }).click();
    await page.waitForURL((url) => url.pathname === '/auth/sign-up');
    await expect(page.getByRole('button', { name: /close/i })).toHaveCount(0);
    await expect(page.getByTestId('auth-back')).toHaveAttribute('href', songPath);
  });

  test('forgot-password: Back returns to login, which still leads back to the song', async ({ page }) => {
    await page.goto(`/auth/login?next=${encodeURIComponent(songPath)}`);
    await page.getByRole('button', { name: 'Sign in with password' }).click();
    await page.getByRole('link', { name: 'Forgot' }).click();
    await page.waitForURL((url) => url.pathname === '/auth/forgot-password');
    const back = page.getByTestId('auth-back');
    await expect(back).toHaveAttribute('href', `/auth/login?next=${encodeURIComponent(songPath)}`);
    await back.click();
    await page.waitForURL((url) => url.pathname === '/auth/login');
    await expect(page.getByTestId('auth-back')).toHaveAttribute('href', songPath);
  });
});
