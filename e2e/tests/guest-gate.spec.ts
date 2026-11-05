import { test, expect, type Page } from '@playwright/test';
import { ROLES } from '../fixtures/roles';

// Story 6.1.26 / G6.1 (#410): one GuestGate on every members-only screen —
// a locked preview with the reason and a "Sign in" link that carries next= back.
// Seeded song ids change with every reseed: pick the first public song from the list.
async function firstPublicSongId(page: Page): Promise<string> {
  await page.goto('/songs');
  const link = page.locator('a[href^="/songs/"]:not([href="/songs/add"])').first();
  await expect(link).toBeVisible();
  const href = (await link.getAttribute('href')) ?? '';
  return href.replace('/songs/', '').split(/[/?#]/)[0];
}

const GATED: Array<{ path: string; feature: string }> = [
  { path: '/library/recently-viewed', feature: 'history' },
  { path: '/library/playlists/add', feature: 'newPlaylist' },
  { path: '/library/playlists', feature: 'smartPlaylists' },
  { path: '/account/settings', feature: 'settings' },
  { path: '/account/settings?tab=privacy', feature: 'settings' },
  { path: '/users/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', feature: 'profile' },
];

test.describe('GuestGate on members-only screens @smoke', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const { path, feature } of GATED) {
    test(`guest on ${path} sees the "${feature}" gate and returns after sign-in`, async ({ page }) => {
      await page.goto(path);
      const gate = page.getByTestId('guest-gate').first();
      await expect(gate).toBeVisible();
      await expect(gate).toHaveAttribute('data-feature', feature);
      await expect(page).toHaveURL((url) => url.pathname + url.search === path);

      const signIn = gate.getByRole('link', { name: 'Sign in' });
      await expect(signIn).toHaveAttribute('href', `/auth/login?next=${encodeURIComponent(path)}`);
      const box = await signIn.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);

      await signIn.click();
      await expect(page).toHaveURL((url) => url.pathname === '/auth/login' && url.searchParams.get('next') === path);
    });
  }

  test('guest on a song edit link sees the "edit" gate and returns after sign-in', async ({ page }) => {
    const path = `/songs/${await firstPublicSongId(page)}/edit`;
    await page.goto(path);
    const gate = page.getByTestId('guest-gate');
    await expect(gate).toHaveAttribute('data-feature', 'edit');
    await expect(page.getByTestId('not-yours-to-edit')).toHaveCount(0);
    await expect(gate.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', `/auth/login?next=${encodeURIComponent(path)}`);
  });

  test('guest on a recording link without access gets the sharing gate', async ({ page }) => {
    await page.goto('/recordings/00000000-0000-4000-8000-000000000000');
    const gate = page.getByTestId('guest-gate');
    await expect(gate).toHaveAttribute('data-feature', 'sharing');
    await expect(gate.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/auth/login?next=%2Frecordings%2F00000000-0000-4000-8000-000000000000',
    );
  });

  test('guest adding a song to a playlist gets the add-to-playlist gate in a sheet', async ({ page }) => {
    await page.goto(`/songs/${await firstPublicSongId(page)}`);
    await page.getByTestId('song-action-playlist').click(); // phone layout: the sticky action bar (#393)
    const gate = page.locator('[data-testid="guest-gate"][data-feature="addToPlaylist"]');
    await expect(gate).toHaveAttribute('data-feature', 'addToPlaylist');
    await expect(gate.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', /\/auth\/login\?next=%2Fsongs%2F/);
  });

  test('guest tapping the heart gets the favourites gate whose Sign in keeps the query string', async ({ page }) => {
    await page.goto(`/songs/${await firstPublicSongId(page)}?ref=heart`);
    await page.getByTestId('song-action-favorite').click(); // phone layout: the heart lives in the action bar (#393)
    const gate = page.locator('[data-testid="guest-gate"][data-feature="favourites"]');
    await expect(gate).toBeVisible();
    await expect(gate.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      /\/auth\/login\?next=%2Fsongs%2F[^&]+%3Fref%3Dheart$/,
    );
    await expect(page.getByText('Sign in to save favorites')).toHaveCount(0);
  });
});

test.describe('Members keep their screens', () => {
  test.use({ storageState: ROLES.member.storage });

  for (const hostile of ['//example.org', '/%5Cexample.org', '/%2F%2Fexample.org']) {
    test(`signed-in member opening login with next=${hostile} never leaves the site`, async ({ page }) => {
      await page.goto(`/auth/login?next=${hostile}`);
      await expect(page).toHaveURL((url) => url.hostname === new URL(page.url()).hostname && url.pathname === '/');
    });
  }

  test('signed-in member opening login with a good next= lands on it, query kept', async ({ page }) => {
    await page.goto(`/auth/login?next=${encodeURIComponent('/songs?q=fire')}`);
    await expect(page).toHaveURL((url) => url.pathname === '/songs' && url.searchParams.get('q') === 'fire');
  });

  for (const path of ['/library/recently-viewed', '/library/playlists/add', '/account/settings']) {
    test(`member on ${path} sees no gate`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL((url) => url.pathname === path.split('?')[0]);
      await expect(page.getByTestId('guest-gate')).toHaveCount(0);
      await expect(page.getByText('This page couldn’t load')).toHaveCount(0);
    });
  }

  test('a member who does not own the song gets the warm copy and a plain way back', async ({ page }) => {
    // Ownership is random in the seed: open edit on the first songs until one is not the member's.
    await page.goto('/songs');
    const links = page.locator('a[href^="/songs/"]:not([href="/songs/add"])');
    await expect(links.first()).toBeVisible();
    const ids: string[] = [];
    for (const href of await links.evaluateAll((els) => els.slice(0, 12).map((e) => e.getAttribute('href') ?? ''))) {
      ids.push(href.replace('/songs/', '').split(/[/?#]/)[0]);
    }
    const notYours = page.getByTestId('not-yours-to-edit');
    const form = page.getByRole('heading', { name: 'Lyrics & chords' });
    let songId = '';
    for (const id of ids) {
      await page.goto(`/songs/${id}/edit`);
      await expect(notYours.or(form)).toBeVisible();
      if (await notYours.isVisible()) { songId = id; break; }
    }
    expect(songId, 'a song the member does not own').not.toBe('');
    await expect(page.getByTestId('guest-gate')).toHaveCount(0);
    await notYours.getByRole('link', { name: 'Back to the song' }).click();
    await expect(page).toHaveURL(new RegExp(`/songs/${songId}$`));
  });
});
