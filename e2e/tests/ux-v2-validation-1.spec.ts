import { test, expect, type Page } from '@playwright/test';
import pg from 'pg';
import { ROLES } from '../fixtures/roles';
import { VALIDATION_1_FIXTURE_IDS as IDS } from '../fixtures/ids';

/**
 * UX v2 validation round 1, fixes 3 to 7 (fixes 1 and 2 live in ux-v2-reader-tools / ux-v2-song-meta).
 * Gherkin: docs/testing/ux-v2-validation-1.feature (@e2e). Read-only on seeded data; the one fixture song
 * has a fixed id and is removed by e2e/global-teardown.ts.
 */
const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const FIXTURE_TITLE = 'E2E Validation 1 Flags';

test.use({ viewport: { width: 390, height: 844 } });

test.beforeAll(async () => {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    // Song-level flag: chords (the Original has them). Simplified is lyrics only.
    await client.query(
      `INSERT INTO public.compositions (id, title, original_author, is_public, has_chords, has_melody)
       VALUES ($1, $2, 'E2E Author', true, true, false)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, is_public = true, has_chords = true, has_melody = false`,
      [IDS.song, FIXTURE_TITLE],
    );
    for (const [id, name, content, created] of [
      [IDS.original, 'Original', '{key: E}\n[E]Fire in the [A]night\n[B]Sing it [E]slowly', '2026-01-01T00:00:00Z'],
      [IDS.simplified, 'Simplified', 'Fire in the night\nSing it slowly', '2026-01-02T00:00:00Z'],
    ]) {
      await client.query(
        `INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, key, created_at)
         VALUES ($1, $2, $3, $4, 'E', $5)
         ON CONFLICT (id) DO UPDATE SET version_name = EXCLUDED.version_name, content_chordpro = EXCLUDED.content_chordpro, created_at = EXCLUDED.created_at`,
        [id, IDS.song, name, content, created],
      );
    }
  } finally {
    await client.end();
  }
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sacred-fire-songs-locale', 'en');
    localStorage.removeItem('sacred-fire-songs-reader');
  });
});

const searchField = (page: Page) => page.getByPlaceholder(/Search \d+\+ songs/);

/** Computed colour of the accent token, as the browser resolves it. */
const accentRgb = (page: Page) =>
  page.evaluate(() => {
    const probe = document.createElement('div');
    probe.style.background = 'var(--accent)';
    document.body.appendChild(probe);
    const c = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return c;
  });

// ── Fix 3: one focus style for text fields ─────────────────────────────────────────────────────────────────
test.describe('text field focus @fix-3', () => {
  test.use({ storageState: ROLES.member.storage });

  test('the New Playlist name field shows one focus cue: a 2 px accent underline, no box', async ({ page }) => {
    await page.goto('/library/playlists/add');
    const name = page.getByRole('textbox', { name: /Playlist name/ });
    await name.focus();
    await expect(name).toBeFocused();
    const style = await name.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, shadow: cs.boxShadow, borderBottom: cs.borderBottomColor };
    });
    expect(style.outlineStyle === 'none' || style.outlineWidth === '0px').toBe(true);
    const accent = await accentRgb(page);
    expect(style.borderBottom).toBe(accent);
    expect(style.shadow).toContain(accent); // the second pixel of the underline
  });
});

test('a boxed text field keeps the visible 2 px focus outline and stacks nothing on it', async ({ page }) => {
  await page.goto('/songs');
  const field = searchField(page);
  await field.focus();
  const style = await field.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, shadow: cs.boxShadow };
  });
  expect(style.outlineStyle).toBe('solid'); // WCAG: focus stays visible
  expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
  expect(style.shadow).toBe('none'); // no ring on top of the outline
});

// ── Fix 4: the suggestions panel is part of the page flow ──────────────────────────────────────────────────
test.describe('suggestions panel in the flow @fix-4', () => {
  test('on the song list the panel pushes the list down instead of covering the first songs', async ({ page }) => {
    await page.goto('/songs');
    const firstRow = page.getByTestId('song-row').first();
    await expect(firstRow).toBeVisible();
    const before = (await firstRow.boundingBox())!;

    await searchField(page).click();
    const panel = page.getByTestId('search-suggestions');
    await expect(panel).toBeVisible();
    const p = (await panel.boundingBox())!;
    const after = (await firstRow.boundingBox())!;
    expect(after.y).toBeGreaterThanOrEqual(p.y + p.height - 1); // below the panel, not under it
    expect(after.y).toBeGreaterThan(before.y); // pushed down
    // Nothing positioned out of the flow around it.
    expect(await panel.evaluate((el) => { for (let e: Element | null = el; e && e !== document.body; e = e.parentElement) { const pos = getComputedStyle(e).position; if (pos === 'absolute' || pos === 'fixed') return pos; } return 'flow'; })).toBe('flow');

    // Escape closes it and the list moves back up.
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
    expect(Math.abs((await firstRow.boundingBox())!.y - before.y)).toBeLessThan(2);
  });

  test('on Home the panel does not cover the content below it (member: header field)', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: ROLES.member.storage, viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.addInitScript(() => localStorage.setItem('sacred-fire-songs-locale', 'en'));
    await page.goto('/');
    await expect(searchField(page)).toBeVisible();
    // The first thing of the page itself: the next sibling of the slot the panel is rendered into.
    const content = page.getByTestId('search-suggestions-slot').locator('xpath=following-sibling::*[1]');
    await searchField(page).click();
    const panel = page.getByTestId('search-suggestions');
    await expect(panel).toBeVisible();
    const p = (await panel.boundingBox())!;
    const c = (await content.boundingBox())!;
    expect(c.y).toBeGreaterThanOrEqual(p.y + p.height - 1);
    await ctx.close();
  });

  test('on Home the guest panel (inline field) does not cover the content below it', async ({ page }) => {
    await page.goto('/');
    const field = page.getByRole('searchbox');
    await expect(field).toBeVisible();
    const below = page.getByTestId('song-row').first().or(page.locator('main section').nth(1));
    const y0 = (await below.first().boundingBox())?.y ?? 0;
    await field.click();
    const panel = page.getByTestId('search-suggestions');
    await expect(panel).toBeVisible();
    const p = (await panel.boundingBox())!;
    const y1 = (await below.first().boundingBox())?.y ?? 0;
    expect(y1).toBeGreaterThanOrEqual(p.y + p.height - 1);
    expect(y1).toBeGreaterThan(y0);
  });
});

