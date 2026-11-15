import type { Page } from '@playwright/test';

/**
 * The song page's controls (Key, Capo, Chords · A− · A+ · ▶) are closed by default and remembered per device.
 * Call before `page.goto` in a test that uses them. The key matches `SONG_CONTROLS_EXPANDED_KEY`.
 */
export async function openSongControls(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('sfs_song_controls_expanded', 'true');
  });
}
