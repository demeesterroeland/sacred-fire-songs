import { test, expect, type Page } from '@playwright/test';
import pg from 'pg';
import { ROLES } from '../fixtures/roles';
import { VALIDATION_2_FIXTURE_IDS as IDS } from '../fixtures/ids';
import { openSongMenu, songMenuButton } from '../fixtures/songMenu';

/**
 * UX v2 validation round 2 (batch 2): the owner's second phone and desktop run.
 * Gherkin: docs/testing/ux-v2-validation-2.feature (@e2e). Read-only on seeded data; the one fixture song has a
 * fixed id and is removed by e2e/global-teardown.ts.
 */
const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const LONG_TITLE =
  "E2E Validation 2 Grandmother's Song of the Thousand Rivers That Flow Together Toward the Ocean of Forgiveness";
const LINES = Array.from({ length: 60 }, (_, i) => `[E]Fire number ${i + 1} in the [A]night`).join('\n');
const LABEL_LINES = Array.from({ length: 60 }, (_, i) => `Fire number ${i + 1} in the night`).join('\n');

test.beforeAll(async () => {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    await client.query(
      `INSERT INTO public.compositions (id, title, original_author, is_public, has_chords, has_melody)
       VALUES ($1, $2, 'E2E Author', true, true, false)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, is_public = true, has_chords = true, has_melody = false`,
      [IDS.song, LONG_TITLE],
    );
    for (const [id, name, content, created] of [
      [IDS.original, 'Original', `{key: E}\n${LINES}`, '2026-01-01T00:00:00Z'],
      [IDS.simplified, 'Simplified', `[Verse]\n${LABEL_LINES}\n[Chorus]\nRise up now\n[Bridge]\nStay with me\n[Coda]\nSlowly home`, '2026-01-02T00:00:00Z'],
    ]) {
      await client.query(
        `INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, key, created_at)
         VALUES ($1, $2, $3, $4, 'E', $5)
         ON CONFLICT (id) DO UPDATE SET version_name = EXCLUDED.version_name, content_chordpro = EXCLUDED.content_chordpro, created_at = EXCLUDED.created_at`,
        [id, IDS.song, name, content, created],
      );
    }
    // A recording of the member on the Original (the first version).
    await client.query(
      `INSERT INTO public.user_recordings (id, user_id, song_version_id, recording_name, storage_path, is_public)
       SELECT $1::uuid, p.id, $2::uuid, 'E2E Validation 2 Recording', 'e2e-validation-2/' || $1::text || '.webm', false
         FROM public.profiles p WHERE p.email = $3
       ON CONFLICT (id) DO NOTHING`,
      [IDS.recording, IDS.original, ROLES.member.email],
    );
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

const rgb = (page: Page, cssValue: string) =>
  page.evaluate((v) => {
    const probe = document.createElement('div');
    probe.style.background = v;
    document.body.appendChild(probe);
    const c = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return c;
  }, cssValue);

const box = async (page: Page, locator: ReturnType<Page['locator']>) => (await locator.boundingBox())!;

// ── 1 · Sign In ─────────────────────────────────────────────────────────────────────────────────────────────
test('1: the Sign In button is the accent primary button, the same as the login form\'s', async ({ page }) => {
  await page.goto('/songs');
  const signIn = page.getByRole('link', { name: 'Sign In', exact: true }).first();
  await expect(signIn).toBeVisible();
  const accent = await rgb(page, 'var(--accent)');
  await expect(signIn).toHaveCSS('background-color', accent);
  await expect(signIn).toHaveCSS('border-radius', '6px');
  await page.goto('/auth/login');
  await page.getByRole('button', { name: 'Sign in with password' }).click();
  const submit = page.getByRole('button', { name: 'Sign In', exact: true });
  await expect(submit).toHaveCSS('background-color', accent);
  await expect(submit).toHaveCSS('border-radius', '6px');
});

// ── 2 · Floating + ─────────────────────────────────────────────────────────────────────────────────────────
test.describe('member', () => {
  test.use({ storageState: ROLES.member.storage });

  test('2: the Library "+" floats bottom right, above the bottom bar, and stays put on scroll', async ({ page }) => {
    await page.goto('/library/playlists');
    const fab = page.getByRole('button', { name: 'Create', exact: true });
    await expect(fab).toBeVisible();
    await expect(fab).toHaveCSS('position', 'fixed');
    const viewport = page.viewportSize()!;
    const nav = await box(page, page.getByTestId('bottom-nav'));
    const before = await box(page, fab);
    expect(viewport.width - (before.x + before.width)).toBeGreaterThanOrEqual(8);
    expect(viewport.width - (before.x + before.width)).toBeLessThanOrEqual(32);
    expect(before.y + before.height).toBeLessThanOrEqual(nav.y); // never over the bottom bar
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
    const after = await box(page, fab);
    expect(Math.abs(after.x - before.x)).toBeLessThan(1);
    await fab.click();
    await expect(page.getByRole('dialog').getByRole('button', { name: 'New Playlist' })).toBeVisible();
  });

  test('3: History, Artists and Shared with me have the same heading size', async ({ page }) => {
    const size = async (path: string) => {
      await page.goto(path);
      return page.getByTestId('library-subpage-heading').evaluate((el) => getComputedStyle(el).fontSize);
    };
    const artists = await size('/library/artists');
    expect(await size('/library/recently-viewed')).toBe(artists);
    expect(await size('/library/shared')).toBe(artists);
  });

  test('9: the Your recordings card says recordings, not private songs', async ({ page }) => {
    await page.goto('/library/playlists');
    const card = page.getByRole('link', { name: /Your recordings/ });
    await expect(card).toBeVisible();
    await expect(card).not.toContainText(/\btakes?\b|private practice/i);
    await expect(card).not.toContainText(/\bsongs?\b(?!.*recording)/i);
    await expect(page.getByText(/Your takes/)).toHaveCount(0);
  });
});

// ── 4 · counts ─────────────────────────────────────────────────────────────────────────────────────────────
test('4: category counts are written between parentheses', async ({ page }) => {
  await page.goto('/');
  const counts = page.getByTestId('tag-count');
  await expect(counts.first()).toBeVisible();
  for (const text of await counts.allTextContents()) expect(text).toMatch(/^\(\d+\)$/);
});

// ── 5 · version link ───────────────────────────────────────────────────────────────────────────────────────
test('5: switching version updates ?version= in place, Share shares it, the first version is clean', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    (window as unknown as { __copied: string[] }).__copied = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (t: string) => (window as unknown as { __copied: string[] }).__copied.push(t) },
    });
  });
  await page.goto(`/songs/${IDS.song}`);
  const historyBefore = await page.evaluate(() => history.length);
  await page.getByRole('radio', { name: 'Simplified' }).click();
  await expect(page.getByRole('radio', { name: 'Simplified' })).toHaveAttribute('aria-checked', 'true');
  await expect(page).toHaveURL(new RegExp(`/songs/${IDS.song}\\?version=${IDS.simplified}$`));
  expect(await page.evaluate(() => history.length)).toBe(historyBefore); // no history entry per switch

  const sheet = await openSongMenu(page);
  await sheet.getByRole('button', { name: 'Share Song' }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __copied: string[] }).__copied.at(-1) ?? '')).toContain(`?version=${IDS.simplified}`);

  await page.reload(); // opening the link shows that version
  await expect(page.getByRole('radio', { name: 'Simplified' })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('radio', { name: 'Original' }).click();
  await expect(page).toHaveURL(new RegExp(`/songs/${IDS.song}$`));
});

