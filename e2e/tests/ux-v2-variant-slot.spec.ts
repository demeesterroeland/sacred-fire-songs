import { test, expect as baseExpect, type Page } from '@playwright/test';
import { openSongControls } from '../fixtures/songControls';
import pg from 'pg';
import { ROLES } from '../fixtures/roles';
import { VARIANT_SLOT_FIXTURE_IDS as IDS } from '../fixtures/ids';
import { clickPractice } from '../fixtures/songActions';

// The first render of a song can need a retry of its 4.5 s query on a busy machine.
const expect = baseExpect.configure({ timeout: 15_000 });

// The Practice drawer slides in and out but stays mounted: wait until it is fully in or out of the viewport.
async function drawerSettled(page: Page, open: boolean) {
  const body = page.getByTestId('rehearsal-drawer-body');
  const height = page.viewportSize()!.height;
  await expect
    .poll(async () => {
      const box = await body.boundingBox();
      if (!box) return !open;
      return open ? box.y + box.height <= height + 1 : box.y >= height - 1;
    })
    .toBe(true);
}

async function queryOne<T>(sql: string, params: unknown[]): Promise<T | null> {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    const { rows } = await client.query<T>(sql, params);
    return rows[0] ?? null;
  } finally {
    await client.end();
  }
}

/** Storage path of the Original version's take with this name, or null when there is none. */
async function takeStoragePath(name: string): Promise<string | null> {
  const row = await queryOne<{ storage_path: string }>(
    'SELECT storage_path FROM public.user_recordings WHERE song_version_id = $1 AND recording_name = $2',
    [IDS.original, name]
  );
  return row?.storage_path ?? null;
}

/** How many audio objects the rehearsals bucket still holds at this path. */
async function storedObjects(storagePath: string): Promise<number> {
  const row = await queryOne<{ n: string }>(
    "SELECT count(*)::text AS n FROM storage.objects WHERE bucket_id = 'rehearsals' AND name = $1",
    [storagePath]
  );
  return Number(row?.n ?? 0);
}

/**
 * Story 6.1.11 / G2.6 (#395): the slot under the song title holds a greyscale segmented control
 * for song versions, only when the song has more than one version.
 * Gherkin: docs/testing/ux-v2-variant-slot.feature (@e2e).
 *
 * Fixed-id public fixtures, removed by e2e/global-teardown.ts. Most tests only read them, so desktop
 * and mobile projects can share them; the edit round trip writes to its own song (flags*).
 */
const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

test.use({ viewport: { width: 390, height: 844 } });

test.beforeAll(async () => {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    const { rows } = await client.query<{ id: string }>('SELECT id FROM public.profiles WHERE email = $1', [ROLES.member.email]);
    if (!rows[0]) throw new Error('Seeded member profile missing');
    const owner = rows[0].id;
    for (const [id, title] of [
      [IDS.song, 'E2E Variant Slot Song'],
      [IDS.singleSong, 'E2E Variant Slot Single'],
      [IDS.flagsSong, 'E2E Variant Slot Flags'],
    ]) {
      await client.query(
        `INSERT INTO public.compositions (id, title, original_author, owner_id, is_public)
         VALUES ($1, $2, 'E2E Author', $3, true)
         ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, is_public = true`,
        [id, title, owner]
      );
    }
    // The two versions differ in key and in reference media, so the tests can tell which one is shown.
    const versions: Array<[string, string, string, string, string, string, string | null]> = [
      [IDS.original, IDS.song, 'Original', 'Original verse for the variant slot', '2026-01-01T00:00:00Z', 'Am', null],
      [IDS.simplified, IDS.song, 'Simplified', 'Simplified verse for the variant slot', '2026-01-02T00:00:00Z', 'C', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
      [IDS.singleVersion, IDS.singleSong, 'Standard', 'Single verse for the variant slot', '2026-01-01T00:00:00Z', 'G', null],
      [IDS.flagsOriginal, IDS.flagsSong, 'Original', '[Am]Flags original verse', '2026-01-01T00:00:00Z', 'Am', null],
      [IDS.flagsSimplified, IDS.flagsSong, 'Simplified', 'Flags simplified verse', '2026-01-02T00:00:00Z', 'C', null],
    ];
    for (const [id, song, name, lyric, created, key, youtube] of versions) {
      await client.query(
        `INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, contributor_id, created_at, key, youtube_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET version_name = EXCLUDED.version_name, content_chordpro = EXCLUDED.content_chordpro,
           created_at = EXCLUDED.created_at, key = EXCLUDED.key, youtube_url = EXCLUDED.youtube_url`,
        [id, song, name, lyric, owner, created, key, youtube]
      );
    }
  } finally {
    await client.end();
  }
});

