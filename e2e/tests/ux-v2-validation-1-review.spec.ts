import { test, expect, type Browser, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import pg from 'pg';
import { ROLES } from '../fixtures/roles';
import { VALIDATION_1_REVIEW_FIXTURE_IDS as IDS } from '../fixtures/ids';
import { DICTIONARIES, SUPPORTED_LOCALES } from '../../lib/i18n';

/**
 * UX v2 validation round 1, review round: findings B1 and H1 (search suggestions panel).
 * Gherkin: docs/testing/ux-v2-validation-1.feature (@e2e). Read-only on seeded data.
 *
 *  B1  A press on a song while the suggestions panel is open opens THAT song: the panel closes, but the page
 *      must not move between press and release (it did: the list jumped up and the click landed elsewhere).
 *  H1  Opening and closing the panel keeps the scroll position of the main column (desktop).
 *  H2  Auto-scroll is offered when the lyric TEXT runs behind the fixed bars (phone) or below the window (both),
 *      and not when it all fits.
 *  M1  The tools sheet closes when nothing is left in it, and focus never falls to <body>.
 *  M2  One focus cue per field (chip fields, the artist field, selects, the shadcn Input).
 *  M3  The tag counts in the open tag browser meet AA.
 *  M5  The member Search options show their full labels at 390 px in every language.
 *  M6  A bracketed section label is not a chord. L6: the first reader control lines up with the lyrics.
 */
const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const FIXTURE_TITLE = 'E2E Validation 1 Review Song';

test.use({ viewport: { width: 390, height: 844 } });

const searchField = (page: Page) => page.getByPlaceholder(/Search \d+\+ songs/);
const pinEnglish = (page: Page) => page.addInitScript(() => localStorage.setItem('sacred-fire-songs-locale', 'en'));

async function context(browser: Browser, kind: 'phone' | 'desktop', storageState?: string) {
  return browser.newContext(
    kind === 'phone'
      ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, storageState }
      : { viewport: { width: 1280, height: 800 }, hasTouch: false, isMobile: false, storageState },
  );
}

/** The first song row that lies fully below the open panel and inside the window, with its link target. */
async function rowBelowPanel(page: Page) {
  const panel = (await page.getByTestId('search-suggestions').boundingBox())!;
  const viewport = page.viewportSize()!;
  const rows = page.getByTestId('song-row');
  const n = await rows.count();
  for (let i = 0; i < n; i++) {
    const box = await rows.nth(i).boundingBox();
    if (box && box.y >= panel.y + panel.height && box.y + box.height <= viewport.height - 60) {
      const href = await rows.nth(i).locator('a[href^="/songs/"]').first().getAttribute('href');
      return { x: box.x + 60, y: box.y + box.height / 2, href: href! };
    }
  }
  throw new Error('no song row below the panel inside the window');
}

/** A press that lasts a moment, like a finger or a mouse button: the page may react in between. */
async function press(page: Page, kind: 'phone' | 'desktop', at: { x: number; y: number }) {
  if (kind === 'desktop') {
    await page.mouse.move(at.x, at.y);
    await page.mouse.down();
    await page.waitForTimeout(150);
    await page.mouse.up();
    return;
  }
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: at.x, y: at.y }] });
  await page.waitForTimeout(150);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

// ── B1 ─────────────────────────────────────────────────────────────────────────────────────────────────────
for (const kind of ['phone', 'desktop'] as const) {
  test(`B1 ${kind}: a press on a song below the open suggestions opens that song and closes the panel`, async ({ browser }) => {
    const ctx = await context(browser, kind);
    const page = await ctx.newPage();
    await pinEnglish(page);
    await page.goto('/songs');
    await expect(page.getByTestId('song-row').first()).toBeVisible();
    await searchField(page).click();
    await expect(page.getByTestId('search-suggestions')).toBeVisible();

    const target = await rowBelowPanel(page);
    await press(page, kind, target);

    await expect(page).toHaveURL(new RegExp(`${target.href}$`));
    await expect(page.getByTestId('search-suggestions')).toHaveCount(0);
    await ctx.close();
  });
}