// ── 6 · full title ─────────────────────────────────────────────────────────────────────────────────────────
test('6: the full title wraps at the top of the page; the truncated copy shows only after scrolling past it', async ({ page }) => {
  await page.goto(`/songs/${IDS.song}`);
  const title = page.getByTestId('song-title');
  await expect(title).toHaveText(LONG_TITLE);
  const wrapped = await title.evaluate((el) => ({
    ws: getComputedStyle(el).whiteSpace,
    overflowing: el.scrollWidth > el.clientWidth + 1,
    lines: Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)),
  }));
  expect(wrapped.ws).toBe('normal');
  expect(wrapped.overflowing).toBe(false);
  expect(wrapped.lines).toBeGreaterThanOrEqual(3);
  await expect(page.getByTestId('sticky-song-title')).toBeHidden(); // not while the full title is in view
  await page.evaluate(() => window.scrollBy(0, 700));
  const sticky = page.getByTestId('sticky-song-title');
  await expect(sticky).toBeVisible();
  const clipped = await sticky.evaluate((el) => ({ over: el.scrollWidth > el.clientWidth, to: getComputedStyle(el).textOverflow }));
  expect(clipped).toEqual({ over: true, to: 'ellipsis' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(sticky).toBeHidden();
});

// ── 10 · screen stays on ───────────────────────────────────────────────────────────────────────────────────
test('10: "Screen stays on" is a switch in the menu: remembered on this device, the wake lock is released when off', async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __requests: number; __released: number };
    w.__requests = 0;
    w.__released = 0;
    const sentinel = { release: async () => { w.__released += 1; }, addEventListener: () => {} };
    Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: async () => { w.__requests += 1; return sentinel; } } });
  });
  await page.goto(`/songs/${IDS.song}`);
  await expect(page.getByTestId('stay-awake-indicator')).toBeVisible();
  const sheet = await openSongMenu(page);
  const sw = sheet.getByRole('switch', { name: 'Screen stays on' });
  await expect(sw).toHaveAttribute('aria-checked', 'true'); // on by default
  await sw.click();
  await expect(sw).toHaveAttribute('aria-checked', 'false');
  await expect.poll(() => page.evaluate(() => (window as unknown as { __released: number }).__released)).toBeGreaterThan(0);
  await expect(page.getByTestId('stay-awake-indicator')).toHaveCount(0);
  await page.reload();
  await openSongMenu(page);
  await expect(page.getByRole('switch', { name: 'Screen stays on' })).toHaveAttribute('aria-checked', 'false');
});

