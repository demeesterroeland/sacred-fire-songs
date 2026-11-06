import { clickPractice } from '../fixtures/songActions';
import { test, expect, type Page } from '@playwright/test';
import pg from 'pg';
import { ROLES } from '../fixtures/roles';
import { TAKE_ACTIONS_FIXTURE_IDS as IDS } from '../fixtures/ids';

/**
 * Story 6.1.17 / G4.4 (#401): the actions of a take open as a grouped bottom sheet.
 * Gherkin: docs/testing/ux-v2-take-actions.feature (@e2e).
 *
 * The member owns one private take. Fixed ids; e2e/global-teardown.ts removes the rows.
 */
test.use({ storageState: ROLES.member.storage, viewport: { width: 390, height: 844 } });
test.describe.configure({ timeout: 90_000 });

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const SONG_TITLE = 'E2E Take Actions Song';
const TAKE = 'E2E Actions Take';

test.beforeAll(async () => {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    const { rows } = await client.query<{ id: string }>('SELECT id FROM public.profiles WHERE email = $1', [ROLES.member.email]);
    if (!rows[0]) throw new Error(`Seeded profile missing: ${ROLES.member.email}`);
    const member = rows[0].id;
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
         (id, user_id, song_version_id, recording_name, storage_path, duration_seconds, is_public)
       VALUES ($1, $2, $3, $4, $5, 42, false)
       ON CONFLICT (id) DO UPDATE SET is_public = false, recording_name = EXCLUDED.recording_name`,
      [IDS.take, member, IDS.version, TAKE, `e2e-take-actions/${IDS.take}.webm`]
    );
  } finally {
    await client.end();
  }
});

async function openRecordTab(page: Page) {
  await page.goto(`/songs/${IDS.song}`);
  await clickPractice(page); // phone: the action bar (#393), not the ⋮ sheet
  await expect(page.getByTestId('practice-drawer')).toBeVisible({ timeout: 10_000 });
  const recordTab = page.locator('[data-testid="practice-tab-record"]');
  if (await recordTab.count()) await recordTab.first().click({ force: true });
}

/** Sheets and dialogs on top of the Practice panel (the panel is itself a dialog, Story 6.1.34 / #418). */
const sheets = (page: Page) => page.locator('[role="dialog"]:not([data-testid="practice-drawer"])');

async function openActions(page: Page) {
  await openRecordTab(page);
  const row = page.locator('[data-recording-id]', { hasText: TAKE });
  await expect(row).toHaveCount(1, { timeout: 15_000 });
  const trigger = row.locator('button[aria-label="More actions"]');
  // The trigger is a 44 px target.
  const box = await trigger.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await trigger.click();
  const sheet = sheets(page);
  await expect(sheet).toBeVisible();
  return { row, sheet };
}

test('grouped actions: Delete sits alone at the bottom and every row is at least 44 px', async ({ page }) => {
  const { sheet } = await openActions(page);

  await expect(sheet.getByText(TAKE, { exact: true })).toBeVisible();
  // The fixture has no audio file: Play says why it is disabled, and so does Download.
  await expect(sheet.getByRole('button')).toHaveText([
    'Audio file missing or corrupted',
    'Edit take name',
    'Download take',
    'Share',
    'Singer Attribution',
    'Make Public',
    'Copy link',
    'Delete take',
  ]);

  const groups = sheet.locator('[role="group"]');
  await expect(groups).toHaveCount(3);
  await expect(groups.nth(2).getByRole('button')).toHaveText(['Delete take']);
  await expect(sheet.getByRole('separator')).toHaveCount(2);

  // Every row >= 44 px; Delete is in the danger colour AND says so in words.
  for (const button of await sheet.getByRole('button').all()) {
    const box = await button.boundingBox();
    expect(box!.height, await button.innerText()).toBeGreaterThanOrEqual(44);
  }
  const share = sheet.getByRole('button', { name: 'Share', exact: true });
  const del = sheet.getByRole('button', { name: 'Delete take', exact: true });
  const color = (l: typeof del) => l.evaluate((el) => getComputedStyle(el).color);
  expect(await color(del)).not.toBe(await color(share));

  // Delete is not next to Share: other rows sit between, plus a separator.
  const shareBox = (await share.boundingBox())!;
  const delBox = (await del.boundingBox())!;
  expect(delBox.y - (shareBox.y + shareBox.height)).toBeGreaterThanOrEqual(3 * 44);

  // The 32 px handle.
  const handle = sheet.locator('[data-sheet-handle]');
  expect((await handle.boundingBox())!.height).toBe(32);
});

test('the sheet closes on a swipe down and on Escape', async ({ page }) => {
  const { sheet } = await openActions(page);
  const handle = (await sheet.locator('[data-sheet-handle]').boundingBox())!;
  const x = handle.x + handle.width / 2;
  const y = handle.y + handle.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + 60, { steps: 4 });
  await page.mouse.move(x, y + 160, { steps: 4 });
  await page.mouse.up();
  await expect(sheets(page)).toHaveCount(0);

  await page.locator('[data-recording-id]', { hasText: TAKE }).locator('button[aria-label="More actions"]').click();
  await expect(sheets(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(sheets(page)).toHaveCount(0);
});

test('choosing Share closes the sheet and opens the share dialog', async ({ page }) => {
  const { sheet } = await openActions(page);
  await sheet.getByRole('button', { name: 'Share', exact: true }).click();
  await expect(sheets(page).filter({ hasText: 'Share take' })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('button', { name: 'Delete take' })).toHaveCount(0);
});

test('choosing Edit take name closes the sheet and focuses the rename field', async ({ page }) => {
  const { sheet } = await openActions(page);
  await sheet.getByRole('button', { name: 'Edit take name', exact: true }).click();
  await expect(sheets(page)).toHaveCount(0);
  const input = page.locator('input[aria-label="Edit take name"]');
  await expect(input).toBeFocused();
  await page.keyboard.press('Escape'); // leave the name unchanged
});

test('Delete still asks for confirmation; cancelling keeps the take', async ({ page }) => {
  const { row, sheet } = await openActions(page);
  await sheet.getByRole('button', { name: 'Delete take', exact: true }).click();
  await expect(sheets(page)).toHaveCount(0);
  await expect(page.getByText('Delete take?')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Delete take?')).toHaveCount(0);
  await expect(row).toHaveCount(1);
});
