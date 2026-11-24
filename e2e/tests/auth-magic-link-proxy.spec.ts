import { test, expect } from '@playwright/test';

/**
 * #623: a magic link opened through the app's same-origin `/supabase-api` proxy signs the user in.
 * Gherkin: docs/testing/supabase-api-proxy.feature.
 *
 * Self-hosted setups point the auth server's external URL at `<app>/supabase-api`, so the emailed
 * link is `<app>/supabase-api/auth/v1/verify?...`. Locally the auth server mails its own address,
 * so the spec rewrites that link onto the proxy. The verify step must reach the browser as a 303
 * with the code; before the fix the proxy followed it on the server and answered 500.
 *
 * Needs the local Supabase stack with its mail catcher (supabase/config.toml [local_smtp]).
 */
test.use({ storageState: { cookies: [], origins: [] } });

const MAIL_API = process.env.E2E_MAIL_API ?? 'http://127.0.0.1:54324/api/v1';
const EMAIL = 'member@sfs.example';

interface MailSummary { ID: string; To: Array<{ Address: string }> }

async function latestMailTo(address: string): Promise<string> {
  for (let i = 0; i < 30; i++) {
    const res = await fetch(`${MAIL_API}/search?query=${encodeURIComponent(`to:${address}`)}`);
    const { messages } = (await res.json()) as { messages: MailSummary[] };
    if (messages?.length) {
      const msg = await (await fetch(`${MAIL_API}/message/${messages[0].ID}`)).json();
      return `${msg.Text ?? ''}\n${msg.HTML ?? ''}`;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`No mail for ${address}`);
}

test.describe('Magic link through the Supabase API proxy (#623)', () => {
  test('the verify redirect reaches the browser and signs the user in', async ({ page, baseURL }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop-headless', 'one browser is enough');
    test.skip(!(await fetch(`${MAIL_API}/messages`).then((r) => r.ok).catch(() => false)), 'no local mail catcher');
    await fetch(`${MAIL_API}/messages`, { method: 'DELETE' });

    await page.goto('/auth/login');
    await page.locator('#email').fill(EMAIL);
    await page.locator('form button[type="submit"]').click();

    const body = await latestMailTo(EMAIL);
    const raw = body.match(/https?:\/\/[^\s"'<>]+\/auth\/v1\/verify\?[^\s"'<>]+/)?.[0];
    expect(raw, 'verify link in the mail').toBeTruthy();
    const emailed = new URL(raw!.replace(/&amp;/g, '&'));
    const viaProxy = `${baseURL}/supabase-api/auth/v1/verify${emailed.search}`;

    const verify = await page.request.get(viaProxy, { maxRedirects: 0 });
    expect(verify.status()).toBe(303);
    const location = new URL(verify.headers()['location'], baseURL);
    const code = location.searchParams.get('code');
    expect(code, `code in Location ${location}`).toBeTruthy();

    // The local auth server only allows its default site URL, so open the callback on the app under test.
    // Not followed: a production build behind no TLS proxy answers with an https:// redirect.
    const callback = await page.request.get(`/auth/callback?code=${encodeURIComponent(code!)}`, { maxRedirects: 0 });
    expect(callback.status()).toBeGreaterThanOrEqual(300);
    expect(callback.status()).toBeLessThan(400);
    expect(new URL(callback.headers()['location']).pathname).not.toMatch(/^\/auth\/(error|login)/);
    const setCookies = callback.headersArray().filter((h) => h.name.toLowerCase() === 'set-cookie').map((h) => h.value);
    expect(setCookies.some((c) => /^sb-(?:[^=]*-)?auth-token(?:\.\d+)?=[^;]+/.test(c)), 'session cookie set').toBe(true);
  });
});
