import { test, expect, type Page } from '@playwright/test';
import pg from 'pg';
import { ROLES } from '../fixtures/roles';
import { clickPractice } from '../fixtures/songActions';
import { SHARED_WITH_ME_FIXTURE_IDS as IDS } from '../fixtures/ids';

/**
 * Story 6.1.19 / G4.6 (#403), UXD-3: "Shared with me" + the bell. Gherkin:
 * docs/testing/ux-v2-shared-with-me.feature (@e2e).
 *
 * The gatekeeper owns a take and shares it with the member (inserted under fixed ids; the share
 * trigger creates the member's unread notification). The tests change the member's notification
 * state, so they run in order and only in the phone project. e2e/global-teardown.ts removes the rows.
 */
test.use({ storageState: ROLES.member.storage, viewport: { width: 390, height: 844 } });
test.describe.configure({ mode: 'serial', timeout: 90_000 });

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const SONG_TITLE = 'E2E Shared With Me Song';
const TAKE_NAME = 'E2E Inbox Take';
const LOCALE_KEY = 'sacred-fire-songs-locale';

let memberId = '';

async function withDb<T>(fn: (c: pg.Client) => Promise<T>): Promise<T> {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

/** The take is unread again: delete + re-insert the share so the trigger writes a fresh notification. */
async function shareFresh() {
  await withDb(async (c) => {
    await c.query('DELETE FROM public.recording_shares WHERE recording_id = $1 AND shared_with_user_id = $2', [IDS.take, memberId]);
    await c.query('INSERT INTO public.recording_shares (recording_id, shared_with_user_id) VALUES ($1, $2)', [IDS.take, memberId]);
    // Only this fixture is unread for the member (no other spec reads the member's notifications);
    // assertions still check this fixture's row in the database, the bell only for a drop.
    await c.query('UPDATE public.notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL AND recording_id <> $2', [memberId, IDS.take]);
  });
}

test.beforeAll(async ({}, testInfo) => {
  if (!/mobile/.test(testInfo.project.name)) return;
  await withDb(async (client) => {
    const profile = async (email: string) => {
      const { rows } = await client.query<{ id: string }>('SELECT id FROM public.profiles WHERE email = $1', [email]);
      if (!rows[0]) throw new Error(`Seeded profile missing: ${email}`);
      return rows[0].id;
    };
    const owner = await profile(ROLES.gatekeeper.email);
    memberId = await profile(ROLES.member.email);
    await client.query(
      `INSERT INTO public.compositions (id, title, original_author, owner_id, is_public)
       VALUES ($1, $2, 'E2E Author', $3, true)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, owner_id = EXCLUDED.owner_id`,
      [IDS.song, SONG_TITLE, owner]
    );
    await client.query(
      `INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, contributor_id)
       VALUES ($1, $2, 'E2E Version', '{title: E2E}', $3)
       ON CONFLICT (id) DO UPDATE SET contributor_id = EXCLUDED.contributor_id`,
      [IDS.version, IDS.song, owner]
    );
    await client.query(
      `INSERT INTO public.user_recordings (id, user_id, song_version_id, recording_name, storage_path, duration_seconds)
       VALUES ($1, $2, $3, $4, $5, 42)
       ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, recording_name = EXCLUDED.recording_name`,
      [IDS.take, owner, IDS.version, TAKE_NAME, `e2e-shared-with-me/${IDS.take}.webm`]
    );
  });
  await shareFresh();
});

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(!/mobile/.test(testInfo.project.name), 'phone project only (shared notification state)');
  await page.addInitScript(([k, v]) => localStorage.setItem(k, v), [LOCALE_KEY, 'en']);
});

const bell = (page: Page) => page.getByRole('button', { name: /^Notifications/ });
/** Is this fixture's notification read? Other specs add unread notifications of their own, so the badge total is not a safe signal alone. */
async function takeNotificationRead(): Promise<boolean> {
  return withDb(async (c) => {
    const { rows } = await c.query<{ read_at: string | null }>(
      'SELECT read_at FROM public.notifications WHERE recording_id = $1 AND user_id = $2',
      [IDS.take, memberId]
    );
    return rows.length === 1 && rows[0].read_at !== null;
  });
}