// ── Fix 5: search options use tokens, and a category chip says its name ───────────────────────────────────
test.describe('search options @fix-5', () => {
  test('the category chip reads the name, the primary action is the one accent, nothing is red or amber', async ({ page }) => {
    await page.goto('/songs?category=spiritual-concepts');
    await page.getByRole('button', { name: /Search options/ }).first().click();
    const chip = page.getByRole('button', { name: /^Category: / });
    await expect(chip).toHaveText(/Category:\s*Spiritual Concepts/);
    await expect(page.getByText('spiritual-concepts')).toHaveCount(0);
    await expect(chip).toHaveAttribute('aria-pressed', 'true');

    const show = page.getByRole('button', { name: 'Show results' });
    expect(await show.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(await accentRgb(page));
    // The selected chip is neutral (inverted): not the accent, not amber.
    const chipBg = await chip.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(chipBg).not.toBe(await accentRgb(page));
    // No element of the dialog is drawn in a saturated red / amber (the accent is the only hue).
    const offenders = await page.evaluate(() => {
      const root = [...document.querySelectorAll('h2')].find((h) => h.textContent === 'Search options')?.closest('div.relative');
      if (!root) return ['no dialog'];
      const accent = (() => { const p = document.createElement('div'); p.style.background = 'var(--accent)'; document.body.appendChild(p); const c = getComputedStyle(p).backgroundColor; p.remove(); return c; })();
      const hueOf = (rgb: string) => {
        const m = rgb.match(/\d+(\.\d+)?/g)?.map(Number);
        if (!m || (m.length > 3 && m[3] === 0)) return null;
        const [r, g, b] = m;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        return max - min > 60 ? rgb : null; // saturated
      };
      const bad: string[] = [];
      root.querySelectorAll('*').forEach((el) => {
        const cs = getComputedStyle(el);
        for (const v of [cs.backgroundColor, cs.color, cs.borderTopColor]) {
          const s = hueOf(v);
          if (s && s !== accent) bad.push(`${el.tagName}.${(el as HTMLElement).className.toString().slice(0, 40)} ${s}`);
        }
      });
      return bad;
    });
    expect(offenders).toEqual([]);
  });
});

// ── Fix 7: song flags and the reader follow different rules ───────────────────────────────────────────────
test.describe('song flags @fix-7', () => {
  test('Original has chords, Simplified is lyrics only: showing Simplified has no Chords switch, the song is still found by the chords filter', async ({ page }) => {
    await page.goto(`/songs/${IDS.song}`);
    const chordsSwitch = page.getByRole('switch', { name: 'Chords' });
    await expect(page.getByText('Fire in the')).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Original' })).toHaveAttribute('aria-checked', 'true');
    await expect(chordsSwitch).toBeVisible(); // Original: chords to switch

    await page.getByRole('radio', { name: 'Simplified' }).click();
    await expect(page.getByRole('radio', { name: 'Simplified' })).toHaveAttribute('aria-checked', 'true');
    await expect(chordsSwitch).toHaveCount(0);
    await expect(page.getByTestId('chord')).toHaveCount(0);

    // Lists and filters use the song-level flag: the song is still in the Chords filter.
    await page.goto(`/songs?chords=true&search=${encodeURIComponent(FIXTURE_TITLE)}`);
    await expect(page.getByTestId('song-row').filter({ hasText: FIXTURE_TITLE })).toHaveCount(1);
  });

  test.describe('musician', () => {
    test.use({ storageState: ROLES.musician.storage });

    test('transpose follows the version shown: there with Original, gone with Simplified', async ({ page }) => {
      await page.goto(`/songs/${IDS.song}`);
      await expect(page.getByTestId('reader-toolbar')).toBeVisible();
      await expect(page.getByTestId('reader-tools-button')).toBeVisible(); // Original has chords: transpose lives there
      await page.getByRole('radio', { name: 'Simplified' }).click();
      await expect(page.getByRole('radio', { name: 'Simplified' })).toHaveAttribute('aria-checked', 'true');
      await expect(page.getByRole('switch', { name: 'Chords' })).toHaveCount(0);
      // Nothing to transpose, and the short lyrics fit the screen: no tools button either.
      await expect(page.getByTestId('reader-tools-button')).toHaveCount(0);
      await page.getByRole('radio', { name: 'Original' }).click();
      await page.getByTestId('reader-tools-button').click();
      await expect(page.getByRole('dialog', { name: 'Reading tools' }).getByRole('group', { name: 'Transpose' })).toBeVisible();
    });
  });
});
