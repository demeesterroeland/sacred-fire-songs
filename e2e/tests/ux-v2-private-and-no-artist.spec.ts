import { test, expect } from '@playwright/test';
import pg from 'pg';
import { ROLES } from '../fixtures/roles';
import { NO_ARTIST_FIXTURE_IDS as IDS } from '../fixtures/ids';

/**
 * #564: a song that is not public is "Private", never "Draft". #565: a song without an author shows
 * "No artist", never "Traditional". Gherkin: docs/testing/ux-v2-private-and-no-artist.feature (@e2e).
 *
 * The spec upserts one public song of the member without an author under fixed ids;
 * e2e/global-teardown.ts removes it.
 */
test.describe.configure({ mode: 'serial' });

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const TITLE = 'E2E No Artist Song';
let memberId = '';

test.beforeAll(async () => {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    const { rows } = await client.query<{ id: string }>('SELECT id FROM public.profiles WHERE email = $1', [ROLES.member.email]);
    if (!rows[0]) throw new Error(`Seeded profile missing: ${ROLES.member.email}`);
    memberId = rows[0].id;
    await client.query(
      `INSERT INTO public.compositions (id, title, original_author, owner_id, is_public)
       VALUES ($1, $2, NULL, $3, true)
       ON CONFLICT (id) DO UPDATE SET original_author = NULL, owner_id = EXCLUDED.owner_id, is_public = true`,
      [IDS.song, TITLE, memberId]
    );
    await client.query(
      `INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, contributor_id)
       VALUES ($1, $2, 'Original', '[Am]Line one of the song', $3)
       ON CONFLICT (id) DO NOTHING`,
      [IDS.version, IDS.song, memberId]
    );
  } finally {
    await client.end();
  }
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('sacred-fire-songs-locale', 'en'));
});

test.describe('member', () => {
  test.use({ storageState: ROLES.member.storage });

  test('#564: the filter popup on /songs offers Public and Private, never Draft', async ({ page }) => {
    await page.goto('/songs');
    await page.getByRole('button', { name: 'Search options' }).click();
    const status = page.getByRole('radiogroup', { name: 'Status' });
    await expect(status).toBeVisible();
    await expect(status.getByRole('radio', { name: 'Public', exact: true })).toBeVisible();
    await expect(status.getByRole('radio', { name: 'Private', exact: true })).toBeVisible();
    // The popup itself (its heading's panel), without the song list behind it.
    const popup = page.locator('div.relative.z-10', { has: page.getByRole('heading', { name: 'Search options' }) });
    await expect(popup).not.toContainText(/draft/i);
  });

  test('#564: the song form saves a song that is not public "as private"', async ({ page }) => {
    await page.goto('/songs/add');
    await expect(page.getByRole('button', { name: 'Save as private' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Save as draft/i })).toHaveCount(0);
  });

  test('#565: a song without an author shows "No artist" in the list and on its page', async ({ page }) => {
    await page.goto(`/songs?q=${encodeURIComponent(TITLE)}`);
    const row = page.getByTestId('song-row').filter({ hasText: TITLE });
    await expect(row.getByTestId('song-row-meta')).toHaveText('No artist');

    await page.goto(`/songs/${IDS.song}`);
    const meta = page.getByTestId('song-meta-lines');
    await expect(meta).toContainText('No artist');
    await expect(meta).not.toContainText('Traditional');
    await expect(meta.getByRole('link', { name: 'No artist' })).toHaveCount(0);
  });
});

test.describe('admin', () => {
  test.use({ storageState: ROLES.admin.storage });

  test('#565: the admin member page shows "No artist" for a song without an author', async ({ page }) => {
    await page.goto(`/admin/users/${memberId}`);
    const row = page.getByText(TITLE, { exact: true }).locator('xpath=..');
    await expect(row).toContainText('No artist');
    await expect(row).not.toContainText('Traditional');
  });
});
