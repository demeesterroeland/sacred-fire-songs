import { test, expect } from '@playwright/test';
import { ROLES } from '../fixtures/roles';
import pg from 'pg';

const testPlaylistId = 'aaaaaaaa-0001-4000-a000-000000000001';
const privatePlaylistId = 'aaaaaaaa-0003-4000-a000-000000000003';

test.beforeAll(async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set in E2E test context.');
  }

  const client = new pg.Client({ connectionString });
  await client.connect();

  try {
    // 1. Clean up potential leftover items
    await client.query('DELETE FROM public.setlist_items WHERE setlist_id IN ($1, $2)', [testPlaylistId, privatePlaylistId]);

    // 2. Insert test public playlist owned by Member ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
    await client.query(`
      INSERT INTO public.setlists (id, owner_id, title, description, is_public, created_at)
      VALUES ($1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Water Ceremony', 'Songs for water blessings.', true, now())
      ON CONFLICT (id) DO UPDATE SET 
        owner_id = EXCLUDED.owner_id, 
        title = EXCLUDED.title, 
        description = EXCLUDED.description, 
        is_public = EXCLUDED.is_public;
    `, [testPlaylistId]);

    // 3. Insert test private playlist owned by Member
    await client.query(`
      INSERT INTO public.setlists (id, owner_id, title, description, is_public, created_at)
      VALUES ($1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'My Healing Practice', 'Personal private healing songs.', false, now())
      ON CONFLICT (id) DO UPDATE SET 
        owner_id = EXCLUDED.owner_id, 
        title = EXCLUDED.title, 
        description = EXCLUDED.description, 
        is_public = EXCLUDED.is_public;
    `, [privatePlaylistId]);

    console.log('[E2E Setup] Seeded/updated test playlists.');
  } finally {
    await client.end();
  }
});

test.describe('Public Playlist Curation (Story 3.4.6)', () => {

  test.describe('Gatekeeper Curation Access', () => {
    test.use({ storageState: ROLES.gatekeeper.storage });

    test('can edit another user\'s public playlist details', async ({ page }) => {
      // 1. Visit another user's public playlist
      await page.goto(`/library/playlists/${testPlaylistId}`);
      await expect(page.getByRole('heading', { name: 'Water Ceremony' })).toBeVisible();

      // 2. Edit description button should be visible/accessible
      const editDescButton = page.locator('button:has-text("Add a description…"), button:has-text("Songs for water blessings")');
      await expect(editDescButton).toBeVisible();
      await editDescButton.click();

      // Type a new description
      const descTextarea = page.locator('textarea[placeholder="Add a description…"]');
      await expect(descTextarea).toBeVisible();
      await descTextarea.fill('Updated water blessing songs curated.');
      await descTextarea.press('Enter'); // Trigger blur/save

      // Verify description updated
      await expect(page.locator('text=Updated water blessing songs curated.')).toBeVisible();
    });

    test('can add songs to another user\'s public playlist', async ({ page }) => {
      await page.goto(`/library/playlists/${testPlaylistId}`);

      // 1. "Add Songs" button should be visible
      const addSongsBtn = page.locator('button:has-text("Add Songs")').first();
      await expect(addSongsBtn).toBeVisible();
      await addSongsBtn.click();

      // 2. Select song from sheet to add
      const sheet = page.locator('h2:has-text("Add Songs")');
      await expect(sheet).toBeVisible();

      // Find first song button in the sheet's scrollable container and add/toggle it
      const firstSongBtn = page.locator('.fixed.bottom-0 .overflow-y-auto button').first();
      await expect(firstSongBtn).toBeVisible();
      await firstSongBtn.click();

      // Close the sheet
      await page.locator('button[aria-label="Close"]').click();
      await expect(sheet).not.toBeVisible();
    });

    test('cannot access another user\'s private playlist', async ({ page }) => {
      // My Healing Practice is a private playlist owned by member
      await page.goto(`/library/playlists/${privatePlaylistId}`);
      // Should show Not Found page (with custom "Song Not Found" header)
      await expect(page.locator('h1').first()).toHaveText('Song Not Found');
    });
  });

  test.describe('Member Access Restrictions', () => {
    test.use({ storageState: ROLES.member.storage });

    test('cannot edit or curate a public playlist they do not own', async ({ page }) => {
      // Create a public playlist owned by Admin ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
      const adminPlaylistId = 'aaaaaaaa-0002-4000-a000-000000000002';
      
      const connectionString = process.env.DATABASE_URL;
      const client = new pg.Client({ connectionString });
      await client.connect();
      try {
        await client.query('DELETE FROM public.setlist_items WHERE setlist_id = $1', [adminPlaylistId]);
        await client.query(`
          INSERT INTO public.setlists (id, owner_id, title, description, is_public, created_at)
          VALUES ($1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Admin Fire Circle', 'Admin public playlist.', true, now())
          ON CONFLICT (id) DO UPDATE SET 
            owner_id = EXCLUDED.owner_id, 
            title = EXCLUDED.title, 
            description = EXCLUDED.description, 
            is_public = EXCLUDED.is_public;
        `, [adminPlaylistId]);
      } finally {
        await client.end();
      }

      // Member visits Admin's public playlist
      await page.goto(`/library/playlists/${adminPlaylistId}`);
      await expect(page.getByRole('heading', { name: 'Admin Fire Circle' })).toBeVisible();

      // Member should NOT see "Add Songs" button
      const addSongsBtn = page.locator('button:has-text("Add Songs")').first();
      await expect(addSongsBtn).not.toBeVisible();

      // Description should show as text, not a button triggering edit textarea
      const editDescButton = page.locator('button:has-text("Add a description…"), button:has-text("Admin public playlist.")');
      await expect(editDescButton).not.toBeVisible();
    });
  });
});
