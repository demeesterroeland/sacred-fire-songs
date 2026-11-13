import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.test if it exists
try {
  const envPath = path.resolve(__dirname, '.env.test');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    for (const line of envConfig.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const index = trimmed.indexOf('=');
        if (index !== -1) {
          const key = trimmed.substring(0, index).trim();
          const val = trimmed.substring(index + 1).trim();
          process.env[key] = val.replace(/^["']|["']$/g, '');
        }
      }
    }
  }
} catch (e) {
  console.warn('[playwright.config] Warning: Failed to load .env.test:', e instanceof Error ? e.message : String(e));
}

// Specs that seed data directly (pg) need DATABASE_URL. Against a local
// Supabase stack it is always the CLI default, so derive it.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
if (!process.env.DATABASE_URL && /127\.0\.0\.1|localhost/.test(supabaseUrl)) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
}

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
 *        E2E_PASSWORD_<ROLE>             (optional per-role override, see e2e/fixtures/roles.ts)
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
  globalTeardown: './e2e/global-teardown.ts',
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
    extraHTTPHeaders: process.env.VERCEL_PROTECTION_BYPASS_TOKEN ? {
      'x-vercel-protection-bypass': process.env.VERCEL_PROTECTION_BYPASS_TOKEN,
    } : undefined,
  },

  projects: [
    // 1. Authenticate once per role and persist storageState to e2e/.auth/*.json
    { 
      name: 'setup', 
      testMatch: /auth\.setup\.ts/,
      use: { channel: 'chrome' }
    },

    // 2. Desktop Headless (Standard DOM & Auth tests)
    {
      name: 'chromium-desktop-headless',
      grepInvert: /@headed/,
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: true,
      },
      dependencies: ['setup'],
    },

    // 3. Mobile Headless (Standard DOM & Navigation tests)
    {
      name: 'mobile-chrome-headless',
      grepInvert: /@headed/,
      use: { 
        ...devices['Pixel 5'],
        channel: 'chrome',
        headless: true,
      },
      dependencies: ['setup'],
    },

    // 4. Desktop Headed (Audio recording & media focus tests)
    {
      name: 'chromium-desktop-headed',
      grep: /@headed/,
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        // CI has no display; E2E_FORCE_HEADLESS=1 does the same locally.
        headless: !!process.env.CI || process.env.E2E_FORCE_HEADLESS === '1',
      },
      dependencies: ['setup'],
    },

    // 5. Mobile Headed (Audio recording & mobile drawer media tests)
    {
      name: 'mobile-chrome-headed',
      grep: /@headed/,
      use: { 
        ...devices['Pixel 5'],
        channel: 'chrome',
        // CI has no display; E2E_FORCE_HEADLESS=1 does the same locally.
        headless: !!process.env.CI || process.env.E2E_FORCE_HEADLESS === '1',
      },
      dependencies: ['setup'],
    },
  ],

  // Build + start the app for the duration of the test run.
  // Reuses an already-running dev/prod server locally for fast iteration.
  // When testing against an existing/remote deployment (E2E_BASE_URL), skip local build.
  webServer: process.env.E2E_BASE_URL ? undefined : {
    command: 'npm run build && npm run start',
    url: `${baseURL}/favicon.svg`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
