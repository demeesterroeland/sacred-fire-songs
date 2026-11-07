// Before/after states for UX v2 validation round 2 (batch 2, items 1 to 11 and 16), at 390 px, plus desktop for item 7.
// Usage (via capture-validation-2.sh): UX_BASE_URL=... UX_OUT=... UX_SCHEME=light|dark node scripts/dev/ux/capture-validation-2.mjs
// Needs the local Supabase stack (it creates, and removes again, one fixture song with a lyrics-only version).
// Selectors are role/label based so that the same script runs against the "before" and the "after" build.
import { chromium, BASE, SONGS, newContext, settle, shot, createRequire_pg } from './lib.mjs';

const pg = createRequire_pg();
const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const FIXTURE_TITLE = 'UX validation 2 fixture';
const LONG_TITLE_SONG = process.env.UX_SONG_LONG_TITLE ?? '02c913b3-3ccc-4ffc-8119-8d974ae578d8';
const vp = 'mobile';

async function withFixture(fn) {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  let id;
  try {
    await client.query('DELETE FROM public.compositions WHERE title = $1', [FIXTURE_TITLE]);
    id = (
      await client.query(
        `INSERT INTO public.compositions (title, original_author, is_public, has_chords, has_melody)
         VALUES ($1, 'Fixture', true, true, false) RETURNING id`,
        [FIXTURE_TITLE],
      )
    ).rows[0].id;
    await client.query(
      `INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, key, created_at) VALUES
       ($1, 'Original', E'{key: E}\\n[Verse]\\n[E]Fire in the [A]night\\n[B]Sing it [E]slowly\\n[Chorus]\\n[A]Rise up [E]now', 'E', now() - interval '1 hour'),
       ($1, 'Simplified', E'[Verse]\\nFire in the night\\nSing it slowly\\n[Chorus]\\nRise up now\\n[Bridge]\\nStay with me\\n[Coda]\\nSlowly home', 'E', now())`,
      [id],
    );
    await fn(id);
  } finally {
    await client.query('DELETE FROM public.compositions WHERE title = $1', [FIXTURE_TITLE]);
    await client.end();
  }
}

const browser = await chromium.launch();
async function step(label, fn) {
  try {
    await fn();
  } catch (e) {
    console.log(`  ❌ ${label}: ${e.message.split('\n')[0]}`);
  }
}
const open = async (page, path) => {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
  await settle(page);
};

// Guest ------------------------------------------------------------------------------------------------
{
  const context = await newContext(browser, vp, 'guest');
  const page = await context.newPage();
  await step('01 sign in: header button', async () => {
    await open(page, '/songs');
    await shot(page, vp, 'guest', '01a-signin-header-button', { fullPage: false });
  });
  await step('01 sign in: login page', async () => {
    await open(page, '/auth/login');
    await shot(page, vp, 'guest', '01b-signin-login-page', { fullPage: false });
  });
  await step('04 category counts', async () => {
    await open(page, '/songs?category=spiritual-concepts');
    await page.getByRole('button', { name: /Search options/ }).first().click();
    await page.waitForTimeout(900);
    await shot(page, vp, 'guest', '04-category-counts', { fullPage: false });
  });
  await step('06 long title', async () => {
    await open(page, `/songs/${LONG_TITLE_SONG}`);
    await shot(page, vp, 'guest', '06a-long-title-top', { fullPage: false });
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(400);
    await shot(page, vp, 'guest', '06b-long-title-scrolled', { fullPage: false });
  });
  await step('10 reading tools sheet', async () => {
    await open(page, `/songs/${LONG_TITLE_SONG}`);
    await page.getByTestId('reader-tools-button').click();
    await page.waitForTimeout(600);
    await shot(page, vp, 'guest', '10-reading-tools-sheet', { fullPage: false });
  });
  await step('11 song menu', async () => {
    await open(page, `/songs/${LONG_TITLE_SONG}`);
    await shot(page, vp, 'guest', '11a-song-page-toolbar', { fullPage: false });
    await page.getByRole('button', { name: /More actions|Song menu|Tools/ }).first().click();
    await page.waitForTimeout(600);
    await shot(page, vp, 'guest', '11b-song-menu-open', { fullPage: false });
  });
  await step('16 section labels in a lyrics-only version', async () => {
    await withFixture(async (id) => {
      await open(page, `/songs/${id}`);
      await page.getByRole('radio', { name: 'Simplified' }).click();
      await page.waitForTimeout(600);
      await shot(page, vp, 'guest', '16-section-labels-lyrics-only', { fullPage: false });
    });
  });
  await step('05 version link', async () => {
    await withFixture(async (id) => {
      await open(page, `/songs/${id}`);
      await page.getByRole('radio', { name: 'Simplified' }).click();
      await page.waitForTimeout(600);
      console.log(`  ↪ url after switching version: ${page.url().replace(BASE, '')}`);
    });
  });
  await context.close();
}

// Member -----------------------------------------------------------------------------------------------
{
  const context = await newContext(browser, vp, 'member');
  const page = await context.newPage();
  await step('02 + button and 09 recordings card', async () => {
    await open(page, '/library/playlists');
    await shot(page, vp, 'member', '02-library-add-button', { fullPage: false });
    await page.evaluate(() => { const m = document.querySelector('main'); m?.scrollTo(0, 99999); window.scrollTo(0, 99999); });
    await page.waitForTimeout(400);
    await shot(page, vp, 'member', '02b-library-add-button-scrolled', { fullPage: false });
    await page.evaluate(() => { const m = document.querySelector('main'); m?.scrollTo(0, 0); window.scrollTo(0, 0); });
    await page.getByText(/Your (takes|recordings)/).first().scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(400);
    await shot(page, vp, 'member', '09-library-recordings-card', { fullPage: false });
  });
  await step('03 headings', async () => {
    await open(page, '/library/artists');
    await shot(page, vp, 'member', '03a-library-artists', { fullPage: false });
    await open(page, '/library/recently-viewed');
    await shot(page, vp, 'member', '03b-library-history', { fullPage: false });
  });
  await step('08 recording naming', async () => {
    await open(page, `/songs/${SONGS.memberSong}`);
    await page.getByTestId('song-action-practice').click();
    await page.waitForTimeout(1200);
    await shot(page, vp, 'member', '08-practice-recording-naming', { fullPage: false });
  });
  await step('07 song actions as a member (owner)', async () => {
    await open(page, `/songs/${SONGS.memberSong}`);
    await page.getByRole('button', { name: /More actions|Song menu/ }).first().click().catch(() => {});
    await page.waitForTimeout(600);
    await shot(page, vp, 'member', '11c-song-menu-owner', { fullPage: false });
  });
  await context.close();
}

// Desktop admin (item 7) --------------------------------------------------------------------------------
{
  const context = await newContext(browser, 'desktop', 'admin');
  const page = await context.newPage();
  await step('07 desktop song buttons', async () => {
    await open(page, `/songs/${SONGS.adminSong}`);
    await shot(page, 'desktop', 'admin', '07-desktop-song-buttons', { fullPage: false });
  });
  await context.close();
}
await browser.close();
