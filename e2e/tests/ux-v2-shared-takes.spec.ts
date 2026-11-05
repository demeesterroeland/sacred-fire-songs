import { test, expect, type Page } from '@playwright/test';
import pg from 'pg';
import { ROLES } from '../fixtures/roles';
import { clickPractice } from '../fixtures/songActions';
import { SHARED_TAKES_FIXTURE_IDS as IDS } from '../fixtures/ids';

/**
 * Story 6.1.15 / G4.2 (#399), UXD-3: takes shared with me are listed apart from
 * my own takes. Gherkin: docs/testing/ux-v2-shared-takes.feature (@e2e).
 *
 * No seeded account has received a shared take, so the spec inserts one under
 * fixed ids (gatekeeper owns it and shares it with the member). Both projects
 * upsert the same rows; e2e/global-teardown.ts removes them.
 */
test.use({ storageState: ROLES.member.storage, viewport: { width: 390, height: 844 } });
test.describe.configure({ timeout: 90_000 });

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const SONG_TITLE = 'E2E Shared Takes Song';
const OWN_TAKE = 'E2E My Own Take';
const SHARED_TAKE = 'E2E Gatekeeper Take';

test.beforeAll(async () => {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    const profile = async (email: string) => {
      const { rows } = await client.query<{ id: string }>('SELECT id FROM public.profiles WHERE email = $1', [email]);
      if (!rows[0]) throw new Error(`Seeded profile missing: ${email}`);
      return rows[0].id;
    };
    const owner = await profile(ROLES.gatekeeper.email);
    const member = await profile(ROLES.member.email);

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
    const take = (id: string, user: string, name: string) =>
      client.query(
        `INSERT INTO public.user_recordings (id, user_id, song_version_id, recording_name, storage_path, duration_seconds)
         VALUES ($1, $2, $3, $4, $5, 42)
         ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, recording_name = EXCLUDED.recording_name`,
        [id, user, IDS.version, name, `e2e-shared-takes/${id}.webm`]
      );
    await take(IDS.sharedTake, owner, SHARED_TAKE);
    await take(IDS.ownTake, member, OWN_TAKE);
    await client.query(
      `INSERT INTO public.recording_shares (recording_id, shared_with_user_id)
       VALUES ($1, $2) ON CONFLICT (recording_id, shared_with_user_id) DO NOTHING`,
      [IDS.sharedTake, member]
    );
  } finally {
    await client.end();
  }
});

async function openRecordTab(page: Page) {
  await page.goto(`/songs/${IDS.song}`);
  await clickPractice(page);
  await expect(page.locator('h3:has-text("Practice")')).toBeVisible({ timeout: 10_000 });
  // A song without reference tracks opens on Record and has no tab bar.
  const recordTab = page.locator('[data-testid="practice-tab-record"]');
  if (await recordTab.count()) await recordTab.first().click({ force: true });
}

test('a take shared with me is listed under "Shared with me", not under "My takes"', async ({ page }) => {
  await openRecordTab(page);

  const body = page.getByTestId('rehearsal-drawer-body');
  const shared = body.getByTestId('shared-takes');
  await expect(shared).toBeVisible({ timeout: 15_000 });
  await expect(shared.getByRole('heading', { name: 'Shared with me' })).toBeVisible();

  const sharedRow = shared.locator('[data-recording-id]', { hasText: SHARED_TAKE });
  await expect(sharedRow).toHaveCount(1);
  await expect(sharedRow.getByTestId('shared-by')).toHaveText('Shared by Local Gatekeeper');

  // Listen only: no menu with share / download / delete on a shared row.
  await expect(sharedRow.locator('button[aria-label="More actions"]')).toHaveCount(0);
  await expect(sharedRow.getByRole('button', { name: /download|delete|share/i })).toHaveCount(0);

  // My takes lists my own take and not the shared one.
  const mine = body.locator('section', { has: page.getByRole('heading', { name: 'My takes' }) });
  await expect(mine.locator('[data-recording-id]', { hasText: OWN_TAKE })).toHaveCount(1);
  await expect(mine.locator('[data-recording-id]', { hasText: SHARED_TAKE })).toHaveCount(0);
  // The own row keeps its actions.
  await expect(mine.locator('[data-recording-id]', { hasText: OWN_TAKE }).locator('button[aria-label="More actions"]')).toHaveCount(1);
});
