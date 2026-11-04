// Phase 2: capture interactive states (menus, modals, drawers, recorder, sharing) that
// have no route of their own. Mobile first.
// Usage: PLAYWRIGHT_FROM=/path/with/node_modules/ node scripts/ux/capture-flows.mjs [mobile|desktop]
import { chromium, BASE, SONGS, newContext, settle, shot } from './lib.mjs';

const vp = process.argv[2] ?? 'mobile';
const only = process.env.UX_ROLES?.split(',');
// Fake microphone so the recorder can run headless.
const browser = await chromium.launch({
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'],
});

async function step(label, fn) {
  try {
    await fn();
  } catch (e) {
    console.log(`  ❌ ${label}: ${e.message.split('\n')[0]}`);
  }
}

async function go(page, route) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await settle(page);
}

async function escape(page) {
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(400);
}

async function openDrawer(page) {
  const direct = page.locator('button[title="Recordings"]').filter({ visible: true }).first();
  if (await direct.count()) {
    await direct.click();
  } else {
    await page.locator('button[aria-label="More actions"]').filter({ visible: true }).first().click();
    await page.waitForTimeout(400);
    await page.locator('button:has-text("Recordings")').filter({ visible: true }).first().click();
  }
  await page.locator('h3:has-text("Rehearsal Space")').waitFor({ timeout: 10000 });
  await page.waitForTimeout(1000);
}

async function openRecordingMenu(page, index = 0) {
  // Row-level "More actions" buttons live inside the drawer.
  const drawer = page.locator('h3:has-text("Rehearsal Space")').locator('xpath=ancestor::*[contains(@class,"fixed")][1]');
  await drawer.locator('button[aria-label="More actions"]').nth(index).click();
  await page.waitForTimeout(500);
}

async function common(page, role) {
  await step('home', async () => {
    await go(page, '/');
    await shot(page, vp, role, '40-home-viewport', { fullPage: false });
  });
  await step('hamburger menu', async () => {
    await page.getByRole('button', { name: 'Open menu' }).filter({ visible: true }).first().click();
    await page.waitForTimeout(700);
    await shot(page, vp, role, '41-side-menu', { fullPage: false });
    await escape(page);
  });
  await step('search modal', async () => {
    await go(page, '/');
    await page.getByPlaceholder(/Search/).filter({ visible: true }).first().click();
    await page.waitForTimeout(800);
    await shot(page, vp, role, '42-search-modal', { fullPage: false });
    await page.keyboard.type('agua');
    await page.waitForTimeout(1500);
    await shot(page, vp, role, '43-search-typing', { fullPage: false });
    await escape(page);
  });
  await step('search filters', async () => {
    await go(page, '/songs');
    await page.getByRole('button', { name: /Search options|Show search options/ }).filter({ visible: true }).first().click();
    await page.waitForTimeout(800);
    await shot(page, vp, role, '44-search-filters', { fullPage: false });
    await escape(page);
  });
  await step('account menu', async () => {
    await go(page, '/');
    const account = page.getByRole('button', { name: 'Account menu' }).filter({ visible: true }).first();
    if (!(await account.count())) throw new Error('no account menu for this role');
    await account.click();
    await page.waitForTimeout(600);
    await shot(page, vp, role, '45-account-menu', { fullPage: false });
    await escape(page);
  });
  await step('create menu', async () => {
    await go(page, '/');
    await page.getByText('Create', { exact: true }).filter({ visible: true }).last().click();
    await page.waitForTimeout(700);
    await shot(page, vp, role, '46-create-menu', { fullPage: false });
    await escape(page);
  });

  // ---- Song detail: viewer tools, more-actions sheet, rehearsal drawer
  await step('song viewport', async () => {
    await go(page, `/songs/${SONGS.memberSong}`);
    await shot(page, vp, role, '50-song-viewport', { fullPage: false });
  });
  await step('song more actions', async () => {
    await page.locator('button[aria-label="More actions"]').filter({ visible: true }).first().click();
    await page.waitForTimeout(600);
    await shot(page, vp, role, '51-song-more-actions', { fullPage: false });
    await escape(page);
  });
  await step('add to playlist', async () => {
    await go(page, `/songs/${SONGS.memberSong}`);
    const btn = page.getByRole('button', { name: /playlist/i }).filter({ visible: true }).first();
    if (!(await btn.count())) {
      await page.locator('button[aria-label="More actions"]').filter({ visible: true }).first().click();
      await page.waitForTimeout(400);
    }
    await page.getByRole('button', { name: /playlist/i }).filter({ visible: true }).first().click();
    await page.waitForTimeout(900);
    await shot(page, vp, role, '52-add-to-playlist', { fullPage: false });
    await escape(page);
  });
  await step('drawer reference tracks', async () => {
    await go(page, `/songs/${SONGS.memberSong}`);
    await openDrawer(page);
    await page.locator('button:has-text("Reference Tracks")').filter({ visible: true }).first().click().catch(() => {});
    await page.waitForTimeout(800);
    await shot(page, vp, role, '60-drawer-reference-tracks', { fullPage: false });
    const yt = page.locator('button:has-text("YouTube")').filter({ visible: true }).first();
    if (await yt.count()) {
      await yt.click();
      await page.waitForTimeout(2500);
      await shot(page, vp, role, '61-drawer-youtube-loaded', { fullPage: false });
    }
    const sp = page.locator('button:has-text("Spotify")').filter({ visible: true }).first();
    if (await sp.count()) {
      await sp.click();
      await page.waitForTimeout(2500);
      await shot(page, vp, role, '62-drawer-spotify-loaded', { fullPage: false });
    }
  });
  await step('drawer voice recorder', async () => {
    await page.locator('button:has-text("Voice Recorder")').filter({ visible: true }).first().click();
    await page.waitForTimeout(1500);
    await shot(page, vp, role, '63-drawer-voice-recorder', { fullPage: false });
    await shot(page, vp, role, '63b-drawer-voice-recorder-full', { fullPage: true });
  });
}

