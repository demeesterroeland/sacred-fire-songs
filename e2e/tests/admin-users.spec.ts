import { test, expect, type Page } from '@playwright/test';
import pg from 'pg';
import { ROLES } from '../fixtures/roles';

/**
 * Story 3.6.1 – Admin users overview, details and contributions (#258).
 * Gherkin: docs/testing/admin-users.feature (@e2e scenarios).
 */

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

// Fixed ids so both projects (desktop + mobile) upsert the same fixture rows.
const SONG_ID = 'eeeeeeee-3610-4000-a000-000000000001';
const VERSION_ID = 'eeeeeeee-3610-4000-a000-000000000002';
const PLAYLIST_ID = 'eeeeeeee-3610-4000-a000-000000000003';
const SONG_TITLE = 'E2E Admin Overview Song';
const VERSION_NAME = 'E2E Arrangement';
const PLAYLIST_TITLE = 'E2E Admin Playlist';

test.beforeAll(async () => {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    const {
      rows: [gatekeeper],
    } = await client.query<{ id: string }>('SELECT id FROM public.profiles WHERE email = $1', [
      ROLES.gatekeeper.email,
    ]);
    if (!gatekeeper) throw new Error('Seeded gatekeeper profile missing.');

    await client.query(
      `INSERT INTO public.compositions (id, title, original_author, owner_id, is_public)
       VALUES ($1, $2, 'E2E Author', $3, true)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, owner_id = EXCLUDED.owner_id`,
      [SONG_ID, SONG_TITLE, gatekeeper.id]
    );
    await client.query(
      `INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, contributor_id)
       VALUES ($1, $2, $3, '{title: E2E}', $4)
       ON CONFLICT (id) DO UPDATE SET version_name = EXCLUDED.version_name, contributor_id = EXCLUDED.contributor_id`,
      [VERSION_ID, SONG_ID, VERSION_NAME, gatekeeper.id]
    );
    await client.query(
      `INSERT INTO public.setlists (id, owner_id, title, is_public)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, owner_id = EXCLUDED.owner_id, is_public = true`,
      [PLAYLIST_ID, gatekeeper.id, PLAYLIST_TITLE]
    );
  } finally {
    await client.end();
  }
});

function usersList(page: Page) {
  return page.getByRole('list', { name: 'Registered users' });
}

function userRow(page: Page, email: string) {
  return usersList(page).getByRole('listitem').filter({ hasText: email });
}

