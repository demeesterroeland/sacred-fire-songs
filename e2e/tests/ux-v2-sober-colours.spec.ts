// Story 6.1.35 (#485), group 1 — docs/testing/ux-v2-sober-colours.feature, "Category tags are neutral" in the real
// browser: on the Add song page every category tag has the same colours in light and dark mode; a selected tag
// shows inverted greys and is announced as pressed. Read-only: the form is never saved.
import { test, expect, type Page } from '@playwright/test';
import { ROLES } from '../fixtures/roles';

const THEMES = ['light', 'dark'] as const;

async function setTheme(page: Page, theme: (typeof THEMES)[number]) {
  await page.emulateMedia({ colorScheme: theme });
  await page.addInitScript((value) => {
    localStorage.setItem('sacred-fire-songs-locale', 'en');
    const key = 'sacred-fire-songs-preferences';
    const prefs = JSON.parse(localStorage.getItem(key) || '{}');
    localStorage.setItem(key, JSON.stringify({ ...prefs, theme: value }));
  }, theme);
}

test.describe('neutral category tags', () => {
  test.use({ storageState: ROLES.member.storage });
  test.describe.configure({ timeout: 60_000 });

  for (const theme of THEMES) {
    test(`every tag in the Add song tag picker has the same colours (${theme})`, async ({ page }) => {
      await setTheme(page, theme);
      await page.goto('/songs/add');
      // Fail loudly if the theme did not apply (the dark run would otherwise test light).
      if (theme === 'dark') await expect(page.locator('html')).toHaveClass(/\bdark\b/);
      else await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);
      await page.getByText('Categories / Tags').click();

      const picker = page.locator('details', { hasText: 'Categories / Tags' });
      const tags = picker.locator('button[aria-pressed]');
      await expect(tags.first()).toBeVisible({ timeout: 15_000 });
      expect(await tags.count()).toBeGreaterThan(3);

      const idleStyles = () => tags.evaluateAll((els) => [...new Set(els.map((el) => {
        const s = getComputedStyle(el);
        return `${s.backgroundColor} / ${s.color}`;
      }))]);
      await expect.poll(idleStyles, { message: 'one style for every unselected tag' }).toHaveLength(1);
      const idle = await idleStyles();

      const [idleBg, idleText] = [...idle][0].split(' / ');
      expect(idleBg, 'background differs from text').not.toBe(idleText);

      const first = tags.first();
      // The "Selected tags" bar shows the name without the "(n)" count.
      const name = ((await first.textContent()) ?? '').replace(/\(\d+\)\s*$/, '').trim();
      await first.click();
      const selected = picker.locator('button[aria-pressed="true"]');
      await expect(selected.first()).toContainText(name);
      // Inverted greys: once the colour transition ends, the selected background is the idle text colour
      // (the label turns to the page background).
      await expect
        .poll(() => selected.evaluateAll((els) => [...new Set(els.map((el) => getComputedStyle(el).backgroundColor))]))
        .toEqual([idleText]);
      const pressedText = await selected.first().evaluate((el) => getComputedStyle(el).color);
      expect(pressedText).not.toBe(idleText);
    });
  }
});
