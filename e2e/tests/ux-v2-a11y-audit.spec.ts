import { test, expect, type Locator, type Page } from '@playwright/test';
import { songMenuButton } from '../fixtures/songMenu';
import AxeBuilder from '@axe-core/playwright';
import pg from 'pg';
import { ROLES } from '../fixtures/roles';
import { clickPractice, expectPracticeStaysOpen } from '../fixtures/songActions';
import { A11Y_AUDIT_FIXTURE_IDS as IDS } from '../fixtures/ids';

/**
 * Story 6.1.34 / G9.2 (#418): the song page and the Practice panel pass an accessibility audit.
 * Gherkin: docs/testing/ux-v2-a11y-audit.feature (@e2e).
 *
 * Part 1: axe-core (WCAG 2.0/2.1/2.2 A + AA + best practice) on the song page, the Practice panel
 * (Listen and Record tab) and every sheet or dialog opened from the song page or the Practice panel
 * (take actions, Make public, Share, Singer Attribution, playlist, reading tools, song menu, recorder states
 * and the delete confirmation), as guest and as member, light and dark, 390 px. Zero serious or critical violations; nothing is excluded.
 * Part 2: keyboard journeys: dialogs hold focus and give it back, controls have names, state
 * changes are announced.
 *
 * The member owns a public song with one private and one public take. Fixed ids;
 * e2e/global-teardown.ts removes the rows. Nothing is saved while the tests run.
 */
test.use({
  viewport: { width: 390, height: 844 },
  permissions: ['microphone'],
  launchOptions: {
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  },
});
test.describe.configure({ timeout: 90_000 });

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const SONG_TITLE = 'E2E Accessibility Song';
const PLAYER_SONG_TITLE = 'E2E Accessibility Player Song';
const PRIVATE_TAKE = 'E2E A11y Private Take';
const PUBLIC_TAKE = 'E2E A11y Public Take';
const THEMES = ['light', 'dark'] as const;
type Theme = (typeof THEMES)[number];

test.beforeEach(({}, testInfo) => {
  test.skip(!/mobile/.test(testInfo.project.name), 'phone project only');
});

test.beforeAll(async ({}, testInfo) => {
  if (!/mobile/.test(testInfo.project.name)) return;
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    // Workers run this in parallel: one at a time, so the fixed rows are not inserted twice.
    await client.query('SELECT pg_advisory_lock(3634418)');
    const { rows } = await client.query<{ id: string }>('SELECT id FROM public.profiles WHERE email = $1', [ROLES.member.email]);
    if (!rows[0]) throw new Error(`Seeded profile missing: ${ROLES.member.email}`);
    const member = rows[0].id;
    await client.query(
      `INSERT INTO public.compositions (id, title, original_author, owner_id, is_public)
       VALUES ($1, $2, 'E2E Author', $3, true)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, owner_id = EXCLUDED.owner_id, is_public = true`,
      [IDS.song, SONG_TITLE, member]
    );
    await client.query(
      `INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, contributor_id)
       VALUES ($1, $2, 'E2E Version', $3, $4)
       ON CONFLICT (id) DO UPDATE SET contributor_id = EXCLUDED.contributor_id, content_chordpro = EXCLUDED.content_chordpro`,
      [IDS.version, IDS.song, '{title: E2E Accessibility Song}\n[Am]Fire in the [G]heart of the [C]mountain\n[Am]Sing with the [G]fire tonight', member]
    );
    await client.query(
      `INSERT INTO public.compositions (id, title, original_author, owner_id, is_public)
       VALUES ($1, $2, 'E2E Author', $3, true)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, owner_id = EXCLUDED.owner_id, is_public = true`,
      [IDS.playerSong, PLAYER_SONG_TITLE, member]
    );
    await client.query(
      `INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, contributor_id, youtube_url)
       VALUES ($1, $2, 'E2E Version', $3, $4, 'https://www.youtube.com/watch?v=aqz-KE-bpKQ')
       ON CONFLICT (id) DO UPDATE SET contributor_id = EXCLUDED.contributor_id, content_chordpro = EXCLUDED.content_chordpro, youtube_url = EXCLUDED.youtube_url`,
      [IDS.playerVersion, IDS.playerSong, '{title: E2E Accessibility Player Song}\n[Am]Fire in the [G]heart', member]
    );
    const take = (id: string, name: string, isPublic: boolean) =>
      client.query(
        `INSERT INTO public.user_recordings
           (id, user_id, song_version_id, recording_name, storage_path, duration_seconds, is_public, singer_consent_confirmed)
         VALUES ($1, $2, $3, $4, $5, 42, $6, $6)
         ON CONFLICT (id) DO UPDATE SET is_public = EXCLUDED.is_public, singer_consent_confirmed = EXCLUDED.is_public, recording_name = EXCLUDED.recording_name`,
        [id, member, IDS.version, name, `e2e-a11y-audit/${id}.webm`, isPublic]
      );
    await take(IDS.privateTake, PRIVATE_TAKE, false);
    await take(IDS.publicTake, PUBLIC_TAKE, true);
  } finally {
    await client.query('SELECT pg_advisory_unlock(3634418)').catch(() => undefined);
    await client.end();
  }
});