test.describe('Admin users – access (AC 3)', () => {
  for (const role of ['member', 'gatekeeper', 'musician'] as const) {
    test.describe(`as ${role}`, () => {
      test.use({ storageState: ROLES[role].storage });

      test(`a ${role} is shown an unauthorized notice`, async ({ page }) => {
        await page.goto('/admin/users');
        await expect(page.getByRole('heading', { name: 'Access Denied' })).toBeVisible();
        await expect(usersList(page)).toHaveCount(0);
        await expect(page.getByText(ROLES.admin.email)).toHaveCount(0);
      });
    });
  }

  test('a guest is sent to the login page', async ({ page }) => {
    // proxy.ts redirects unauthenticated requests for non-public routes before the admin layout runs.
    await page.goto('/admin/users');
    await page.waitForURL((url) => url.pathname === '/auth/login');
    await expect(usersList(page)).toHaveCount(0);
  });

  test.describe('account menu', () => {
    test.skip(({ isMobile }) => isMobile, 'Header account menu is desktop-only');

    test.describe('as admin', () => {
      test.use({ storageState: ROLES.admin.storage });
      test('shows the Admin Portal link', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Account menu' }).click();
        await expect(page.getByRole('link', { name: 'Admin Portal' })).toHaveAttribute('href', '/admin/users');
      });
    });

    test.describe('as member', () => {
      test.use({ storageState: ROLES.member.storage });
      test('hides the Admin Portal link', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Account menu' }).click();
        await expect(page.getByRole('link', { name: 'Account Settings' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Admin Portal' })).toHaveCount(0);
      });
    });
  });
});

test.describe('Admin users – overview (AC 1)', () => {
  test.use({ storageState: ROLES.admin.storage });

  test('lists every seeded account with summary details', async ({ page }) => {
    await page.goto('/admin/users');
    const list = usersList(page);
    await expect(list).toBeVisible();

    for (const [role, label] of [
      ['admin', 'Admin'],
      ['musician', 'Expert'],
      ['member', 'Member'],
      ['gatekeeper', 'Gatekeeper'],
    ] as const) {
      const row = userRow(page, ROLES[role].email);
      await expect(row).toHaveCount(1);
      await expect(row.getByText(label, { exact: true })).toBeVisible();
      await expect(row.getByText(/^Joined /)).toBeVisible();
      await expect(row.getByText(/^(Active|Inactive|Never active)$/)).toBeVisible();
    }
  });

  test('search, empty state and role filter', async ({ page }) => {
    await page.goto('/admin/users');
    const search = page.getByRole('textbox', { name: 'Search users' });

    await search.fill('+gatekeeper@');
    await expect(usersList(page).getByRole('listitem')).toHaveCount(1);
    await expect(userRow(page, ROLES.gatekeeper.email)).toBeVisible();

    await search.fill('no-such-user-xyz');
    await expect(page.getByText('No users found')).toBeVisible();
    await expect(usersList(page)).toHaveCount(0);

    await search.fill('');
    await page.getByRole('combobox', { name: 'Filter by role' }).selectOption('musician');
    await expect(usersList(page).getByRole('listitem')).toHaveCount(1);
    await expect(userRow(page, ROLES.musician.email)).toBeVisible();
  });
});

test.describe('Admin users – details and contributions (AC 2)', () => {
  test.use({ storageState: ROLES.admin.storage });

  test('opens a user and browses their contributions', async ({ page }) => {
    await page.goto('/admin/users');
    await userRow(page, ROLES.gatekeeper.email).getByRole('link', { name: /View details/ }).click();
    await page.waitForURL(/\/admin\/users\/[0-9a-f-]{36}$/);

    await expect(page.getByText(ROLES.gatekeeper.email)).toBeVisible();
    await expect(page.getByText('Gatekeeper', { exact: true })).toBeVisible();
    await expect(page.getByText('Musician:')).toContainText('No');
    await expect(page.getByText('Joined:')).toBeVisible();
    await expect(page.getByText('Last Active:')).toBeVisible();

    const tabs = page.getByRole('tablist', { name: 'Contributions' });
    await expect(page.getByText(SONG_TITLE, { exact: true })).toBeVisible();

    await tabs.getByRole('tab', { name: /Versions/ }).click();
    await expect(page.getByText(VERSION_NAME, { exact: true })).toBeVisible();
    await expect(page.getByText(SONG_TITLE, { exact: true })).toBeVisible();

    await tabs.getByRole('tab', { name: /Playlists/ }).click();
    await expect(page.getByText(PLAYLIST_TITLE, { exact: true })).toBeVisible();
    await expect(page.getByText('Public', { exact: true }).first()).toBeVisible();

    await page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Users' }).click();
    await page.waitForURL((url) => url.pathname === '/admin/users');
  });

  test('shows musician status for the expert account', async ({ page }) => {
    await page.goto('/admin/users');
    await userRow(page, ROLES.musician.email).getByRole('link', { name: /View details/ }).click();
    await expect(page.getByText('Expert', { exact: true })).toBeVisible();
    await expect(page.getByText('Musician:')).toContainText('Yes');
  });

  test('an unknown user id shows the not-found page', async ({ page }) => {
    // app/loading.tsx streams the response, so notFound() renders the UI with HTTP 200.
    await page.goto('/admin/users/00000000-0000-4000-a000-000000000000');
    await expect(page.getByRole('heading', { name: 'User Not Found' })).toBeVisible();
    await page.getByRole('link', { name: 'Back to All Users' }).click();
    await page.waitForURL((url) => url.pathname === '/admin/users');
  });
});