test('B1 phone: a press on a song below the open panel on guest Home opens that song', async ({ browser }) => {
  const ctx = await context(browser, 'phone');
  const page = await ctx.newPage();
  await pinEnglish(page);
  await page.goto('/');
  const field = page.getByRole('searchbox');
  await expect(field).toBeVisible();
  await expect(page.getByTestId('song-row').first()).toBeVisible();
  await field.click();
  await expect(page.getByTestId('search-suggestions')).toBeVisible();

  const target = await rowBelowPanel(page);
  await press(page, 'phone', target);

  await expect(page).toHaveURL(new RegExp(`${target.href}$`));
  await ctx.close();
});

test('B1 desktop: a tap on empty page space still closes the panel', async ({ browser }) => {
  const ctx = await context(browser, 'desktop');
  const page = await ctx.newPage();
  await pinEnglish(page);
  await page.goto('/songs');
  await searchField(page).click();
  await expect(page.getByTestId('search-suggestions')).toBeVisible();
  await page.locator('#app-navbar').click({ position: { x: 1, y: 1 } });
  await expect(page.getByTestId('search-suggestions')).toHaveCount(0);
  await ctx.close();
});

// ── H1 ─────────────────────────────────────────────────────────────────────────────────────────────────────
const scrollTopOfMain = (page: Page) => page.locator('main').first().evaluate((el) => Math.round(el.scrollTop));

for (const [label, path, role] of [
  ['song list', '/songs', undefined],
  ['Home (member)', '/', 'member'],
  ['Playlists (member)', '/library/playlists', 'member'],
] as const) {
  test(`H1 desktop: opening and closing the suggestions keeps the scroll position (${label})`, async ({ browser }) => {
    const ctx = await context(browser, 'desktop', role ? ROLES[role].storage : undefined);
    const page = await ctx.newPage();
    await pinEnglish(page);
    await page.goto(path);
    await expect(searchField(page)).toBeVisible();
    // Make sure there is something to scroll on every page, and let the page settle where it was scrolled to.
    await page.waitForLoadState('networkidle');
    await page.locator('main').first().evaluate((el) => {
      el.style.paddingBottom = '4000px';
      el.scrollTop = 1395;
    });
    await page.waitForTimeout(500);
    const before = await scrollTopOfMain(page);
    expect(before).toBeGreaterThan(300);

    await searchField(page).click();
    const panel = page.getByTestId('search-suggestions');
    await expect(panel).toBeVisible();
    expect(await scrollTopOfMain(page)).toBe(before);
    // Visible: inside the scrolling area, not hidden behind the header.
    const main = (await page.locator('main').first().boundingBox())!;
    const p = (await panel.boundingBox())!;
    expect(p.y).toBeGreaterThanOrEqual(main.y - 1);
    expect(p.y + p.height).toBeLessThanOrEqual(main.y + main.height + 1);

    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
    expect(await scrollTopOfMain(page)).toBe(before);
    await ctx.close();
  });
}

// ── fixture: a chord Original of eight lines, and a lyrics-only version with only a "[Chorus]" label ──────────
test.beforeAll(async () => {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    await client.query('SELECT pg_advisory_lock(3700001)');
    await client.query(
      `INSERT INTO public.compositions (id, title, original_author, is_public, has_chords, has_melody)
       VALUES ($1, $2, 'E2E Author', true, true, false)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, is_public = true, has_chords = true, has_melody = false`,
      [IDS.song, FIXTURE_TITLE],
    );
    const original = ['{key: E}', ...Array.from({ length: 8 }, (_, i) => `[E]Fire number ${i + 1} in the [A]night we [B]sing`)].join('\n');
    const labels = ['[Chorus]', ...Array.from({ length: 8 }, (_, i) => `Fire number ${i + 1} in the night we sing`)].join('\n');
    for (const [id, name, content, created] of [
      [IDS.original, 'Original', original, '2026-01-01T00:00:00Z'],
      [IDS.labels, 'Labels', labels, '2026-01-02T00:00:00Z'],
    ]) {
      await client.query(
        `INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, key, created_at)
         VALUES ($1, $2, $3, $4, 'E', $5)
         ON CONFLICT (id) DO UPDATE SET version_name = EXCLUDED.version_name, content_chordpro = EXCLUDED.content_chordpro, created_at = EXCLUDED.created_at`,
        [id, IDS.song, name, content, created],
      );
    }
  } finally {
    await client.query('SELECT pg_advisory_unlock(3700001)').catch(() => undefined);
    await client.end();
  }
});

const toggle = (page: Page) => page.getByTestId('autoscroll-toggle');