async function bellUnread(page: Page): Promise<number> {
  const label = (await bell(page).getAttribute('aria-label')) ?? '';
  return Number(/\((\d+) unread\)/.exec(label)?.[1] ?? 0);
}

test('the bell and the account menu say there is a new shared take; Library pages have no "Shared with me" row', async ({ page }) => {
  await page.goto('/library/playlists');

  await expect(bell(page)).toHaveAttribute('aria-label', /\(\d+ unread\)/, { timeout: 15_000 });

  // #488 owner review: no row under the Library tabs (Home and the account menu lead there).
  for (const path of ['/library/playlists', '/library/smart', '/library/recently-viewed', '/library/new', '/library/artists']) {
    if (path !== '/library/playlists') await page.goto(path);
    await expect(page.getByRole('navigation', { name: 'Library' }).first()).toBeVisible();
    await expect(page.getByTestId('library-shared-link'), path).toHaveCount(0);
  }

  // Account menu: the same entry and count; the avatar has no second badge.
  await page.getByRole('button', { name: 'Account menu' }).click();
  const menuEntry = page.getByTestId('user-menu-shared-with-me');
  await expect(menuEntry).toContainText('Shared with me');
  await expect(page.getByTestId('user-menu-shared-unread')).toHaveText(/^\d+ new$/);
  expect((await menuEntry.boundingBox())!.height).toBeGreaterThanOrEqual(44);
});

test('"Shared with me" lists the song with the sharer; opening it and the Practice drawer clears the badge', async ({ page }) => {
  await page.goto('/library/shared');

  const row = page.getByTestId('shared-with-me-row').filter({ hasText: SONG_TITLE });
  await expect(row).toHaveCount(1, { timeout: 15_000 });
  await expect(row).toContainText('Shared by Local Gatekeeper');
  await expect(row).toContainText(TAKE_NAME);
  await expect(row.getByTestId('shared-with-me-unread')).toHaveText('New');
  await expect(row).toBeVisible();
  expect((await row.boundingBox())!.height).toBeGreaterThanOrEqual(44);

  await expect.poll(() => bellUnread(page), { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
  const before = await bellUnread(page);
  expect(await takeNotificationRead()).toBe(false);

  await row.click();
  // The take's deep link opens the song with its Practice drawer.
  await expect(page).toHaveURL(new RegExp(`/songs/${IDS.song}\\?recording=${IDS.take}`), { timeout: 20_000 });
  await expect(page.getByTestId('practice-drawer')).toBeVisible({ timeout: 15_000 });
  await expect.poll(() => bellUnread(page), { timeout: 15_000 }).toBeLessThan(before);
  await expect.poll(takeNotificationRead, { timeout: 15_000 }).toBe(true);

  // The list now shows the take as read.
  await page.goto('/library/shared');
  await expect(page.getByTestId('shared-with-me-row').filter({ hasText: SONG_TITLE })).toHaveCount(1);
  await expect(page.getByTestId('shared-with-me-unread')).toHaveCount(0);
});

test('opening Practice on the song page marks that song read and drops the bell badge', async ({ page }) => {
  await shareFresh();
  await page.goto(`/songs/${IDS.song}`);
  await expect.poll(() => bellUnread(page), { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
  const before = await bellUnread(page);
  expect(await takeNotificationRead()).toBe(false);

  await clickPractice(page);
  await expect(page.getByTestId('practice-drawer')).toBeVisible({ timeout: 10_000 });
  await expect.poll(() => bellUnread(page), { timeout: 15_000 }).toBeLessThan(before);

  // Persisted: read in the database, and still read after a reload.
  await expect.poll(takeNotificationRead, { timeout: 15_000 }).toBe(true);
  await page.reload();
  await expect.poll(() => bellUnread(page), { timeout: 15_000 }).toBeLessThan(before);
});

test.describe('guest', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('a guest is asked to sign in on "Shared with me"', async ({ page }) => {
    await page.goto('/library/shared');
    await expect(page.getByTestId('guest-gate')).toHaveAttribute('data-feature', 'sharedWithMe');
    await expect(page.getByTestId('guest-gate-sign-in')).toHaveAttribute('href', '/auth/login?next=%2Flibrary%2Fshared');
  });
});
