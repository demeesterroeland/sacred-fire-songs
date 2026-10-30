import { test, expect, type Page, type BrowserContext, type Locator } from '@playwright/test';
import en from '../../messages/en';
import nl from '../../messages/nl';
import es from '../../messages/es';
import it from '../../messages/it';
import ru from '../../messages/ru';
import qu from '../../messages/qu';
import fr from '../../messages/fr';
import pt from '../../messages/pt';
import { ROLES, TEST_PASSWORD } from '../fixtures/roles';

/**
 * Story 3.7.1 (#246) – @e2e scenarios of docs/testing/i18n.feature.
 * Expected texts come from the dictionaries, so copy changes don't break the spec.
 */

const LOCALE_KEY = 'sacred-fire-songs-locale'; // localStorage key and cookie name
type Dict = Partial<Record<keyof typeof en, string>>;

const sidebar = (page: Page) => page.locator('nav').filter({ has: page.getByTestId('language-switcher') });

const LABELS = { en: 'English', nl: 'Nederlands', es: 'Español', it: 'Italiano', ru: 'Русский', qu: 'Runasimi', fr: 'Français', pt: 'Português' } as const;

/** Opens the language picker inside `scope` and picks a language by its own name. */
async function chooseLanguage(page: Page, scope: Locator, code: keyof typeof LABELS) {
  await scope.getByTestId('language-switcher').click();
  await page.getByRole('listbox').getByRole('option', { name: LABELS[code] }).click();
  await expect(page.getByRole('listbox')).toHaveCount(0);
}

/** Sidebar variant: on mobile the drawer can close again right after hydration, so retry open + list. */
async function chooseInSidebar(page: Page, dict: Dict, code: keyof typeof LABELS) {
  await expect(async () => {
    await openSidebar(page, dict);
    await sidebar(page).getByTestId('language-switcher').click({ timeout: 2_000 });
    await expect(page.getByRole('listbox')).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 15_000 });
  await page.getByRole('listbox').getByRole('option', { name: LABELS[code] }).click();
  await expect(page.getByRole('listbox')).toHaveCount(0);
}

/**
 * On mobile the sidebar is collapsed behind the header menu button. Retry the
 * toggle until the drawer is open: a click before hydration has no handler.
 */