/** Where the lyric text ends, from the top of its scrolling area (the page, or the main column on desktop). */
async function textBottom(page: Page): Promise<{ bottom: number; chromeTop: number }> {
  return page.evaluate(() => {
    const text = document.querySelector('[data-testid="song-display"]')!.getBoundingClientRect();
    const main = document.querySelector('main') as HTMLElement;
    const scrolls = getComputedStyle(main).overflowY === 'auto';
    const top = scrolls ? main.getBoundingClientRect().top : 0;
    const scrollTop = scrolls ? main.scrollTop : window.scrollY;
    return { bottom: text.bottom - top + scrollTop, chromeTop: top };
  });
}

async function openFixture(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await pinEnglish(page);
  await page.goto(`/songs/${IDS.song}`);
  await expect(page.getByTestId('song-display')).toBeVisible();
  await expect(page.getByTestId('reader-toolbar')).toBeVisible();
}

// ── H2 ─────────────────────────────────────────────────────────────────────────────────────────────────────
test('H2 phone: lyrics hidden behind the Practice and bottom bars show ▶; lyrics clear of them do not', async ({ browser }) => {
  const ctx = await context(browser, 'phone');
  const page = await ctx.newPage();
  await openFixture(page, 390, 1400);
  await expect(toggle(page)).toHaveCount(0); // everything fits in a tall window
  const { bottom } = await textBottom(page);
  const bars = await page.evaluate(() =>
    [...document.querySelectorAll('[data-reader-bar]')].reduce((n, el) => n + (el as HTMLElement).offsetHeight, 0));
  expect(bars).toBeGreaterThanOrEqual(100); // Practice bar + bottom bar, about 112 px

  // The window is 50 px taller than the text: it fits the window, but the last lines sit behind the bars.
  await page.setViewportSize({ width: 390, height: Math.ceil(bottom + 50) });
  await expect(toggle(page)).toBeVisible();
  await expect(page.getByTestId('reader-tools-button')).toBeVisible();

  // With room for the text AND the bars: nothing to scroll.
  await page.setViewportSize({ width: 390, height: Math.ceil(bottom + bars + 20) });
  await expect(toggle(page)).toHaveCount(0);
  await expect(page.getByTestId('reader-tools-button')).toHaveCount(0);
  await ctx.close();
});

test('H2 desktop: padding below the text is not lyrics; text below the window shows ▶', async ({ browser }) => {
  const ctx = await context(browser, 'desktop');
  const page = await ctx.newPage();
  await openFixture(page, 1280, 1400);
  await expect(toggle(page)).toHaveCount(0);
  const { bottom, chromeTop } = await textBottom(page);

  // The whole text is visible with 30 px to spare (the 48 px of padding under it would have counted as lyrics).
  await page.setViewportSize({ width: 1280, height: Math.ceil(chromeTop + bottom + 30) });
  await expect(toggle(page)).toHaveCount(0);
  await expect(page.getByTestId('reader-tools-button')).toHaveCount(0);

  // 60 px of text now run below the window.
  await page.setViewportSize({ width: 1280, height: Math.ceil(chromeTop + bottom - 60) });
  await expect(toggle(page)).toBeVisible();
  await expect(page.getByTestId('reader-tools-button')).toBeVisible();
  await ctx.close();
});

