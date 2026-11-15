import { test, expect } from '@playwright/test';
import pg from 'pg';
import { ROLES } from '../fixtures/roles';

/**
 * Story 6.1.32 / G8.3 (#416): New Playlist explains private vs public in one line
 * and has a visibility switch. Gherkin: docs/testing/ux-v2-new-playlist-visibility.feature (@e2e).
 */
test.use({ storageState: ROLES.member.storage, viewport: { width: 390, height: 844 } });
test.describe.configure({ mode: 'serial', timeout: 90_000 });

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const RUN = Date.now().toString(36);
const PRIVATE_NAME = `E2E Private ${RUN}`;
const PUBLIC_NAME = `E2E Public ${RUN}`;

async function visibilityOf(title: string): Promise<boolean | undefined> {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    const { rows } = await client.query<{ is_public: boolean }>(
      'SELECT is_public FROM public.setlists WHERE title = $1 AND owner_id = (SELECT id FROM public.profiles WHERE email = $2)',
      [title, ROLES.member.email]
    );
    return rows[0]?.is_public;
  } finally {
    await client.end();
  }
}

test.afterAll(async () => {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    await client.query(
      'DELETE FROM public.setlists WHERE title = ANY($1::text[]) AND owner_id = (SELECT id FROM public.profiles WHERE email = $2)',
      [[PRIVATE_NAME, PUBLIC_NAME], ROLES.member.email]
    );
  } finally {
    await client.end();
  }
});

test('New Playlist says private unless made public; Create needs a name', async ({ page }) => {
  await page.goto('/library/playlists/add');
  await expect(page.getByText(/Private: only you can see this playlist unless you make it public\./)).toBeVisible();
  const sw = page.getByRole('switch', { name: 'Make public' });
  await expect(sw).toHaveAttribute('aria-checked', 'false');
  const create = page.getByRole('button', { name: 'Create Playlist' });
  await expect(create).toBeDisabled();
  await page.getByPlaceholder('Playlist name…').fill(PRIVATE_NAME);
  await expect(create).toBeEnabled();
  const box = await create.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
});

test('creating without touching the switch makes a private playlist', async ({ page }) => {
  await page.goto('/library/playlists/add');
  await page.getByPlaceholder('Playlist name…').fill(PRIVATE_NAME);
  await page.getByRole('button', { name: 'Create Playlist' }).click();
  await page.waitForURL(/\/library\/playlists\/[0-9a-f-]{36}$/);
  expect(await visibilityOf(PRIVATE_NAME)).toBe(false);
});

test('switching to public changes the line and creates a public playlist', async ({ page }) => {
  await page.goto('/library/playlists/add');
  await page.getByPlaceholder('Playlist name…').fill(PUBLIC_NAME);
  await page.getByRole('switch', { name: 'Make public' }).click();
  await expect(page.getByText(/Public: anyone can find and open this playlist, with or without an account\./)).toBeVisible();
  await expect(page.getByText(/Private: only you/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Create Playlist' }).click();
  await page.waitForURL(/\/library\/playlists\/[0-9a-f-]{36}$/);
  expect(await visibilityOf(PUBLIC_NAME)).toBe(true);
});