test.beforeEach(async ({ page }) => {
  await openSongControls(page);
  await page.addInitScript(() => localStorage.setItem('sacred-fire-songs-locale', 'en'));
});

test('Single-version song has no control and no extra space', async ({ page }) => {
  await page.goto(`/songs/${IDS.singleSong}`);
  await expect(page.getByText('Single verse for the variant slot')).toBeVisible();
  await expect(page.getByTestId('song-version-switch')).toHaveCount(0);
  await expect(page.getByRole('radiogroup', { name: 'Song version' })).toHaveCount(0);
  // Nothing is reserved: the reader toolbar follows the meta lines at the usual 8 px (mb-2) gap.
  const gap = await page.evaluate(() => {
    const meta = document.querySelector('[data-testid="song-meta-lines"]');
    const wrap = document.querySelector('[data-testid="reader-toolbar-wrap"]');
    if (!meta || !wrap) return -1;
    return wrap.getBoundingClientRect().top - meta.getBoundingClientRect().bottom;
  });
  expect(gap).toBeGreaterThanOrEqual(0);
  expect(gap).toBeLessThanOrEqual(9);
});

test('Switching versions changes the lyrics', async ({ page }) => {
  await page.goto(`/songs/${IDS.song}`);
  const control = page.getByRole('radiogroup', { name: 'Song version' });
  await expect(control).toBeVisible();
  const original = control.getByRole('radio', { name: 'Original' });
  const simplified = control.getByRole('radio', { name: 'Simplified' });
  await expect(original).toBeChecked();
  await expect(page.getByText('Original verse for the variant slot')).toBeVisible();
  await expect(page.getByTestId('song-meta-lines')).toContainText('Key Am');

  // Under the title and the grey meta lines (validation 4: below the reader toolbar); 44 px targets; inside 390 px.
  const box = await control.boundingBox();
  const meta = await page.getByTestId('song-meta-lines').boundingBox();
  expect(box && meta && box.y >= meta.y + meta.height - 1).toBe(true);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  expect((await simplified.boundingBox())!.height).toBeGreaterThanOrEqual(44);

  await simplified.click();
  await expect(simplified).toBeChecked();
  await expect(original).not.toBeChecked();
  await expect(page.getByText('Simplified verse for the variant slot')).toBeVisible();
  await expect(page.getByText('Original verse for the variant slot')).toHaveCount(0);
  // The key line and the Practice drawer follow the chosen version too.
  await expect(page.getByTestId('song-meta-lines')).toContainText('Key C');
  await expect(page.getByTestId('song-meta-lines')).not.toContainText('Key Am');

  // No dead control and no overlap: validation 4 puts the reader toolbar (Chords · A− · A+) above the versions.
  const toolbar = await page.getByTestId('reader-toolbar').boundingBox();
  const afterBox = await control.boundingBox();
  expect(toolbar!.y + toolbar!.height).toBeLessThanOrEqual(afterBox!.y + 1);
});

test('Keyboard: arrow keys move through the versions', async ({ page }) => {
  await page.goto(`/songs/${IDS.song}`);
  const control = page.getByRole('radiogroup', { name: 'Song version' });
  const original = control.getByRole('radio', { name: 'Original' });
  await original.focus();
  await page.keyboard.press('ArrowRight');
  await expect(control.getByRole('radio', { name: 'Simplified' })).toBeChecked();
  await expect(page.getByText('Simplified verse for the variant slot')).toBeVisible();
  await page.keyboard.press('Home');
  await expect(original).toBeChecked();
});

// A guest always has the Listen tab (public takes live there, #405), so this runs as a member:
// the Listen tab is there only when the chosen version has a reference track.
test.describe('Practice follows the chosen version', () => {
  test.use({ storageState: ROLES.member.storage });

  test('the Listen tab follows the version', async ({ page }) => {
    await page.goto(`/songs/${IDS.song}`);
    const control = page.getByRole('radiogroup', { name: 'Song version' });
    const practice = page.getByTestId('song-action-practice');
    // #586: one dot when the shown version has media or a take (this member has no takes on it).
    const mediaIndicator = page.getByTestId('song-action-practice-dot');
    await expect(mediaIndicator).toHaveCount(0);
    await expect(practice).toHaveAccessibleName('Practice');

    // Original has no reference track: Practice opens on Record (no Listen tab).
    await clickPractice(page);
    await expect(page.getByTestId('practice-drawer')).toBeVisible();
    await expect(page.getByTestId('practice-tab-listen')).toHaveCount(0);
    await page.locator('button[aria-label="Close"]').first().click();
    await drawerSettled(page, false);

    // Simplified has one: the Listen tab appears.
    await control.getByRole('radio', { name: 'Simplified' }).click();
    await expect(mediaIndicator).toBeVisible();
    await expect(practice).toHaveAccessibleName('Practice: media or recordings available');
    await clickPractice(page);
    await expect(page.getByTestId('practice-tab-listen')).toBeVisible();
  });
});