async function memberRecording(page, role) {
  await step('record a take', async () => {
    await go(page, `/songs/${SONGS.musicianSong}`);
    await openDrawer(page);
    await page.locator('button:has-text("Voice Recorder")').filter({ visible: true }).first().click().catch(() => {});
    await page.waitForTimeout(800);
    await page.locator('button[title="Start recording"]').click();
    await page.waitForTimeout(2500);
    await shot(page, vp, role, '64-recorder-recording', { fullPage: false });
    await page.locator('button[title="Stop recording"]').click();
    await page.waitForTimeout(1500);
    await shot(page, vp, role, '65-recorder-review', { fullPage: false });
    // Discard so reruns stay idempotent.
    await page.getByRole('button', { name: 'Discard' }).click().catch(() => {});
    await page.waitForTimeout(800);
  });
  await step('recording row menu', async () => {
    await go(page, `/songs/${SONGS.memberSong}`);
    await openDrawer(page);
    await page.locator('button:has-text("Voice Recorder")').filter({ visible: true }).first().click().catch(() => {});
    await page.waitForTimeout(1200);
    await openRecordingMenu(page, 0);
    await shot(page, vp, role, '66-recording-row-menu', { fullPage: false });
  });
  for (const [name, item] of [
    ['67-recording-share-modal', 'Share'],
    ['68-recording-publish-modal', /Make public|Make Public|Publish/],
    ['69-recording-attribution-modal', 'Singer Attribution'],
    ['70-recording-rename', 'Edit recording name'],
    ['71-recording-delete-confirm', 'Delete recording'],
  ]) {
    await step(name, async () => {
      await go(page, `/songs/${SONGS.memberSong}`);
      await openDrawer(page);
      await page.locator('button:has-text("Voice Recorder")').filter({ visible: true }).first().click().catch(() => {});
      await page.waitForTimeout(1200);
      await openRecordingMenu(page, 0);
      await page.getByRole('menuitem', { name: item }).first().click();
      await page.waitForTimeout(900);
      await shot(page, vp, role, name, { fullPage: false });
      await escape(page);
    });
  }
  await step('mini player', async () => {
    await go(page, `/songs/${SONGS.memberSong}`);
    await openDrawer(page);
    await page.locator('button:has-text("Voice Recorder")').filter({ visible: true }).first().click().catch(() => {});
    await page.waitForTimeout(1200);
    await page.locator('button[title="Play"]').filter({ visible: true }).first().click();
    await page.waitForTimeout(2000);
    await shot(page, vp, role, '72-recording-playing', { fullPage: false });
    await page.getByRole('button', { name: 'Close' }).filter({ visible: true }).first().click();
    await page.waitForTimeout(1000);
    await shot(page, vp, role, '73-mini-player', { fullPage: false });
    await page.locator('button[title="Stop"]').filter({ visible: true }).first().click().catch(() => {});
  });
}

async function sharedWithMe(page, role) {
  await step('shared recording seen by recipient', async () => {
    await go(page, `/songs/${SONGS.memberSong}`);
    await openDrawer(page);
    await page.locator('button:has-text("Voice Recorder")').filter({ visible: true }).first().click().catch(() => {});
    await page.waitForTimeout(1500);
    await shot(page, vp, role, '74-shared-with-you', { fullPage: false });
    await shot(page, vp, role, '74b-shared-with-you-full', { fullPage: true });
    await openRecordingMenu(page, 0).catch(() => {});
    await shot(page, vp, role, '75-shared-recording-menu', { fullPage: false });
  });
}

async function adminExtras(page, role) {
  await step('admin users sort/filter', async () => {
    await go(page, '/admin/users');
    await shot(page, vp, role, '80-admin-users-viewport', { fullPage: false });
  });
}

const roles = only ?? ['guest', 'member', 'admin', 'gatekeeper'];
for (const role of roles) {
  console.log(`\n== ${vp} / ${role}`);
  const context = await newContext(browser, vp, role);
  await context.grantPermissions(['microphone'], { origin: BASE }).catch(() => {});
  const page = await context.newPage();
  if (role !== 'gatekeeper') await common(page, role);
  if (role === 'member' || role === 'admin') await memberRecording(page, role);
  if (role === 'gatekeeper') await sharedWithMe(page, role);
  if (role === 'admin') await adminExtras(page, role);
  await context.close();
}
await browser.close();
