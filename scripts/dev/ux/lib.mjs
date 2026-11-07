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

// Seeded songs (supabase/seeds/03_songs_random_generated.sql). Their ids change every time
// the local database is reseeded, so they are looked up by title in the local database
// (DATABASE_URL, default: the local Supabase CLI stack). UX_SONG_MUSICIAN / UX_SONG_MEMBER /
// UX_SONG_ADMIN override a lookup.
const SONG_TITLES = {
  musicianSong: ['Morning Sunrise', 'UX_SONG_MUSICIAN'], // owned by musician, has media
  memberSong: ['Danza del Cielo Curandero', 'UX_SONG_MEMBER'], // owned by member, media + takes, some shared
  adminSong: ['Down to the River', 'UX_SONG_ADMIN'], // owned by admin
};

async function lookupSongs() {
  const out = {};
  const missing = [];
  for (const [key, [, env]] of Object.entries(SONG_TITLES)) if (process.env[env]) out[key] = process.env[env];
  const todo = Object.entries(SONG_TITLES).filter(([key]) => !out[key]);
  if (todo.length === 0) return out;
  const { Client } = require('pg');
  const client = new Client({
    connectionString: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
  });
  await client.connect();
  try {
    for (const [key, [title, env]] of todo) {
      const { rows } = await client.query(
        'SELECT id FROM public.compositions WHERE title = $1 ORDER BY created_at LIMIT 1',
        [title],
      );
      if (rows[0]) out[key] = rows[0].id;
      else missing.push(`${title} (${env})`);
    }
  } finally {
    await client.end();
  }
  if (missing.length) throw new Error(`Seeded songs not found: ${missing.join(', ')}. Seed the local database or set the env vars.`);
  return out;
}

export const SONGS = await lookupSongs();

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
// The pg client the capture scripts need for fixtures (same module resolution as playwright above).
export const createRequire_pg = () => require('pg');

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
