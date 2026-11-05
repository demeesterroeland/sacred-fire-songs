// Shared helpers for the UX-research screenshot scripts.
// Run with the repo's node_modules installed, or point PLAYWRIGHT_FROM at a
// checkout that has them: PLAYWRIGHT_FROM=/path/to/repo/ node scripts/dev/ux/capture-routes.mjs
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(
  process.env.PLAYWRIGHT_FROM ? path.join(process.env.PLAYWRIGHT_FROM, 'package.json') : import.meta.url,
);
export const { chromium } = require('playwright');

export const BASE = process.env.UX_BASE_URL ?? 'http://localhost:3000';
export const OUT = path.resolve(process.env.UX_OUT ?? 'docs/ux-research/screenshots');
export const PASSWORD = process.env.NEXT_PUBLIC_DEV_TEST_PASSWORD ?? 'sacred-fire-dev';

export const ROLES = {
  guest: null,
  member: 'roel.de.meester+member@gmail.com',
  gatekeeper: 'roel.de.meester+gatekeeper@gmail.com',
  admin: 'roel.de.meester+admin@gmail.com',
};

export const VIEWPORTS = {
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};

// Seeded songs (supabase/seeds/03_songs_random_generated.sql). IDs change when the
// seed is regenerated; look them up again with the owner's profile id if pages 404.
export const SONGS = {
  musicianSong: 'fb193fc1-8d60-45db-85ab-b076d5985255', // Morning Sunrise (owned by musician, has media)
  memberSong: 'be9951cc-ee6a-4ccc-b926-e821ae1fe6b6', // Danza del Cielo Curandero (owned by member, media + 5 takes, 2 shared)
  adminSong: 'cf067f0d-30e4-4851-9e0b-1b6407e82cfa', // Down to the River (owned by admin)
};

export async function login(context, email) {
  const page = await context.newPage();
  await page.goto(`${BASE}/auth/login`);
  await page.getByRole('button', { name: 'Sign in with password' }).click();
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.waitForURL((url) => url.pathname === '/', { timeout: 30000 });
  await page.close();
}

// UX_SCHEME=light|dark (default dark) sets both the media query and the app's stored theme.
export const SCHEME = process.env.UX_SCHEME === 'light' ? 'light' : 'dark';

/** UX_ROUTES=01-home,03-song-detail limits capture to those names (prefix match). */
export function routeSelected(name) {
  const only = process.env.UX_ROUTES?.split(',').map((s) => s.trim()).filter(Boolean);
  return !only || only.some((o) => name.startsWith(o));
}

export async function newContext(browser, viewportKey, role) {
  const context = await browser.newContext({ ...VIEWPORTS[viewportKey], locale: 'en-US', colorScheme: SCHEME });
  await context.addInitScript((theme) => {
    try {
      const key = 'sacred-fire-songs-preferences';
      const prefs = JSON.parse(localStorage.getItem(key) || '{}');
      localStorage.setItem(key, JSON.stringify({ ...prefs, theme }));
    } catch {}
  }, SCHEME);
  if (ROLES[role]) await login(context, ROLES[role]);
  return context;
}

export async function settle(page, ms = 1200) {
  try {
    await page.waitForLoadState('networkidle', { timeout: 8000 });
  } catch {}
  await page.waitForTimeout(ms);
}

export async function shot(page, viewportKey, role, name, { fullPage = true } = {}) {
  const dir = path.join(OUT, viewportKey, role);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}.webp`);
  // Hide the Next.js dev-tools badge so it does not cover the bottom navigation.
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {});
  await page.screenshot({ path: file, fullPage });
  // PNG is converted to WebP afterwards (see docs/ux-research/README.md); keep the repo small.
  console.log(`  📸 ${path.relative(process.cwd(), file)}  (${page.url().replace(BASE, '')})`);
  return file;
}