// ---------------------------------------------------------------------------
// helpers

async function setTheme(page: Page, theme: Theme) {
  await page.emulateMedia({ colorScheme: theme });
  await page.addInitScript((value) => {
    localStorage.setItem('sacred-fire-songs-locale', 'en');
    const key = 'sacred-fire-songs-preferences';
    const prefs = JSON.parse(localStorage.getItem(key) || '{}');
    localStorage.setItem(key, JSON.stringify({ ...prefs, theme: value }));
  }, theme);
}

async function settle(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

/** The result of each audited state, for the audit report (printed once per test). */
async function audit(page: Page, where: string) {
  await settle(page);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze();
  const describe = (v: (typeof results.violations)[number]) =>
    `${v.id} [${v.impact}] ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')} — ${v.help}`;
  const blocking = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  const other = results.violations.filter((v) => v.impact !== 'serious' && v.impact !== 'critical');
  console.log(
    `AXE ${where}: ${results.passes.length} rules passed, ${blocking.length} serious/critical, ${other.length} minor/moderate` +
      (other.length ? `\n  minor/moderate: ${other.map(describe).join('\n  ')}` : '')
  );
  expect(blocking.map(describe), `${where}: serious or critical axe violations`).toEqual([]);
  expect(other.map(describe), `${where}: minor or moderate axe violations`).toEqual([]);
}

const drawer = (page: Page) => page.getByTestId('practice-drawer');

async function openPractice(page: Page, tab?: 'listen' | 'record') {
  const dlg = drawer(page);
  // The first tap can land before the page hydrates: tap again until the drawer is open.
  await expect(async () => {
    if (!(await dlg.isVisible())) await clickPractice(page, 5_000);
    await expect(dlg).toBeVisible({ timeout: 2_500 });
  }).toPass({ timeout: 20_000 });
  // A member without a reference track has no tabs: the recorder is all there is.
  if (tab && (await page.getByRole('tablist').count()) > 0) {
    const tabButton = page.getByTestId(tab === 'listen' ? 'practice-tab-listen' : 'practice-tab-record');
    await expect(async () => {
      await tabButton.click({ force: true });
      await expect(tabButton).toHaveAttribute('aria-selected', 'true', { timeout: 1_500 });
    }).toPass({ timeout: 15_000 });
  }
  await expect(page.locator('[data-testid="rehearsal-drawer-body"] .animate-spin:visible')).toHaveCount(0, { timeout: 15_000 });
  // The drawer finishes its slide (spring) before it is audited.
  await page.waitForFunction(() => {
    const el = document.querySelector('[data-testid="practice-drawer"]');
    return !!el && Math.abs(el.getBoundingClientRect().bottom - window.innerHeight) < 2;
  });
  return dlg;
}

const confirmation = (page: Page) => page.getByRole('alertdialog', { name: 'Delete recording?' });

const takeRow = (page: Page, name: string) => page.locator('[data-recording-id]', { hasText: name });

async function openTakeActions(page: Page): Promise<{ trigger: Locator; sheet: Locator }> {
  await openPractice(page, 'record');
  const trigger = takeRow(page, PRIVATE_TAKE).locator('button[aria-label="More actions"]');
  await expect(trigger).toBeVisible({ timeout: 15_000 });
  await trigger.click();
  const sheet = page.getByRole('dialog', { name: PRIVATE_TAKE });
  await expect(sheet).toBeVisible();
  return { trigger, sheet };
}

const activeIn = (loc: Locator) => loc.evaluate((root) => root.contains(document.activeElement));

// ---------------------------------------------------------------------------
// Part 1: axe-core

for (const theme of THEMES) {
  test.describe(`axe-core, ${theme}`, () => {
    test.describe('guest', () => {
      test.use({ storageState: { cookies: [], origins: [] } });
      test.beforeEach(({ page }) => setTheme(page, theme));

      test(`song page (guest, ${theme}) @smoke`, async ({ page }) => {
        await page.goto(`/songs/${IDS.song}`);
        await expect(page.getByTestId('song-action-bar')).toBeVisible({ timeout: 15_000 });
        await audit(page, `song page / guest / ${theme}`);
      });

      test(`Practice open on Listen with a public take (guest, ${theme})`, async ({ page }) => {
        await page.goto(`/songs/${IDS.song}`);
        await openPractice(page, 'listen');
        await expect(takeRow(page, PUBLIC_TAKE)).toHaveCount(1, { timeout: 15_000 });
        await audit(page, `Practice Listen / guest / ${theme}`);
      });

      test(`Practice open on Record behind the sign-in gate (guest, ${theme})`, async ({ page }) => {
        await page.goto(`/songs/${IDS.song}`);
        await openPractice(page, 'record');
        await expect(page.getByTestId('guest-gate').first()).toBeVisible();
        await audit(page, `Practice Record gate / guest / ${theme}`);
      });

      test(`sign-in sheet of Playlist and the song menu (guest, ${theme})`, async ({ page }) => {
        await page.goto(`/songs/${IDS.song}`);
        await page.getByTestId('song-action-playlist').click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await audit(page, `playlist sign-in sheet / guest / ${theme}`);
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toHaveCount(0);
        await page.getByRole('button', { name: 'More actions' }).first().click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await audit(page, `song menu / guest / ${theme}`);
      });
    });

    test.describe('member', () => {
      test.use({ storageState: ROLES.member.storage });
      test.beforeEach(({ page }) => setTheme(page, theme));

      test(`song page (member, ${theme}) @smoke`, async ({ page }) => {
        await page.goto(`/songs/${IDS.song}`);
        await expect(page.getByTestId('song-action-bar')).toBeVisible({ timeout: 15_000 });
        await audit(page, `song page / member / ${theme}`);
      });

      test(`Practice open on Record with takes (member, ${theme}) @smoke`, async ({ page }) => {
        await page.goto(`/songs/${IDS.song}`);
        await openPractice(page, 'record');
        await expect(takeRow(page, PRIVATE_TAKE)).toHaveCount(1, { timeout: 15_000 });
        await audit(page, `Practice Record / member / ${theme}`);
      });

      test(`recorder: idle, upload and recording (member, ${theme})`, async ({ page }) => {
        await page.goto(`/songs/${IDS.song}`);
        await openPractice(page, 'record');
        await expect(page.getByText('Ready to record')).toBeVisible({ timeout: 15_000 });
        await audit(page, `recorder idle / member / ${theme}`);

        await page.getByRole('button', { name: 'Upload File' }).click();
        await audit(page, `recorder upload / member / ${theme}`);
        await page.getByRole('button', { name: 'Record', exact: true }).click();

        await page.getByRole('switch', { name: 'Count in 3-2-1 before recording' }).uncheck();
        await page.locator('button[title="Start recording"]').click();
        await expect(page.getByText('Recording...')).toBeVisible({ timeout: 5_000 });
        await audit(page, `recorder recording / member / ${theme}`);
        await page.locator('button[title="Cancel and discard"]').click();
        await expect(page.getByText('Ready to record')).toBeVisible();
      });

      test(`take actions sheet (member, ${theme}) @smoke`, async ({ page }) => {
        await page.goto(`/songs/${IDS.song}`);
        await openTakeActions(page);
        await audit(page, `take actions sheet / member / ${theme}`);
      });

      test(`Make public dialog (member, ${theme})`, async ({ page }) => {
        await page.goto(`/songs/${IDS.song}`);
        const { sheet } = await openTakeActions(page);
        await sheet.getByRole('button', { name: 'Make Public' }).click();
        const dialog = page.getByRole('dialog', { name: /Publish Recording Publicly/ });
        await expect(dialog).toBeVisible({ timeout: 10_000 });
        await audit(page, `Make public dialog / member / ${theme}`);
      });

      test(`share and singer dialogs (member, ${theme})`, async ({ page }) => {
        await page.goto(`/songs/${IDS.song}`);
        let { sheet } = await openTakeActions(page);
        await sheet.getByRole('button', { name: 'Share', exact: true }).click();
        const share = page.getByRole('dialog').filter({ hasText: 'Share recording' });
        await expect(share).toBeVisible({ timeout: 10_000 });
        await audit(page, `share dialog / member / ${theme}`);
        await page.keyboard.press('Escape');
        await expect(share).toHaveCount(0);

        await takeRow(page, PRIVATE_TAKE).locator('button[aria-label="More actions"]').click();
        sheet = page.getByRole('dialog', { name: PRIVATE_TAKE });
        await sheet.getByRole('button', { name: 'Singer Attribution' }).click();
        const singer = page.getByRole('dialog').filter({ hasText: 'Singer Attribution' });
        await expect(singer).toBeVisible({ timeout: 10_000 });
        await audit(page, `singer dialog / member / ${theme}`);
      });

      test(`delete confirmation (member, ${theme})`, async ({ page }) => {
        await page.goto(`/songs/${IDS.song}`);
        const { sheet } = await openTakeActions(page);
        await sheet.getByRole('button', { name: 'Delete recording', exact: true }).click();
        await expect(confirmation(page)).toBeVisible({ timeout: 10_000 });
        await audit(page, `delete confirmation / member / ${theme}`);
      });

      test(`playlist sheet (member, ${theme})`, async ({ page }) => {
        await page.goto(`/songs/${IDS.song}`);
        await page.getByTestId('song-action-playlist').click();
        const dialog = page.getByRole('dialog', { name: 'Add to playlist' });
        await expect(dialog).toBeVisible({ timeout: 10_000 });
        await audit(page, `playlist sheet / member / ${theme}`);
      });

      test(`song menu with the reading tools (member, ${theme})`, async ({ page }) => {
        await page.goto(`/songs/${IDS.song}`);
        await expect(songMenuButton(page)).toBeVisible();
        await songMenuButton(page).click();
        await expect(page.getByTestId('song-menu-sheet')).toBeVisible();
        await audit(page, `song menu / member / ${theme}`);
        await page.keyboard.press('Escape');
        await expect(page.getByTestId('song-menu-sheet')).toHaveCount(0);
      });
    });
  });
}

// ---------------------------------------------------------------------------
// Part 2: keyboard journeys, focus order, names and announcements

test.describe('keyboard and screen reader behaviour', () => {
  test.describe('member', () => {
    test.use({ storageState: ROLES.member.storage });

    test('Practice is a labelled dialog: focus moves in, stays in, Escape closes and focus returns @smoke', async ({ page }) => {
      await page.goto(`/songs/${IDS.song}`);
      const opener = page.getByTestId('song-action-practice');
      await expect(opener).toBeVisible({ timeout: 15_000 });
      await expect(async () => {
        await opener.focus();
        await page.keyboard.press('Enter');
        await expect(drawer(page)).toBeVisible({ timeout: 2_500 });
      }).toPass({ timeout: 20_000 });
      const dlg = drawer(page);

      // A modal dialog named after the song; the page behind is out of the tab order.
      await expect(dlg).toHaveAttribute('role', 'dialog');
      await expect(dlg).toHaveAttribute('aria-modal', 'true');
      await expect(page.getByRole('dialog', { name: new RegExp(SONG_TITLE) })).toBeVisible();
      await expect.poll(() => activeIn(dlg)).toBe(true);

      // Tab and Shift+Tab never leave the dialog.
      for (let i = 0; i < 14; i++) {
        await page.keyboard.press('Tab');
        expect(await activeIn(dlg), `Tab ${i + 1} stays inside the Practice dialog`).toBe(true);
      }
      for (let i = 0; i < 14; i++) {
        await page.keyboard.press('Shift+Tab');
        expect(await activeIn(dlg), `Shift+Tab ${i + 1} stays inside the Practice dialog`).toBe(true);
      }

      await page.keyboard.press('Escape');
      await expect(dlg).toBeHidden();
      await expect(opener).toBeFocused();
    });

    test('the close button and the backdrop also give focus back to Practice', async ({ page }) => {
      await page.goto(`/songs/${IDS.song}`);
      await openPractice(page);
      await page.getByRole('button', { name: 'Close' }).first().click();
      await expect(drawer(page)).toBeHidden();
      await expect(page.getByTestId('song-action-practice')).toBeFocused();

      // The backdrop: a tap above the panel closes it too.
      await openPractice(page);
      const top = await drawer(page).evaluate((el) => el.getBoundingClientRect().top);
      expect(top).toBeGreaterThan(8);
      // Playwright refuses the click if something else sits on top of that spot of the backdrop.
      await page.getByTestId('practice-backdrop').click({ position: { x: 195, y: top - 4 } });
      await expect(drawer(page)).toBeHidden();
      await expect(page.getByTestId('song-action-practice')).toBeFocused();
    });

    test('the take actions sheet returns focus to its "More actions" button', async ({ page }) => {
      await page.goto(`/songs/${IDS.song}`);
      const { trigger, sheet } = await openTakeActions(page);
      await expect.poll(() => activeIn(sheet)).toBe(true);
      // Behind the sheet the Practice panel is hidden from assistive technology: one dialog, not two.
      await expect(page.getByRole('dialog')).toHaveCount(1);
      await page.keyboard.press('Escape');
      await expect(sheet).toHaveCount(0);
      await expect(drawer(page)).toBeVisible();
      await expect(trigger).toBeFocused();
    });

    test('Make public: dialog holds focus, Escape closes it, focus stays inside the Practice dialog', async ({ page }) => {
      await page.goto(`/songs/${IDS.song}`);
      const { sheet } = await openTakeActions(page);
      await sheet.getByRole('button', { name: 'Make Public' }).click();
      const dialog = page.getByRole('dialog', { name: /Publish Recording Publicly/ });
      await expect(dialog).toBeVisible({ timeout: 10_000 });
      await expect.poll(() => activeIn(dialog)).toBe(true);
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press('Tab');
        expect(await activeIn(dialog), `Tab ${i + 1} stays inside the dialog`).toBe(true);
      }
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      // Focus is back on the take's "More actions" button, not lost on <body>.
      await expect(takeRow(page, PRIVATE_TAKE).locator('button[aria-label="More actions"]')).toBeFocused();
      await expect(drawer(page)).toBeVisible();
    });

    test('Delete recording: the confirmation takes focus, holds it, Escape closes only it and focus returns', async ({ page }) => {
      await page.goto(`/songs/${IDS.song}`);
      const { trigger, sheet } = await openTakeActions(page);
      await sheet.getByRole('button', { name: 'Delete recording', exact: true }).click();
      const dialog = confirmation(page);
      await expect(dialog).toBeVisible({ timeout: 10_000 });
      await expect(dialog).toContainText('cannot be undone');

      // Focus starts on Cancel (the safe choice); the Practice panel behind is out of the way for screen readers.
      await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
      await expect(page.getByRole('dialog', { name: new RegExp(SONG_TITLE) })).toHaveCount(0);

      // Tab reaches Yes, delete and wraps back to Cancel; Shift+Tab goes the other way. Never out of the dialog.
      await page.keyboard.press('Tab');
      await expect(dialog.getByRole('button', { name: 'Yes, Delete' })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(dialog.getByRole('button', { name: 'Yes, Delete' })).toBeFocused();
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Tab');
        expect(await activeIn(dialog), `Tab ${i + 1} stays inside the confirmation`).toBe(true);
      }

      // Escape closes the confirmation only: the Practice panel stays and focus returns to the take's menu button.
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expectPracticeStaysOpen(page);
      await expect(takeRow(page, PRIVATE_TAKE)).toHaveCount(1);
      await expect(trigger).toBeFocused();
    });

    test('Delete recording: Cancel and a tap on the backdrop keep the take', async ({ page }) => {
      await page.goto(`/songs/${IDS.song}`);
      let { sheet } = await openTakeActions(page);
      await sheet.getByRole('button', { name: 'Delete recording', exact: true }).click();
      await expect(confirmation(page)).toBeVisible({ timeout: 10_000 });
      await confirmation(page).getByRole('button', { name: 'Cancel' }).click();
      await expect(confirmation(page)).toHaveCount(0);
      await expect(takeRow(page, PRIVATE_TAKE)).toHaveCount(1);

      await takeRow(page, PRIVATE_TAKE).locator('button[aria-label="More actions"]').click();
      sheet = page.getByRole('dialog', { name: PRIVATE_TAKE });
      await sheet.getByRole('button', { name: 'Delete recording', exact: true }).click();
      await expect(confirmation(page)).toBeVisible({ timeout: 10_000 });
      await page.mouse.click(10, 10);
      await expect(confirmation(page)).toHaveCount(0);
      await expectPracticeStaysOpen(page);
      await expect(takeRow(page, PRIVATE_TAKE)).toHaveCount(1);
    });

    test('renaming a take: Escape ends the edit and keeps the Practice panel open', async ({ page }) => {
      await page.goto(`/songs/${IDS.song}`);
      const { sheet } = await openTakeActions(page);
      await sheet.getByRole('button', { name: 'Edit recording name', exact: true }).click();
      const input = page.locator('input[aria-label="Edit recording name"]');
      await expect(input).toBeFocused();
      await input.fill('Not saved');
      await page.keyboard.press('Escape');
      await expect(input).toHaveCount(0);
      await expectPracticeStaysOpen(page);
      await expect(takeRow(page, PRIVATE_TAKE)).toHaveCount(1); // the old name is back; nothing was saved
      // A second Escape (no edit left) closes the panel.
      await page.locator('[data-testid="practice-drawer"]').focus();
      await page.keyboard.press('Escape');
      await expect(drawer(page)).toBeHidden();
    });

    test('reordering takes with the keyboard: Escape cancels the drag only, the next Escape closes the panel', async ({ page }) => {
      await page.goto(`/songs/${IDS.song}`);
      await openPractice(page, 'record');
      const rows = drawer(page).locator('[data-recording-id]');
      await expect(rows).toHaveCount(2, { timeout: 15_000 });
      const names = () => rows.evaluateAll((els) => els.map((el) => el.getAttribute('data-recording-id')));
      const before = await names();
      const handle = rows.first().getByRole('button', { name: 'Drag to reorder' });
      await expect(handle).toBeVisible();
      await handle.focus();
      await page.keyboard.press('Space'); // pick up
      await expect(handle).toHaveAttribute('aria-pressed', 'true');
      // dnd-kit starts listening for arrows and Escape one task after the drag starts, so keys pressed at once are
      // lost. Press ArrowDown until the announcement says the take moved over the *other* take (at the start it
      // names the take itself).
      const draggedId = (await rows.first().getAttribute('data-recording-id'))!;
      const live = page.locator('[id^="DndLiveRegion"]');
      await expect(async () => {
        await page.keyboard.press('ArrowDown');
        await expect(live).toContainText(/was moved over droppable area/i, { timeout: 1_000 });
        await expect(live).not.toContainText(`droppable area ${draggedId}`, { timeout: 1_000 });
      }).toPass({ timeout: 10_000 });
      await page.keyboard.press('Escape'); // cancel the drag
      await expectPracticeStaysOpen(page); // Escape went to the drag, not to the panel
      await expect(handle).not.toHaveAttribute('aria-pressed', 'true');
      await expect(live).toContainText(/cancelled/i);
      expect(await names()).toEqual(before); // nothing moved
      // No drag left: Escape closes the panel as before.
      await handle.focus();
      await page.keyboard.press('Escape');
      await expect(drawer(page)).toBeHidden();
      await expect(page.getByTestId('song-action-practice')).toBeFocused();
    });

    test('Listen: Tab goes on to the embedded player, and leaving it never strands focus outside the panel', async ({ page }) => {
      await page.goto(`/songs/${IDS.playerSong}`);
      await openPractice(page, 'listen');
      const dlg = drawer(page);
      const player = dlg.locator('iframe');
      await expect(player).toHaveCount(1, { timeout: 15_000 });
      // The embedded page may take focus itself once it loads (or not, offline): start from a known control.
      await page.getByTestId('practice-tab-listen').focus();

      // The provider button used to be the last stop: Tab wrapped to Close and the player was never reached.
      // Now Tab goes past it, into the player. (A player that cannot load, as without a network, has nothing to
      // focus, so focus may pass straight through it and out of the page.)
      let pastProvider = false;
      const trail: string[] = [];
      for (let i = 0; i < 20 && !pastProvider; i++) {
        await page.keyboard.press('Tab');
        const inside = await activeIn(dlg);
        const onPlayer = await player.evaluate((el) => document.activeElement === el);
        trail.push(await page.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName}:${a.getAttribute('aria-label') || a.getAttribute('title') || (a.textContent || '').slice(0, 20)}` : 'null'; }));
        pastProvider = onPlayer || !inside;
      }
      expect(pastProvider, `Tab goes past the last control into the player; trail ${trail.join(' > ')}`).toBe(true);

      // Keys pressed inside a third-party player never reach the page, so Tab may carry focus out of it (to the
      // browser's own toolbar, or the top of the page). Within a few more presses it is back in the panel.
      let back = false;
      for (let i = 0; i < 4 && !back; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
        back = await activeIn(dlg);
      }
      expect(back, 'focus is back inside the Practice dialog').toBe(true);
    });

    test('the playlist sheet returns focus to Playlist', async ({ page }) => {
      await page.goto(`/songs/${IDS.song}`);
      const opener = page.getByTestId('song-action-playlist');
      await expect(async () => {
        await opener.focus();
        await page.keyboard.press('Enter');
        await expect(page.getByRole('dialog', { name: 'Add to playlist' })).toBeVisible({ timeout: 2_500 });
      }).toPass({ timeout: 20_000 });
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(opener).toBeFocused();
    });

    test('the song menu (⋯) is a dialog with a name; Escape returns focus to ⋯', async ({ page }) => {
      await page.goto(`/songs/${IDS.song}`);
      const opener = page.getByRole('button', { name: 'More actions' }).first();
      await expect(async () => {
        await opener.focus();
        await page.keyboard.press('Enter');
        await expect(page.getByRole('dialog', { name: SONG_TITLE })).toBeVisible({ timeout: 2_500 });
      }).toPass({ timeout: 20_000 });
      await expect.poll(() => activeIn(page.getByRole('dialog'))).toBe(true);
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(opener).toBeFocused();
    });

    test('song menu → Delete → Escape: focus returns to ⋯ (the song is kept)', async ({ page }) => {
      await page.goto(`/songs/${IDS.song}`);
      const opener = page.getByRole('button', { name: 'More actions' }).first();
      await expect(async () => {
        await opener.focus();
        await page.keyboard.press('Enter');
        await expect(page.getByRole('dialog', { name: SONG_TITLE })).toBeVisible({ timeout: 2_500 });
      }).toPass({ timeout: 20_000 });
      await page.getByRole('dialog', { name: SONG_TITLE }).getByRole('button', { name: /delete/i }).click();
      const confirm = page.getByRole('alertdialog');
      await expect(confirm).toBeVisible();
      await expect(confirm.getByRole('button', { name: 'Cancel' })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(confirm).toHaveCount(0);
      await expect(opener).toBeFocused();
    });

    test('Share and Singer dialogs: Escape returns focus to the take\'s "More actions" button', async ({ page }) => {
      await page.goto(`/songs/${IDS.song}`);
      const { trigger, sheet } = await openTakeActions(page);
      await sheet.getByRole('button', { name: 'Share', exact: true }).click();
      const share = page.getByRole('dialog').filter({ hasText: 'Share recording' });
      await expect(share).toBeVisible({ timeout: 10_000 });
      await page.keyboard.press('Escape');
      await expect(share).toHaveCount(0);
      await expect(trigger).toBeFocused();

      await trigger.click();
      await page.getByRole('dialog', { name: PRIVATE_TAKE }).getByRole('button', { name: 'Singer Attribution' }).click();
      const singer = page.getByRole('dialog').filter({ hasText: 'Singer Attribution' });
      await expect(singer).toBeVisible({ timeout: 10_000 });
      await page.keyboard.press('Escape');
      await expect(singer).toHaveCount(0);
      await expect(trigger).toBeFocused();
    });

    test('the heart is a toggle button that announces its state', async ({ page }) => {
      await page.goto(`/songs/${IDS.song}`);
      const heart = page.getByTestId('song-action-favorite');
      await expect(heart).toBeVisible({ timeout: 15_000 });
      await expect(heart).toHaveAttribute('aria-pressed', /true|false/);
    });

    test('the recorder announces its state and every control has a name', async ({ page }) => {
      await page.goto(`/songs/${IDS.song}`);
      await openPractice(page, 'record');
      await expect(page.getByText('Ready to record')).toBeVisible({ timeout: 15_000 });
      await page.getByRole('switch', { name: 'Count in 3-2-1 before recording' }).uncheck();

      const status = page.getByRole('status').filter({ hasText: /Ready to record|Recording\.\.\.|Recording paused|Review your recording/ });
      await expect(status).toHaveText(/Ready to record/);
      await page.locator('button[title="Start recording"]').click();
      await expect(status).toHaveText(/Recording\.\.\./, { timeout: 5_000 });
      await page.getByRole('button', { name: 'Pause recording' }).click();
      await expect(status).toHaveText(/Recording paused/);
      await page.getByRole('button', { name: 'Resume recording' }).click();
      await expect(status).toHaveText(/Recording\.\.\./);

      // While recording, every button in the dialog has an accessible name.
      const unnamed = await drawer(page).evaluate((root) =>
        [...root.querySelectorAll<HTMLElement>('button, [role="button"], input, select')]
          .filter((el) => el.offsetParent !== null && !el.closest('[inert],[aria-hidden="true"]'))
          .filter((el) => {
            const name = (el.getAttribute('aria-label') ?? '').trim() || (el.textContent ?? '').trim() || (el.getAttribute('title') ?? '').trim() || (el as HTMLInputElement).labels?.[0]?.textContent?.trim();
            return !name;
          })
          .map((el) => el.outerHTML.slice(0, 120))
      );
      expect(unnamed).toEqual([]);

      await page.locator('button[title="Cancel and discard"]').click();
      await expect(status).toHaveText(/Ready to record/);
    });

    test('the file upload is reachable and usable with the keyboard', async ({ page }) => {
      await page.goto(`/songs/${IDS.song}`);
      await openPractice(page, 'record');
      await page.getByRole('button', { name: 'Upload File' }).click();
      const choose = drawer(page).getByRole('button', { name: /select an audio file/i });
      await expect(choose).toBeVisible();
      await choose.focus();
      await expect(choose).toBeFocused();
      // Watch the hidden file input instead of Chrome's file chooser: Chrome suppresses the chooser when the
      // window is under 400x300 and can drop it under load, so the chooser event made this check flaky. The
      // input being clicked is what opens the chooser.
      await page.evaluate(() => {
        const input = document.querySelector<HTMLInputElement>('[data-testid="practice-drawer"] input[type="file"]');
        (window as unknown as { __fileInputClicks: number }).__fileInputClicks = 0;
        input?.addEventListener('click', (e) => {
          e.preventDefault();
          (window as unknown as { __fileInputClicks: number }).__fileInputClicks++;
        });
      });
      await page.keyboard.press('Enter');
      await expect
        .poll(() => page.evaluate(() => (window as unknown as { __fileInputClicks: number }).__fileInputClicks))
        .toBe(1);
    });
  });

  test.describe('guest', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('Listen and Record are tabs: arrow keys move between them and the state is announced', async ({ page }) => {
      await page.goto(`/songs/${IDS.song}`);
      await openPractice(page);
      const tablist = drawer(page).getByRole('tablist');
      await expect(tablist).toBeVisible();
      const listen = page.getByTestId('practice-tab-listen');
      const record = page.getByTestId('practice-tab-record');
      await expect(listen).toHaveAttribute('role', 'tab');
      await expect(listen).toHaveAttribute('aria-selected', 'true');
      await expect(record).toHaveAttribute('aria-selected', 'false');
      // Roving tabindex: only the selected tab is in the Tab order.
      await expect(listen).toHaveAttribute('tabindex', '0');
      await expect(record).toHaveAttribute('tabindex', '-1');

      await listen.focus();
      await page.keyboard.press('ArrowRight');
      await expect(record).toBeFocused();
      await expect(record).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByRole('tabpanel')).toBeVisible();
      await page.keyboard.press('ArrowLeft');
      await expect(listen).toBeFocused();
      await expect(listen).toHaveAttribute('aria-selected', 'true');
      await page.keyboard.press('End');
      await expect(record).toBeFocused();
      await page.keyboard.press('Home');
      await expect(listen).toBeFocused();
    });

    test('a guest take row: play button names the action and the row can be reached with Tab', async ({ page }) => {
      await page.goto(`/songs/${IDS.song}`);
      await openPractice(page, 'listen');
      const row = takeRow(page, PUBLIC_TAKE);
      await expect(row).toHaveCount(1, { timeout: 15_000 });
      await expect(row.getByRole('button').first()).toHaveAccessibleName(/.+/);
    });
  });
});
