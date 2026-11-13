// Story 6.1.35 (#485), group 6 — docs/testing/ux-v2-sober-playlists.feature. Check playlist details,
// the context menu and Add Songs sheet for colour contrast in both themes without changing saved data.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import pg from 'pg';
import { ROLES } from '../fixtures/roles';

const THEMES = ['light', 'dark'] as const;
const RUN = Date.now().toString(36);
const TITLE = `E2E Sober Playlist ${RUN}`;
const PUBLIC_TITLE = `E2E Sober Public Playlist ${RUN}`;

let playlistId = '';
let publicPlaylistId = '';

test.use({ storageState: ROLES.member.storage });
test.describe.configure({ mode: 'serial', timeout: 60_000 });

test.beforeAll(async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set in E2E test context.');
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    const member = await client.query<{ id: string }>(
      'SELECT id FROM public.profiles WHERE email = $1',
      [ROLES.member.email],
    );
    if (!member.rows[0]) throw new Error('Seeded member missing');
    const song = await client.query<{ id: string; version_id: string }>(
      `SELECT c.id, v.id AS version_id FROM public.compositions c
         JOIN public.song_versions v ON v.composition_id = c.id
        WHERE c.is_public = true ORDER BY c.title, v.created_at LIMIT 1`,
    );
    if (!song.rows[0]) throw new Error('No public song seeded');
    const playlist = await client.query<{ id: string }>(
      'INSERT INTO public.setlists (owner_id, title, is_public) VALUES ($1, $2, false) RETURNING id',
      [member.rows[0].id, TITLE],
    );
    playlistId = playlist.rows[0].id;
    const publicPlaylist = await client.query<{ id: string }>(
      'INSERT INTO public.setlists (owner_id, title, is_public) VALUES ($1, $2, true) RETURNING id',
      [member.rows[0].id, PUBLIC_TITLE],
    );
    publicPlaylistId = publicPlaylist.rows[0].id;
    await client.query(
      'INSERT INTO public.setlist_items (setlist_id, song_version_id, order_index) VALUES ($1, $2, 0)',
      [publicPlaylistId, song.rows[0].version_id],
    );
  } finally {
    await client.end();
  }
});

test.afterAll(async () => {
  if (!playlistId && !publicPlaylistId) return;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set in E2E test context.');
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    const ids = [playlistId, publicPlaylistId].filter(Boolean);
    await client.query('DELETE FROM public.setlist_items WHERE setlist_id = ANY($1::uuid[])', [ids]);
    await client.query('DELETE FROM public.setlists WHERE id = ANY($1::uuid[])', [ids]);
  } finally {
    await client.end();
  }
});

async function setTheme(page: Page, theme: (typeof THEMES)[number]) {
  await page.emulateMedia({ colorScheme: theme });
  await page.addInitScript((value) => {
    localStorage.setItem('sacred-fire-songs-locale', 'en');
    const key = 'sacred-fire-songs-preferences';
    const prefs = JSON.parse(localStorage.getItem(key) || '{}');
    localStorage.setItem(key, JSON.stringify({ ...prefs, theme: value }));
  }, theme);
}

async function expectContrast(page: Page, selector: string, context: string) {
  await expect.poll(() =>
    page.evaluate((sel) => document.querySelector(sel)?.getAnimations({ subtree: true }).length ?? 0, selector),
  ).toBe(0);
  const results = await new AxeBuilder({ page }).include(selector).withRules(['color-contrast']).analyze();
  const violations = results.violations.flatMap((violation) =>
    violation.nodes.map((node) => `${node.target.join(' ')}: ${node.failureSummary}`),
  );
  expect(violations, `${context}: colour-contrast violations`).toEqual([]);
}

for (const theme of THEMES) {
  test(`playlist details, menu, Add Songs sheet and export dialog are readable (${theme})`, async ({ page, browser }) => {
    await setTheme(page, theme);
    await page.goto(`/library/playlists/${playlistId}`);
    if (theme === 'dark') await expect(page.locator('html')).toHaveClass(/\bdark\b/);
    else await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);

    await expect(page.getByRole('heading', { name: TITLE })).toBeVisible();
    await expectContrast(page, 'main', `playlist details (${theme})`);

    await page.getByRole('button', { name: 'Playlist options' }).click();
    const menu = page.getByRole('menu');
    await expect(menu.getByRole('menuitem', { name: 'Delete Playlist' })).toBeVisible();
    await expectContrast(page, '[role="menu"]', `playlist menu (${theme})`);
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Add Songs' }).click();
    const sheet = page.locator('.fixed.bottom-0.z-50');
    await expect(sheet.getByRole('heading', { name: 'Add Songs to Playlist' })).toBeVisible();
    await expectContrast(page, '.fixed.bottom-0.z-50', `Add Songs sheet (${theme})`);

    const guestContext = await browser.newContext({
      storageState: { cookies: [], origins: [] },
      viewport: page.viewportSize() ?? { width: 1280, height: 720 },
    });
    try {
      const guestPage = await guestContext.newPage();
      await setTheme(guestPage, theme);
      await guestPage.goto(`/library/playlists/${publicPlaylistId}`);
      await expect(guestPage.getByRole('heading', { name: PUBLIC_TITLE })).toBeVisible();
      await expect(guestPage.getByRole('button', { name: 'Make Private' })).toHaveCount(0);
      await guestPage.getByRole('button', { name: 'Export PDF' }).click();
      const dialog = guestPage.getByRole('dialog');
      await expect(dialog.getByRole('heading', { name: 'Log in to export PDF' })).toBeVisible();
      await expectContrast(guestPage, '[role="dialog"]', `export sign-in dialog (${theme})`);
    } finally {
      await guestContext.close();
    }
  });
}