// ── 11 · one menu ──────────────────────────────────────────────────────────────────────────────────────────
test('11: there is one overflow menu, with Share, the reading tools and the screen switch', async ({ page }) => {
  await page.goto(`/songs/${IDS.song}`);
  await expect(page.locator('[data-testid^="song-menu-button"]:visible')).toHaveCount(1);
  await expect(page.getByTestId('reader-tools-button')).toHaveCount(0);
  const sheet = await openSongMenu(page);
  await expect(sheet.getByRole('button', { name: 'Share Song' })).toBeVisible();
  await expect(sheet.getByRole('group', { name: 'Auto-scroll' })).toBeVisible(); // the 60-line song does not fit
  await expect(sheet.getByRole('switch', { name: 'Screen stays on' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
  await expect(songMenuButton(page)).toBeFocused();
});

// ── 15 · one main ──────────────────────────────────────────────────────────────────────────────────────────
for (const path of ['/', '/songs', '/auth/login', '/terms', '/privacy', `/songs/${IDS.song}`]) {
  test(`15: ${path} has exactly one main landmark`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('main')).toHaveCount(1);
  });
}

// ── 12 · Terms and Privacy ─────────────────────────────────────────────────────────────────────────────────
for (const [path, heading] of [['/terms', 'Terms Of Service'], ['/privacy', 'Privacy Policy']] as const) {
  test(`12: ${path} is a real page with a Draft note and the operator section`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await expect(page.getByRole('note')).toContainText('Draft');
    await expect(page.getByRole('heading', { level: 2, name: 'Who runs this server' })).toBeVisible();
  });
}

test('12: the sign-up form links to the Terms and Privacy pages', async ({ page }) => {
  await page.goto('/auth/sign-up');
  await page.getByRole('link', { name: 'Terms Of Service' }).click();
  await expect(page).toHaveURL(/\/terms$/);
  await page.goto('/auth/sign-up');
  await page.getByRole('link', { name: 'Privacy Policy' }).click();
  await expect(page).toHaveURL(/\/privacy$/);
});

// ── 13 · admin drafts ──────────────────────────────────────────────────────────────────────────────────────
test.describe('admin', () => {
  test.use({ storageState: ROLES.admin.storage });

  test('13: the My Drafts card counts only the admin\'s own drafts', async ({ page }) => {
    const client = new pg.Client({ connectionString: DATABASE_URL });
    await client.connect();
    const own = Number(
      (
        await client.query(
          `SELECT count(*) AS n FROM public.compositions c JOIN public.profiles p ON p.id = c.owner_id
            WHERE p.email = $1 AND c.is_public = false`,
          [ROLES.admin.email],
        )
      ).rows[0].n,
    );
    await client.end();
    await page.goto('/library/playlists');
    const card = page.getByRole('link', { name: /My Drafts/ });
    await expect(card).toBeVisible();
    if (own === 0) await expect(card).toContainText('No drafts yet');
    else await expect(card).toContainText(own === 1 ? '1 song' : `${own} songs`);
  });

  test('7: desktop song buttons: Practice is the one accent, Delete and Edit are neutral', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: ROLES.admin.storage, viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`/songs/${IDS.song}`);
    const practice = page.getByTestId('song-header-practice');
    const del = page.getByTestId('song-header-delete');
    const edit = page.getByTestId('song-header-edit');
    await expect(practice).toBeVisible();
    const accent = await rgb(page, 'var(--accent)');
    const danger = await rgb(page, 'var(--danger)');
    await expect(practice).toHaveCSS('background-color', accent);
    for (const b of [del, edit]) {
      const css = await b.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { bg: cs.backgroundColor, color: cs.color, border: cs.borderTopColor };
      });
      for (const v of Object.values(css)) {
        expect(v).not.toBe(accent);
        expect(v).not.toBe(danger);
      }
    }
    // The red appears in the confirmation, not before it.
    await del.click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await ctx.close();
  });
});