test('Deep link: ?version= opens that version, unknown versions fall back to the first', async ({ page }) => {
  await page.goto(`/songs/${IDS.song}?version=${IDS.simplified}`);
  const control = page.getByRole('radiogroup', { name: 'Song version' });
  await expect(control.getByRole('radio', { name: 'Simplified' })).toBeChecked();
  await expect(page.getByText('Simplified verse for the variant slot')).toBeVisible();

  // Tapping the switch overrides the link; the address is replaced in place (validation 2, item 5): the first
  // version has the clean URL.
  await control.getByRole('radio', { name: 'Original' }).click();
  await expect(page.getByText('Original verse for the variant slot')).toBeVisible();
  await expect.poll(() => new URL(page.url()).searchParams.get('version')).toBeNull();

  await page.goto(`/songs/${IDS.song}?version=00000000-0000-4000-a000-000000000000`);
  await expect(page.getByRole('radiogroup', { name: 'Song version' }).getByRole('radio', { name: 'Original' })).toBeChecked();
  await expect(page.getByText('Original verse for the variant slot')).toBeVisible();
});

test('Deep link: ?version= coexists with ?recording=', async ({ page }) => {
  // A guest following a take link sees the sign-in prompt of the Recordings tab; the linked version stays.
  await page.goto(`/songs/${IDS.song}?version=${IDS.simplified}&recording=00000000-0000-4000-a000-0000000000aa`);
  await expect(page.getByRole('radiogroup', { name: 'Song version' }).getByRole('radio', { name: 'Simplified' })).toBeChecked();
  await expect(page.getByText('Simplified verse for the variant slot')).toBeVisible();
  await expect(page.getByTestId('rehearsal-drawer-body')).toBeVisible();
});

test.describe('a take in progress survives a tap on another version', () => {
  test.use({ storageState: ROLES.member.storage });
  test.describe.configure({ timeout: 90_000 });

  test('the switch is refused, the drawer reopens on Record and the picked file stays', async ({ page }) => {
    await page.goto(`/songs/${IDS.song}`);
    const control = page.getByRole('radiogroup', { name: 'Song version' });
    await expect(page.getByText('Original verse for the variant slot')).toBeVisible();
    await clickPractice(page);
    await drawerSettled(page, true);

    // Pick a file: the recorder now holds an unsaved take (no upload happens, nothing to clean up).
    await page.getByRole('button', { name: 'Upload File' }).click({ force: true });
    const chooser = page.waitForEvent('filechooser');
    await page.locator('text=Click to select an audio file').click();
    await (await chooser).setFiles('e2e/fixtures/dummy-audio.wav');
    const nameInput = page.locator('input[placeholder="Recording Name (e.g. Recording 1)"]');
    await nameInput.fill('E2E keep me');

    // Close the drawer (recording would keep going behind it), then tap the other version.
    await page.locator('button[aria-label="Close"]').first().click();
    await drawerSettled(page, false);
    await control.getByRole('radio', { name: 'Simplified' }).click();

    // Refused: still the first version, a toast says why, the drawer is back on Record with the take intact.
    await expect(page.getByText('Finish or discard your recording before switching version.')).toBeVisible();
    await expect(control.getByRole('radio', { name: 'Original' })).toBeChecked();
    await expect(page.getByText('Original verse for the variant slot')).toBeVisible();
    await drawerSettled(page, true);
    await expect(nameInput).toHaveValue('E2E keep me');

    // An explicit Discard frees the switch, and it is instant again.
    await page.getByRole('button', { name: 'Discard' }).click();
    await page.locator('button[aria-label="Close"]').first().click();
    await drawerSettled(page, false);
    await control.getByRole('radio', { name: 'Simplified' }).click();
    await expect(control.getByRole('radio', { name: 'Simplified' })).toBeChecked();
    await expect(page.getByText('Simplified verse for the variant slot')).toBeVisible();
  });
});