async function openSidebar(page: Page, dict: Dict) {
  const toggle = page.getByRole('button', { name: dict['header.openMenu'] });
  if (!(await toggle.isVisible())) return; // desktop: sidebar always visible
  const nav = sidebar(page);
  await expect(async () => {
    if (!/shadow-2xl/.test((await nav.getAttribute('class')) ?? '')) await toggle.click();
    await expect(nav).toHaveClass(/shadow-2xl/, { timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
}


async function expectSidebarLanguage(page: Page, dict: Dict) {
  await openSidebar(page, dict);
  await expect(sidebar(page).getByRole('link', { name: dict['nav.recentlyViewed'] })).toBeVisible();
}

async function presetDutch(context: BrowserContext, page: Page, baseURL: string) {
  await context.addCookies([{ name: LOCALE_KEY, value: 'nl', url: baseURL }]);
  await page.addInitScript((key) => window.localStorage.setItem(key, 'nl'), LOCALE_KEY);
}

test.describe('Interface language @i18n', () => {
  test.describe('I18N-01: unsupported browser language', () => {
    test.use({ locale: 'de-DE' });

    test('shows English when nothing was chosen', async ({ page }) => {
      await page.goto('/songs');
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expectSidebarLanguage(page, en);
    });
  });

  test.describe('I18N-02: Dutch browser language', () => {
    test.use({ locale: 'nl-BE' });

    test('server HTML is already Dutch on first render', async ({ request }) => {
      const res = await request.get('/songs', { headers: { 'Accept-Language': 'nl-BE,nl;q=0.9' } });
      expect(res.ok()).toBeTruthy();
      const html = await res.text();
      expect(html).toMatch(/<html[^>]*lang="nl"/);
      expect(html).toContain(nl['nav.recentlyViewed']);
    });

    test('browser default is used but not stored as a choice', async ({ page, context }) => {
      await page.goto('/songs');
      await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
      await expectSidebarLanguage(page, nl);
      expect(await page.evaluate((key) => window.localStorage.getItem(key), LOCALE_KEY)).toBeNull();
      expect((await context.cookies()).find((c) => c.name === LOCALE_KEY)).toBeUndefined();
    });
  });

  test.describe('I18N-03/04: guest switches language', () => {
    test.use({ locale: 'en-US' });

    test('switches to Dutch without a reload and keeps it after reload and navigation', async ({ page, context }) => {
      await page.goto('/songs');
      await expectSidebarLanguage(page, en);

      // Marker survives client-side updates but not a full reload.
      await page.evaluate(() => ((window as unknown as { __noReload: boolean }).__noReload = true));

      const switcher = sidebar(page).getByTestId('language-switcher');
      await chooseInSidebar(page, en, 'nl');

      await expect(sidebar(page).getByRole('link', { name: nl['nav.recentlyViewed'] })).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
      await expect(switcher).toContainText('Nederlands');
      await switcher.click();
      await expect(page.getByRole('option', { name: 'Nederlands' })).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByRole('option', { name: 'English' })).toHaveAttribute('aria-selected', 'false');
      await page.keyboard.press('Escape');
      await expect(switcher).toBeFocused();
      expect(await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload)).toBe(true);

      expect(await page.evaluate((key) => window.localStorage.getItem(key), LOCALE_KEY)).toBe('nl');
      expect((await context.cookies()).find((c) => c.name === LOCALE_KEY)?.value).toBe('nl');

      // I18N-04: reload
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
      await expectSidebarLanguage(page, nl);

      // I18N-04: navigation to a Server Component page (guest playlists view)
      await page.goto('/library/playlists');
      await expect(page.getByText(nl['playlists.smartPlaylists']!, { exact: true })).toBeVisible();

      // ...and back to English
      await openSidebar(page, nl);
      await chooseInSidebar(page, nl, 'en');
      await expect(page.getByText(en['playlists.smartPlaylists'], { exact: true })).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    });
  });

  test.describe('I18N-04: signed-in user', () => {
    // Fresh login (no shared storageState): signing out revokes the account's
    // sessions, so use the musician account, which no other spec reuses.
    test.use({ locale: 'en-US' });

    test('choice from Preferences survives signing out and in again', async ({ page, isMobile }) => {
      // Signing out is global for the account; run once (desktop) to avoid racing the mobile project.
      test.skip(isMobile, 'covered on desktop; sign-out would race the parallel mobile run');
      const { email } = ROLES.musician;

      const signIn = async (dict: Dict) => {
        await page.goto('/auth/login');
        await page.getByRole('button', { name: dict['auth.login.switchToPassword'] }).click();
        await page.locator('#email').fill(email);
        await page.locator('#password').fill(TEST_PASSWORD);
        await page.getByRole('button', { name: dict['auth.login.submit'], exact: true }).click();
        await page.waitForURL((url) => url.pathname === '/');
      };

      await signIn(en);
      await page.goto('/account/settings');
      await page.getByRole('button', { name: en['settings.tab.preferences'] }).click();
      await expect(page.getByText(en['settings.prefs.language.description'])).toBeVisible();
      await chooseLanguage(page, page.getByRole('main'), 'nl');
      await expect(page.getByRole('heading', { name: nl['settings.prefs.heading'] })).toBeVisible();

      // Sign out via the user menu (now in Dutch)
      await page.goto('/');
      await page.getByRole('button', { name: nl['userMenu.trigger'] }).click();
      await page.getByRole('button', { name: nl['userMenu.signOut'] }).click();
      await expect(page.getByRole('link', { name: nl['auth.login.submit'] }).first()).toBeVisible();

      // Still Dutch as a guest, and after signing in again
      await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
      await signIn(nl);
      await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
      await expectSidebarLanguage(page, nl);
    });
  });

  test.describe('I18N-05 / I18N-10: Dutch selected', () => {
    test.use({ locale: 'en-US' });

    test('no hydration mismatch is logged', async ({ page, context, baseURL }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', (err) => errors.push(err.message));

      await presetDutch(context, page, baseURL!);
      await page.goto('/songs');
      await expectSidebarLanguage(page, nl);
      await page.reload();
      await expectSidebarLanguage(page, nl);

      expect(errors.filter((e) => /hydrat|did not match|#418|#423|#425/i.test(e))).toEqual([]);
    });

    test('song content is not translated', async ({ page, context, baseURL }) => {
      await page.goto('/songs');
      const firstSong = page.locator('a[href^="/songs/"]:not([href="/songs/add"])').first();
      const href = await firstSong.getAttribute('href');
      if (!href) throw new Error('No song link found');

      await page.goto(href);
      const titleEn = (await page.locator('h1').first().innerText()).trim();

      await presetDutch(context, page, baseURL!);
      await page.goto(href);
      await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
      await expect(page.locator('h1').first()).toHaveText(titleEn);
    });
  });

  test.describe('I18N-12: every additional language', () => {
    test.use({ locale: 'en-US' });
    const LANGS = { es, it, ru, qu, fr, pt } as const;

    for (const [code, dict] of Object.entries(LANGS)) {
      test(`switches to ${code} and keeps it after reload`, async ({ page }) => {
        await page.goto('/songs');
        await chooseInSidebar(page, en, code as keyof typeof LABELS);
        await expect(page.locator('html')).toHaveAttribute('lang', code);
        await expect(sidebar(page).getByRole('link', { name: dict['nav.recentlyViewed'] })).toBeVisible();
        await page.reload();
        await expect(page.locator('html')).toHaveAttribute('lang', code);
        await expectSidebarLanguage(page, dict);
      });
    }
  });

  test.describe('I18N-12: Brazilian browser', () => {
    test.use({ locale: 'pt-BR' });

    test('defaults to Portuguese', async ({ page }) => {
      await page.goto('/songs');
      await expect(page.locator('html')).toHaveAttribute('lang', 'pt');
      await expectSidebarLanguage(page, pt);
    });
  });

  test.describe('I18N-03: keyboard and user menu', () => {
    test.use({ locale: 'en-US' });

    test('picks a language with the keyboard (type-ahead + Enter)', async ({ page, isMobile }) => {
      test.skip(isMobile, 'keyboard flow is a desktop concern');
      await page.goto('/songs');
      const switcher = sidebar(page).getByTestId('language-switcher');
      await switcher.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('listbox')).toBeVisible();
      await page.keyboard.press('n'); // → Nederlands
      await page.keyboard.press('Enter');
      await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
      await expect(switcher).toBeFocused();
      await expect(sidebar(page).getByRole('link', { name: nl['nav.recentlyViewed'] })).toBeVisible();
    });

    test.describe('signed in', () => {
      test.use({ storageState: ROLES.member.storage });

      test('picking from the user menu keeps the menu working', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: en['userMenu.trigger'] }).click();
        await chooseLanguage(page, page.getByTestId('user-menu'), 'es');
        await expect(page.locator('html')).toHaveAttribute('lang', 'es');
      });
    });
  });
});