// ── Review round ───────────────────────────────────────────────────────────────────────────────────────────
const ARBITRARY = 'Zebra crossing text 12345';

test.describe('auth pages show translated messages by code', () => {
  test('the error page never prints text from the address', async ({ page }) => {
    await page.goto(`/auth/error?error=${encodeURIComponent(ARBITRARY)}&message=${encodeURIComponent(ARBITRARY)}&code=${encodeURIComponent(ARBITRARY)}`);
    await expect(page.getByText('We encountered an error during authentication')).toBeVisible();
    await expect(page.getByText(ARBITRARY)).toHaveCount(0);
    await page.goto('/auth/error?code=otp_expired');
    await expect(page.getByText('This link or code has expired. Request a new one.')).toBeVisible();
  });

  test('sign-in shows the sentence of a known code, the default text for anything else', async ({ page }) => {
    await page.goto(`/auth/login?message=${encodeURIComponent(ARBITRARY)}`);
    await expect(page.getByText(ARBITRARY)).toHaveCount(0);
    await expect(page.getByText('We encountered an error during authentication')).toBeVisible();
    await page.goto('/auth/login?message=login_required');
    await expect(page.getByText('Please sign in to open that page.')).toBeVisible();
  });

  test('a guest sent to sign-in from a protected page reads the translated sentence', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/auth\/login\?.*message=login_required/);
    await expect(page.getByText('Please sign in to open that page.')).toBeVisible();
  });

  test('the confirm route sends a bad link to the error page with a code only', async ({ page }) => {
    await page.goto(`/auth/confirm?secret_param=${encodeURIComponent(ARBITRARY)}`);
    await expect(page).toHaveURL(/\/auth\/error\?code=missing_params$/);
    await expect(page.getByText('This link is not valid. Request a new one.')).toBeVisible();
  });
});

test('2 (review): opening the menu does not stop auto-scroll, and the speed changes while it runs', async ({ page }) => {
  await page.goto(`/songs/${IDS.song}`);
  await page.setViewportSize({ width: 390, height: 520 });
  await page.evaluate(() => { document.body.style.minHeight = '6000px'; });
  const toggle = page.getByTestId('autoscroll-toggle');
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  const sheet = await openSongMenu(page);
  await expect(toggle).toHaveAttribute('aria-pressed', 'true'); // still running with the menu open
  const speed = sheet.getByTestId('scroll-speed');
  await expect(speed).toHaveText('Speed 3 of 5');
  await sheet.getByRole('button', { name: 'Faster' }).click();
  await expect(speed).toHaveText('Speed 4 of 5');
  const y0 = await page.evaluate(() => window.scrollY);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(y0 + 20); // and it keeps moving
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
});

test.describe('member', () => {
  test.use({ storageState: ROLES.member.storage });

  test('3 (review): switching version drops a recording link, so a reload shows the version that was chosen', async ({ page }) => {
    await page.goto(`/songs/${IDS.song}?recording=${IDS.recording}`);
    await expect(page.getByRole('radio', { name: 'Original' })).toHaveAttribute('aria-checked', 'true');
    await page.getByRole('dialog').getByRole('button', { name: 'Close' }).first().click().catch(() => {});
    await page.keyboard.press('Escape');
    await page.getByRole('radio', { name: 'Simplified' }).click();
    await expect(page.getByRole('radio', { name: 'Simplified' })).toHaveAttribute('aria-checked', 'true');
    await expect(page).toHaveURL(new RegExp(`\\?version=${IDS.simplified}$`));
    expect(page.url()).not.toContain('recording=');
    await page.reload();
    await expect(page.getByRole('radio', { name: 'Simplified' })).toHaveAttribute('aria-checked', 'true');
  });
});

test.describe('admin', () => {
  test.use({ storageState: ROLES.admin.storage });

  test('4 (review): the My Drafts card opens exactly the drafts it counts', async ({ page }) => {
    const client = new pg.Client({ connectionString: DATABASE_URL });
    await client.connect();
    const own = Number(
      (
        await client.query(
          `SELECT count(*) AS n FROM public.compositions c JOIN public.profiles p ON p.id = c.owner_id
            WHERE p.email = $1 AND c.is_public = false`,
          [ROLES.admin.email],
        )
      ).rows[0].n,
    );
    await client.end();
    test.skip(own === 0 || own > 15, 'needs a few own drafts (and fewer than one page) in the seed');
    await page.goto('/library/playlists');
    await page.getByRole('link', { name: /My Drafts/ }).click();
    await expect(page).toHaveURL(/mine=true/);
    await expect(page).toHaveURL(/status=draft/);
    await expect(page.getByTestId('song-row')).toHaveCount(own);
  });
});
