import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Sacred Fire Songs E2E tests.
 *
 * Phase 0 foundation (see docs/testing/e2e-test-overview.md).
 *
 * Prerequisites to actually run these tests:
 *   1. A local Supabase stack is running and seeded:  npx supabase start
 *   2. Env vars are set (see .env.test.example):
 *        NEXT_PUBLIC_SUPABASE_URL
 *        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 *        NEXT_PUBLIC_DEV_TEST_PASSWORD   (the seeded dev password)
 *
 * The webServer below builds and starts the app against that stack. We test a
 * production build (next build && next start) rather than `next dev`, so timing
 * and bundling match reality.
 */

const PORT = process.env.PORT ?? '3000';
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  // Per-file parallelism; auth setup runs first via project dependency.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'never' }], ['list']],

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // 1. Authenticate once per role and persist storageState to e2e/.auth/*.json
    { name: 'setup', testMatch: /auth\.setup\.ts/ },

    // 2. Desktop run (depends on setup so storage states exist)
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },

    // 3. Mobile run — the app is mobile-first (bottom nav, wake lock)
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },
  ],

  // Build + start the app for the duration of the test run.
  // Reuses an already-running dev/prod server locally for fast iteration.
  webServer: {
    command: 'npm run build && npm run start',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
