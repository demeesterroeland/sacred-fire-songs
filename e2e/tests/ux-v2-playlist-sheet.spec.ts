import { test, expect } from '@playwright/test';
import pg from 'pg';
import { ROLES } from '../fixtures/roles';

/**
 * Story 6.1.30 / G8.1 (#414): Add to playlist is a bottom sheet with "New playlist"
 * first and check marks. Gherkin: docs/testing/ux-v2-playlist-sheet.feature (@e2e).
 *
 * Seeded ids change on every reseed, so the spec looks up a public song and the
 * member, creates two playlists of its own and removes them again.
 */
test.use({ storageState: ROLES.member.storage, viewport: { width: 390, height: 844 } });
test.describe.configure({ mode: 'serial', timeout: 90_000 });

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const RUN = Date.now().toString(36);
const WATER = `E2E Water ${RUN}`;
const FIRE = `E2E Fire ${RUN}`;

let songId = '';
let playlistIds: string[] = [];

test.beforeAll(async () => {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    const member = await client.query<{ id: string }>('SELECT id FROM public.profiles WHERE email = $1', [ROLES.member.email]);
    if (!member.rows[0]) throw new Error('Seeded member missing');
    const song = await client.query<{ id: string; version_id: string }>(
      `SELECT c.id, v.id AS version_id FROM public.compositions c
         JOIN public.song_versions v ON v.composition_id = c.id
        WHERE c.is_public = true ORDER BY c.title, v.created_at LIMIT 1`
    );
    if (!song.rows[0]) throw new Error('No public song seeded');
    songId = song.rows[0].id;
    const make = async (title: string) => {
      const { rows } = await client.query<{ id: string }>(
        'INSERT INTO public.setlists (owner_id, title, is_public) VALUES ($1, $2, false) RETURNING id',
        [member.rows[0].id, title]
      );
      return rows[0].id;
    };
    const water = await make(WATER);
    const fire = await make(FIRE);
    playlistIds = [water, fire];
    await client.query(
      'INSERT INTO public.setlist_items (setlist_id, song_version_id, order_index) VALUES ($1, $2, 0)',
      [water, song.rows[0].version_id]
    );
  } finally {
    await client.end();
  }
});

test.afterAll(async () => {
  if (!playlistIds.length) return;
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    await client.query('DELETE FROM public.setlists WHERE id = ANY($1::uuid[])', [playlistIds]);
    await client.query('DELETE FROM public.setlists WHERE title = $1 AND owner_id = (SELECT id FROM public.profiles WHERE email = $2)', ['E2E Sunrise ' + RUN, ROLES.member.email]);
  } finally {
    await client.end();
  }
});

async function openSheet(page: import('@playwright/test').Page) {
  await page.goto(`/songs/${songId}`);
  // Phones: Add to playlist sits in the song's action bar (Story 6.1.9 / G2.4, #393).
  const trigger = page.getByTestId('song-action-playlist');
  await expect(trigger).toBeVisible({ timeout: 15_000 });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Add to playlist' })).toBeVisible({ timeout: 10_000 });
  return dialog;
}

test('Add to playlist opens a bottom sheet: New playlist first, check on the playlist that holds the song', async ({ page }) => {
  const dialog = await openSheet(page);
  const rows = dialog.getByTestId('picker-row');
  await expect(rows.first()).toContainText('New playlist');
  const water = dialog.getByRole('checkbox', { name: WATER });
  const fire = dialog.getByRole('checkbox', { name: FIRE });
  await expect(water).toHaveAttribute('aria-checked', 'true', { timeout: 10_000 });
  await expect(fire).toHaveAttribute('aria-checked', 'false');

  // Bottom sheet: anchored to the bottom edge of the 390 px viewport, rows at least 44 px high.
  const box = await dialog.boundingBox();
  expect(box && box.y + box.height).toBeGreaterThan(843);
  for (const row of await rows.all()) {
    expect((await row.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
});

test('tapping a playlist adds or removes the song and flips its check', async ({ page }) => {
  const dialog = await openSheet(page);
  const water = dialog.getByRole('checkbox', { name: WATER });
  const fire = dialog.getByRole('checkbox', { name: FIRE });
  await expect(water).toHaveAttribute('aria-checked', 'true', { timeout: 10_000 });

  // The marks flip before the save finishes, and a reload would cancel a save still under way: wait for each one.
  const saved = () =>
    page.waitForResponse((r) => r.request().method() !== 'GET' && (!!r.request().headers()['next-action'] || r.url().includes('/rest/v1/')));
  const fireSaved = saved();
  await fire.click();
  await expect(fire).toHaveAttribute('aria-checked', 'true');
  await fireSaved;
  const waterSaved = saved();
  await water.click();
  await expect(water).toHaveAttribute('aria-checked', 'false');
  await waterSaved;

  // The change is stored: reopening the sheet shows the same marks.
  await page.keyboard.press('Escape');
  await page.reload();
  const again = await openSheet(page);
  await expect(again.getByRole('checkbox', { name: FIRE })).toHaveAttribute('aria-checked', 'true', { timeout: 10_000 });
  await expect(again.getByRole('checkbox', { name: WATER })).toHaveAttribute('aria-checked', 'false');
});

test('"New playlist" creates a playlist that holds the song', async ({ page }) => {
  const dialog = await openSheet(page);
  await dialog.getByRole('button', { name: 'New playlist' }).click();
  await dialog.getByRole('textbox', { name: 'Playlist name' }).fill(`E2E Sunrise ${RUN}`);
  await dialog.getByRole('button', { name: 'Create' }).click();
  await expect(dialog.getByRole('checkbox', { name: `E2E Sunrise ${RUN}` })).toHaveAttribute('aria-checked', 'true', { timeout: 10_000 });
});
