// Phase 1: capture every route for every role and viewport (mobile first).
// Usage: PLAYWRIGHT_FROM=/path/with/node_modules/ node scripts/dev/ux/capture-routes.mjs [mobile|desktop]
import { chromium, BASE, SONGS, newContext, routeSelected, settle, shot } from './lib.mjs';

const ROUTES = [
  ['01-home', '/'],
  ['02-songs-search', '/songs'],
  ['03-song-detail', `/songs/${SONGS.musicianSong}`],
  ['04-song-detail-own', `/songs/${SONGS.memberSong}`],
  ['05-song-detail-admin-owned', `/songs/${SONGS.adminSong}`],
  ['06-song-add', '/songs/add'],
  ['07-song-edit-own', `/songs/${SONGS.memberSong}/edit`],
  ['08-song-edit-other', `/songs/${SONGS.musicianSong}/edit`],
  ['09-library', '/library'],
  ['10-playlists', '/library/playlists'],
  ['11-playlist-add', '/library/playlists/add'],
  ['12-recently-viewed', '/library/recently-viewed'],
  ['13-artists', '/library/artists'],
  ['14-albums', '/library/albums'],
  ['15-settings', '/account/settings'],
  ['16-admin', '/admin'],
  ['17-admin-users', '/admin/users'],
  ['20-auth-login', '/auth/login'],
  ['21-auth-sign-up', '/auth/sign-up'],
  ['22-auth-sign-up-success', '/auth/sign-up-success'],
  ['23-auth-forgot-password', '/auth/forgot-password'],
  ['24-auth-update-password', '/auth/update-password'],
  ['25-auth-finish-registration', '/auth/finish-registration'],
  ['26-auth-error', '/auth/error?error=Example%20error'],
  ['28-user-profile', '/users/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'], // musician profile (singer attribution target)
  ['30-not-found', '/this-page-does-not-exist'],
  ['31-song-not-found', '/songs/00000000-0000-0000-0000-000000000000'],
  ['32-offline-fallback', '/offline.html'],
];

const viewports = process.argv[2] ? [process.argv[2]] : ['mobile', 'desktop'];
const browser = await chromium.launch();
const visited = [];
for (const vp of viewports) {
  for (const role of (process.env.UX_ROLES?.split(',') ?? ['guest', 'member', 'admin'])) {
    console.log(`\n== ${vp} / ${role}`);
    const context = await newContext(browser, vp, role);
    const page = await context.newPage();
    for (const [name, route] of ROUTES) {
      if (!routeSelected(name)) continue;
      try {
        await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await settle(page);
        await shot(page, vp, role, name);
        visited.push({ vp, role, name, route, landed: page.url().replace(BASE, '') });
      } catch (e) {
        console.log(`  ❌ ${name} ${route}: ${e.message.split('\n')[0]}`);
      }
    }
    // A playlist detail: open the first playlist card we can find.
    if (routeSelected('18-playlist-detail')) try {
      await page.goto(`${BASE}/library/playlists`);
      await settle(page);
      const link = page.locator('a[href^="/library/playlists/"]:not([href$="/add"])').first();
      const href = await link.getAttribute('href', { timeout: 4000 });
      await page.goto(`${BASE}${href}`);
      await settle(page);
      await shot(page, vp, role, '18-playlist-detail');
      visited.push({ vp, role, name: '18-playlist-detail', route: href, landed: page.url().replace(BASE, '') });
    } catch (e) {
      console.log(`  ⚠️  no playlist detail: ${e.message.split('\n')[0]}`);
    }
    // Admin user detail
    if (role === 'admin' && routeSelected('19-admin-user-detail')) {
      try {
        await page.goto(`${BASE}/admin/users`);
        await settle(page);
        const href = await page.locator('a[href^="/admin/users/"]').first().getAttribute('href', { timeout: 4000 });
        await page.goto(`${BASE}${href}`);
        await settle(page);
        await shot(page, vp, role, '19-admin-user-detail');
      } catch (e) {
        console.log(`  ⚠️  no admin user detail: ${e.message.split('\n')[0]}`);
      }
    }
    await context.close();
  }
}
await browser.close();
console.log('\nRedirects:');
for (const v of visited) if (v.landed.split('?')[0] !== v.route.split('?')[0]) console.log(`  ${v.vp}/${v.role} ${v.route} -> ${v.landed}`);