test.describe('editing a second version', () => {
  test.use({ storageState: ROLES.member.storage });
  test.describe.configure({ timeout: 90_000 });

  test('Save returns to that version, names it on the form, and keeps the song\'s chords flag', async ({ page }) => {
    await queryOne('UPDATE public.compositions SET has_chords = true WHERE id = $1', [IDS.flagsSong]);
    await page.goto(`/songs/${IDS.flagsSong}/edit?version=${IDS.flagsSimplified}`);
    // The caption names the version being edited (the song has more than one).
    await expect(page.getByTestId('edit-version-caption')).toHaveText('Editing version: Simplified');
    await expect(page.locator('textarea').first()).toHaveValue('Flags simplified verse');

    await page.getByRole('button', { name: 'Publish Song' }).click();
    // The reader opens on the version that was just saved, not on the first one.
    await expect(page).toHaveURL(new RegExp(`/songs/${IDS.flagsSong}\\?version=${IDS.flagsSimplified}$`), { timeout: 20_000 });
    await expect(page.getByText('Flags simplified verse')).toBeVisible();
    await expect(page.getByRole('radiogroup', { name: 'Song version' }).getByRole('radio', { name: 'Simplified' })).toBeChecked();

    // Saving the lyrics-only version did not clear the chords of "Original".
    const row = await queryOne<{ has_chords: boolean }>('SELECT has_chords FROM public.compositions WHERE id = $1', [IDS.flagsSong]);
    expect(row?.has_chords).toBe(true);
  });

  test('a single-version song gets no caption', async ({ page }) => {
    await page.goto(`/songs/${IDS.singleSong}/edit`);
    await expect(page.locator('textarea').first()).toHaveValue('Single verse for the variant slot');
    await expect(page.getByTestId('edit-version-caption')).toHaveCount(0);
  });
});

test.describe('a playing take does not outlive its version', () => {
  test.use({ storageState: ROLES.member.storage });
  test.describe.configure({ timeout: 90_000 });

  test('switching versions stops the take and hides the mini player', async ({ page }) => {
    // Remember every audio element that was asked to play, so "stopped" can be asserted.
    await page.addInitScript(() => {
      const w = window as unknown as { __played: HTMLMediaElement[] };
      w.__played = [];
      const play = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
        this.loop = true; // the dummy take is short: keep it playing until the page stops it
        w.__played.push(this);
        return play.call(this);
      };
    });
    await page.goto(`/songs/${IDS.song}`);
    await expect(page.getByText('Original verse for the variant slot')).toBeVisible();
    await clickPractice(page);
    await expect(page.getByTestId('practice-drawer')).toBeVisible();
    await drawerSettled(page, true);

    await page.getByRole('button', { name: 'Upload File' }).click({ force: true });
    const pick = page.locator('text=Click to select an audio file');
    await expect(pick).toBeVisible();
    const chooser = page.waitForEvent('filechooser');
    await pick.click();
    await (await chooser).setFiles('e2e/fixtures/dummy-audio.wav');
    const name = `E2E Practice - ${Date.now()}`;
    let storagePath: string | null = null;
    try {
      await page.locator('input[placeholder="Recording Name (e.g. Recording 1)"]').fill(name);
      await page.locator('button:has-text("Save Recording")').click();
      const take = page.locator(`h4:has-text("${name}")`);
      await expect(take).toBeVisible({ timeout: 15_000 });
      storagePath = await takeStoragePath(name);
      await take.locator('xpath=ancestor::div[contains(@class, "group")][1]').locator('button[title="Play"]').click();
      const bar = page.getByTestId('bottom-mini-player');
      await expect(bar).toBeVisible({ timeout: 5_000 });
      const playing = () =>
        page.evaluate(() => (window as unknown as { __played: HTMLMediaElement[] }).__played.some((a) => !a.paused && !a.ended));
      await expect.poll(playing).toBe(true);

      // Close the drawer (the bar stays), then switch to the other version.
      await page.locator('button[aria-label="Close"]').first().click();
      await expect(bar).toBeVisible();
      await drawerSettled(page, false);
      await page.getByRole('radiogroup', { name: 'Song version' }).getByRole('radio', { name: 'Simplified' }).click();
      await expect(page.getByText('Simplified verse for the variant slot')).toBeVisible();

      // No orphan: nothing keeps playing, no bar, no reserved space.
      await expect.poll(playing).toBe(false);
      await expect(page.getByTestId('bottom-mini-player')).toHaveCount(0);
      await expect
        .poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue('--mini-player-h')))
        .toBe('');
    } finally {
      // Remove the take again (back on the first version).
      await page.goto(`/songs/${IDS.song}`);
      await clickPractice(page);
      // Wait for the take list to load before looking for a leftover (a count() right away races it).
      const leftover = page.locator(`h4:has-text("${name}")`);
      const saved = (await takeStoragePath(name)) !== null;
      if (saved) {
        await expect(leftover).toBeVisible({ timeout: 15_000 });
        const row = leftover.locator('xpath=ancestor::div[contains(@class, "group")][1]');
        await row.locator('button[aria-label="More actions"]').click();
        await page.getByRole('dialog').getByRole('button', { name: 'Delete recording', exact: true }).click();
        await page.getByRole('button', { name: 'Yes, delete' }).click();
        await expect(leftover).toHaveCount(0, { timeout: 10_000 });
      }
      // Deleting through the app removes the row and the audio file; nothing may stay in storage.
      if (storagePath) {
        await expect.poll(() => storedObjects(storagePath!), { timeout: 10_000 }).toBe(0);
      }
    }
  });
});
