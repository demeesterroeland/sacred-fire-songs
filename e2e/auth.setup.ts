import { test as setup, expect } from '@playwright/test';
import fs from 'fs';
import { ROLES, TEST_PASSWORD, STORAGE_DIR, type RoleKey } from './fixtures/roles';

/**
 * Authenticates once per seeded role and saves the session (cookies +
 * localStorage) to e2e/.auth/<role>.json. Specs then opt into a role via
 *   test.use({ storageState: ROLES.member.storage })
 * Guest specs use no storageState.
 *
 * Login is driven through the real UI (/auth/login → "Sign in with password")
 * so the Supabase SSR cookie session is captured exactly as a browser sets it.
 */

setup.beforeAll(() => {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
});

for (const role of Object.keys(ROLES) as RoleKey[]) {
  setup(`authenticate as ${role}`, async ({ page }) => {
    const { email, storage } = ROLES[role];

    await page.goto('/auth/login');

    // The form defaults to magic-link mode; switch to password mode.
    await page.getByRole('button', { name: 'Sign in with password' }).click();

    await page.locator('#email').fill(email);
    await page.locator('#password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // Successful login redirects to the home page.
    await page.waitForURL((url) => url.pathname === '/');
    await expect(page.getByText(/an error occurred/i)).toHaveCount(0);

    await page.context().storageState({ path: storage });
  });
}