// ── M1 ─────────────────────────────────────────────────────────────────────────────────────────────────────
test('M1: the tools sheet closes when the song starts to fit, and focus goes to A+, not <body>', async ({ browser }) => {
  const ctx = await context(browser, 'phone');
  const page = await ctx.newPage();
  await openFixture(page, 390, 1400);
  const { bottom } = await textBottom(page);
  await page.setViewportSize({ width: 390, height: Math.ceil(bottom - 200) }); // lyrics run below the fold
  await page.getByTestId('reader-tools-button').click();
  const sheet = page.getByRole('dialog', { name: 'Reading tools' });
  await expect(sheet).toBeVisible();

  await page.setViewportSize({ width: 390, height: 1400 }); // the song fits now
  await expect(sheet).toHaveCount(0); // no sheet with nothing but "Close"
  await expect(page.getByTestId('reader-tools-button')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Larger text' })).toBeFocused();
  await ctx.close();
});

for (const which of ['autoscroll-toggle', 'reader-tools-button'] as const) {
  test(`M1: focus on ${which} moves to A+ when it goes away on resize`, async ({ browser }) => {
    const ctx = await context(browser, 'phone');
    const page = await ctx.newPage();
    await openFixture(page, 390, 1400);
    const { bottom } = await textBottom(page);
    await page.setViewportSize({ width: 390, height: Math.ceil(bottom - 200) });
    await page.getByTestId(which).focus();
    await expect(page.getByTestId(which)).toBeFocused();
    await page.setViewportSize({ width: 390, height: 1400 });
    await expect(page.getByTestId(which)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Larger text' })).toBeFocused();
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
    await ctx.close();
  });
}

// ── M6 + L6 ────────────────────────────────────────────────────────────────────────────────────────────────
test('M6: a version whose only brackets are section labels has no Chords switch; the song stays in the Chords filter', async ({ browser }) => {
  const ctx = await context(browser, 'phone');
  const page = await ctx.newPage();
  await openFixture(page, 390, 1400);
  await expect(page.getByRole('switch', { name: 'Chords' })).toBeVisible(); // Original
  await page.getByRole('radio', { name: 'Labels' }).click();
  await expect(page.getByRole('radio', { name: 'Labels' })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('switch', { name: 'Chords' })).toHaveCount(0);
  await expect(page.getByTestId('chord')).toHaveCount(0);
  await page.goto(`/songs?chords=true&search=${encodeURIComponent(FIXTURE_TITLE)}`);
  await expect(page.getByTestId('song-row').filter({ hasText: FIXTURE_TITLE })).toHaveCount(1);
  await ctx.close();
});

test('L6: the first reader control lines up with the lyrics, with and without the Chords switch', async ({ browser }) => {
  const ctx = await context(browser, 'phone');
  const page = await ctx.newPage();
  await openFixture(page, 390, 1400);
  const lyricLeft = async () => (await page.getByTestId('lyric-line').first().boundingBox())!.x;

  // With the switch: the track of the switch (not its padding) starts at the lyrics' edge.
  const track = (await page.getByRole('switch', { name: 'Chords' }).locator('span').first().boundingBox())!;
  expect(Math.abs(track.x - (await lyricLeft()))).toBeLessThanOrEqual(1);

  await page.getByRole('radio', { name: 'Labels' }).click();
  await expect(page.getByRole('switch', { name: 'Chords' })).toHaveCount(0);
  const smaller = (await page.getByRole('button', { name: 'Smaller text' }).boundingBox())!;
  expect(Math.abs(smaller.x - (await lyricLeft()))).toBeLessThanOrEqual(1);
  await ctx.close();
});

// ── M2 ─────────────────────────────────────────────────────────────────────────────────────────────────────
/** What a field draws when focused: its outline, shadow and border compared with the same field at rest. */
async function focusCues(page: Page, field: ReturnType<Page['locator']>, box: ReturnType<Page['locator']>) {
  const read = (el: HTMLElement) => {
    const cs = getComputedStyle(el);
    return { outline: cs.outlineStyle === 'none' || parseFloat(cs.outlineWidth) === 0 ? 'none' : `${cs.outlineWidth} ${cs.outlineStyle}`, shadow: cs.boxShadow, border: cs.borderTopColor + cs.borderBottomColor };
  };
  await field.evaluate((el) => (el as HTMLElement).blur()); // nothing focused
  const rest = await box.evaluate(read);
  await field.focus();
  await expect(field).toBeFocused();
  return { rest, inField: await field.evaluate(read), onBox: await box.evaluate(read) };
}

test('M2: the tag field of Search options draws one cue: the container outline, none on the input, no border change', async ({ browser }) => {
  const ctx = await context(browser, 'phone');
  const page = await ctx.newPage();
  await pinEnglish(page);
  await page.goto('/songs');
  await page.getByRole('button', { name: 'Search options' }).first().click();
  const field = page.getByPlaceholder(/Search tags or browse categories/);
  const box = field.locator('xpath=..');
  const c = await focusCues(page, field, box);
  expect(c.onBox.outline).toMatch(/^2px solid/);
  expect(c.inField.outline).toBe('none');
  expect(c.inField.shadow).toBe('none');
  expect(c.onBox.border).toBe(c.rest.border);
  expect(c.onBox.shadow).toBe(c.rest.shadow);
  await ctx.close();
});

test.describe('member forms', () => {
  test.use({ storageState: ROLES.member.storage });

  test('M2: the artist field of the song form draws one cue', async ({ page }) => {
    await pinEnglish(page);
    await page.goto('/songs/add');
    const field = page.getByPlaceholder('e.g. Traditional or Artist Name');
    await expect(field).toBeVisible();
    const box = field.locator('xpath=..');
    const c = await focusCues(page, field, box);
    expect(c.onBox.outline).toMatch(/^2px solid/);
    expect(c.inField.outline).toBe('none');
    expect(c.onBox.border).toBe(c.rest.border);
  });

  test('M2: the key, capo and tuning selects of the song form draw the global outline and no ring', async ({ page }) => {
    await pinEnglish(page);
    await page.goto('/songs/add');
    await page.getByText('Key, Capo & Tuning').click();
    const selects = page.locator('form select');
    await expect(selects.first()).toBeVisible();
    for (const select of await selects.all()) {
      await select.focus();
      const cs = await select.evaluate((el) => {
        const s = getComputedStyle(el);
        return { outline: `${s.outlineStyle} ${s.outlineWidth}`, shadow: s.boxShadow };
      });
      expect(cs.outline).toMatch(/^solid 2px/);
      expect(cs.shadow).toBe('none');
    }
  });

  test('M5: Search options at 390 px show every label in full, in all eight languages', async ({ browser }) => {
    test.setTimeout(120_000);
    for (const locale of SUPPORTED_LOCALES) {
      const ctx = await browser.newContext({ storageState: ROLES.member.storage, viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
      const page = await ctx.newPage();
      await page.addInitScript((l) => localStorage.setItem('sacred-fire-songs-locale', l), locale);
      await page.goto('/songs');
      const dict = DICTIONARIES[locale] as Record<string, string>;
      await page.getByRole('button', { name: dict['header.searchOptions'] }).first().click();
      const heading = page.getByRole('heading', { name: dict['search.title'] });
      await expect(heading).toBeVisible();
      await expect(page.getByRole('button', { name: dict['userMenu.favorites'] }).first()).toBeVisible();
      // No label is cut: nothing in the dialog is wider than its box.
      const cut = await page.evaluate(() => {
        const dialog = [...document.querySelectorAll('h2')].find((h) => h.closest('div.relative'))!.closest('div.relative')!;
        return [...dialog.querySelectorAll<HTMLElement>('button, label, span')]
          .filter((el) => el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX !== 'visible')
          .map((el) => `${el.tagName}:${el.textContent?.trim().slice(0, 30)}`);
      });
      expect(cut, `${locale}: labels cut off`).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
      await ctx.close();
    }
  });
});

// ── M3 ─────────────────────────────────────────────────────────────────────────────────────────────────────
for (const scheme of ['light', 'dark'] as const) {
  test(`M3: the open tag browser (counts in the chips) meets AA contrast, ${scheme}`, async ({ browser }) => {
    const ctx = await context(browser, 'phone');
    const page = await ctx.newPage();
    await page.emulateMedia({ colorScheme: scheme });
    await page.addInitScript((value) => {
      localStorage.setItem('sacred-fire-songs-locale', 'en');
      const key = 'sacred-fire-songs-preferences';
      const prefs = JSON.parse(localStorage.getItem(key) || '{}');
      localStorage.setItem(key, JSON.stringify({ ...prefs, theme: value }));
    }, scheme);
    await page.goto('/songs');
    await page.getByRole('button', { name: 'Search options' }).first().click();
    await page.getByPlaceholder(/Search tags or browse categories/).focus();
    await expect(page.getByText('Browse All Tags by Category')).toBeVisible();
    // Select one tag too: counts on selected and unselected chips are both checked.
    const chip = page.getByRole('button', { pressed: false }).filter({ hasText: /\d+$/ }).first();
    await expect(chip).toBeVisible();
    await chip.click();
    await page.getByPlaceholder(/Search tags or browse categories|Add more tags/).focus();
    await expect(page.getByText('Browse All Tags by Category')).toBeVisible();
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
    const bad = results.violations.flatMap((v) => v.nodes.map((n) => `${n.target.join(' ')}: ${n.any[0]?.message ?? v.help}`));
    expect(bad, `contrast violations (${scheme})`).toEqual([]);
    await ctx.close();
  });
}
