// Before/after states for UX v2 validation round 1 (fixes 1 to 7), at 390 px.
// Usage (via capture-validation-1.sh): UX_BASE_URL=... UX_OUT=... UX_SCHEME=light|dark node scripts/dev/ux/capture-validation-1.mjs
// Needs the local Supabase stack (it creates, and removes again, one two-version fixture song for fix 7).
import { chromium, BASE, SONGS, newContext, settle, shot, createRequire_pg } from './lib.mjs';

const pg = createRequire_pg();
const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const FIXTURE_TITLE = 'UX validation 1 fixture';
const vp = 'mobile';

async function withFixture(fn) {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  let id;
  try {
    await client.query('DELETE FROM public.compositions WHERE title = $1', [FIXTURE_TITLE]);
    // Song-level flag says "chords" because the Original has them; Simplified is lyrics only.
    id = (
      await client.query(
        `INSERT INTO public.compositions (title, original_author, is_public, has_chords, has_melody)
         VALUES ($1, 'Fixture', true, true, false) RETURNING id`,
        [FIXTURE_TITLE],
      )
    ).rows[0].id;
    await client.query(
      `INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, key, created_at) VALUES
       ($1, 'Original', E'{key: E}\\n[E]Fire in the [A]night\\n[B]Sing it [E]slowly', 'E', now() - interval '1 hour'),
       ($1, 'Simplified', E'Fire in the night\\nSing it slowly', 'E', now())`,
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

// Guest ------------------------------------------------------------------------------------------------
{
  const context = await newContext(browser, vp, 'guest');
  const page = await context.newPage();
  await step('01 song that fits: no auto-scroll', async () => {
    await page.setViewportSize({ width: 390, height: 1600 });
    await page.goto(`${BASE}/songs/${SONGS.musicianSong}`, { waitUntil: 'domcontentloaded' });
    await settle(page);
    await shot(page, vp, 'guest', '01-song-fits-no-autoscroll', { fullPage: false });
    await page.setViewportSize({ width: 390, height: 844 });
  });
  await step('02 meta expanded', async () => {
    await page.goto(`${BASE}/songs/${SONGS.musicianSong}`, { waitUntil: 'domcontentloaded' });
    await settle(page);
    await page.getByTestId('song-meta-line').click();
    await page.waitForTimeout(400);
    await shot(page, vp, 'guest', '02-meta-expanded', { fullPage: false });
  });
  await step('04 suggestions on the song list', async () => {
    await page.goto(`${BASE}/songs`, { waitUntil: 'domcontentloaded' });
    await settle(page);
    await page.getByPlaceholder(/Search \d+\+ songs/).click();
    await page.waitForTimeout(900);
    await shot(page, vp, 'guest', '04-suggestions-song-list', { fullPage: false });
  });
  await step('05 search options with a category', async () => {
    await page.goto(`${BASE}/songs?category=spiritual-concepts`, { waitUntil: 'domcontentloaded' });
    await settle(page);
    await page.getByRole('button', { name: /Search options/ }).first().click();
    await page.waitForTimeout(900);
    await shot(page, vp, 'guest', '05-search-options', { fullPage: false });
  });
  await step('06 simplified version has no Chords switch', async () => {
    await withFixture(async (id) => {
      await page.goto(`${BASE}/songs/${id}`, { waitUntil: 'domcontentloaded' });
      await settle(page);
      await page.getByRole('radio', { name: 'Simplified' }).click();
      await page.waitForTimeout(600);
      await shot(page, vp, 'guest', '06-simplified-no-chords-switch', { fullPage: false });
    });
  });
  await context.close();
}

// Member ----------------------------------------------------------------------------------------------
{
  const context = await newContext(browser, vp, 'member');
  const page = await context.newPage();
  await step('03 new playlist name field focused', async () => {
    await page.goto(`${BASE}/library/playlists/add`, { waitUntil: 'domcontentloaded' });
    await settle(page);
    await page.getByRole('textbox', { name: /Playlist name/ }).focus();
    await page.waitForTimeout(400);
    await shot(page, vp, 'member', '03-playlist-name-focus', { fullPage: false });
  });
  await context.close();
}
await browser.close();
