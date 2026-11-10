import { expect, type Locator, type Page } from '@playwright/test';

/** The song page's one ⋮ menu button: in the phone bar below lg, in the header from lg up (only one is visible). */
export const songMenuButton = (page: Page): Locator => page.locator('[data-testid^="song-menu-button"]:visible').first();

/** The menu dialog (song actions, transpose, auto-scroll speed, "Screen stays on"). */
export const songMenuSheet = (page: Page): Locator => page.getByTestId('song-menu-sheet');

/** Opens the menu and returns the dialog. */
export async function openSongMenu(page: Page): Promise<Locator> {
  await songMenuButton(page).click();
  const sheet = songMenuSheet(page);
  await expect(sheet).toBeVisible();
  return sheet;
}
