import { test, expect, type Page } from '@playwright/test';
import pg from 'pg';
import { ROLES } from '../fixtures/roles';
import { clickPractice } from '../fixtures/songActions';
import { TAKE_STATUS_FIXTURE_IDS as IDS } from '../fixtures/ids';

/**
 * Story 6.1.16 / G4.3 (#400): take status is readable text, not a tooltip.
 * Gherkin: docs/testing/ux-v2-take-status.feature (@e2e).
 *
 * The member owns a public take that is shared with two people and attributed to a
 * singer without an account. Fixed ids; e2e/global-teardown.ts removes the rows.
 */
test.use({ storageState: ROLES.member.storage, viewport: { width: 390, height: 844 } });
test.describe.configure({ timeout: 90_000 });

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const SONG_TITLE = 'E2E Take Status Song';
const TAKE = 'E2E Status Take';

test.beforeAll(async () => {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    const profile = async (email: string) => {
      const { rows } = await client.query<{ id: string }>('SELECT id FROM public.profiles WHERE email = $1', [email]);
      if (!rows[0]) throw new Error(`Seeded profile missing: ${email}`);
      return rows[0].id;
    };
    const member = await profile(ROLES.member.email);
    const gatekeeper = await profile(ROLES.gatekeeper.email);
    const musician = await profile(ROLES.musician.email);

    await client.query(
      `INSERT INTO public.compositions (id, title, original_author, owner_id, is_public)
       VALUES ($1, $2, 'E2E Author', $3, true)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, owner_id = EXCLUDED.owner_id`,
      [IDS.song, SONG_TITLE, member]
    );
    await client.query(
      `INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, contributor_id)
       VALUES ($1, $2, 'E2E Version', '{title: E2E}', $3)
       ON CONFLICT (id) DO UPDATE SET contributor_id = EXCLUDED.contributor_id`,
      [IDS.version, IDS.song, member]
    );
    await client.query(
      `INSERT INTO public.user_recordings
         (id, user_id, song_version_id, recording_name, storage_path, duration_seconds,
          is_public, singer_consent_confirmed, singer_name)
       VALUES ($1, $2, $3, $4, $5, 42, true, true, 'E2E Ana')
       ON CONFLICT (id) DO UPDATE SET is_public = true, singer_name = 'E2E Ana', recording_name = EXCLUDED.recording_name`,
      [IDS.take, member, IDS.version, TAKE, `e2e-take-status/${IDS.take}.webm`]
    );
    for (const user of [gatekeeper, musician]) {
      await client.query(
        `INSERT INTO public.recording_shares (recording_id, shared_with_user_id)
         VALUES ($1, $2) ON CONFLICT (recording_id, shared_with_user_id) DO NOTHING`,
        [IDS.take, user]
      );
    }
  } finally {
    await client.end();
  }
});

async function openRecordTab(page: Page) {
  await page.goto(`/songs/${IDS.song}`);
  await clickPractice(page);
  await expect(page.getByTestId('practice-drawer')).toBeVisible({ timeout: 10_000 });
  const recordTab = page.locator('[data-testid="practice-tab-record"]');
  if (await recordTab.count()) await recordTab.first().click({ force: true });
}

test('take status: a public take shared with two people says so in words', async ({ page }) => {
  await openRecordTab(page);

  const row = page.locator('[data-recording-id]', { hasText: TAKE });
  await expect(row).toHaveCount(1, { timeout: 15_000 });
  const status = row.getByTestId('take-status');
  await expect(status.getByText('Public', { exact: true })).toBeVisible();
  await expect(status.getByText('Shared · 2', { exact: true })).toBeVisible();
  await expect(status.getByText('Pending invite', { exact: true })).toBeVisible();

  // Touch has no hover: no status relies on a title tooltip, and the text is at least 12 px.
  await expect(row.locator('[title="Public"], [title^="Shared with"], [title="Pending Invite"]')).toHaveCount(0);
  const px = await status.getByText('Public', { exact: true }).evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(px).toBeGreaterThanOrEqual(12);
});
