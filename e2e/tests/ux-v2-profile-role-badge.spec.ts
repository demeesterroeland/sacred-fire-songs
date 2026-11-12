import { test, expect } from '@playwright/test';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import { ROLES } from '../fixtures/roles';

/**
 * Story 6.1.38 (#534): one badge per role on a profile page.
 * Gherkin: docs/testing/ux-v2-profile-role-badge.feature (@e2e).
 *
 * A signed-in member sees every role; a guest reads no role from public_profiles.
 */
test.use({ storageState: ROLES.member.storage, viewport: { width: 390, height: 844 } });

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

const ids: Record<'admin' | 'gatekeeper' | 'musician', string> = { admin: '', gatekeeper: '', musician: '' };

test.beforeAll(async () => {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    for (const key of Object.keys(ids) as (keyof typeof ids)[]) {
      const { rows } = await client.query<{ id: string }>('SELECT id FROM public.profiles WHERE email = $1', [
        ROLES[key].email,
      ]);
      if (!rows[0]) throw new Error(`Seeded profile missing for ${key}`);
      ids[key] = rows[0].id;
    }
  } finally {
    await client.end();
  }
});

test('a member sees the admin badge and no e-mail address @story-6.1.38', async ({ page }) => {
  await page.goto(`/users/${ids.admin}`);
  const badge = page.getByTestId('profile-role-badge');
  await expect(badge).toHaveText('Admin');
  await expect(badge).toHaveAttribute('data-role', 'admin');
  await expect(badge.locator('svg[data-icon="Shield"]')).toHaveCount(1);
  await expect(page.locator('h1')).not.toBeEmpty();
  await expect(page.locator('body')).not.toContainText(ROLES.admin.email);
  await expect(page.locator('body')).not.toContainText('@');
});

test('the gatekeeper and expert badges have their own label and icon @story-6.1.38', async ({ page }) => {
  await page.goto(`/users/${ids.gatekeeper}`);
  await expect(page.getByTestId('profile-role-badge')).toHaveText('Gatekeeper');
  await expect(page.getByTestId('profile-role-badge').locator('svg[data-icon="KeyRound"]')).toHaveCount(1);

  // ROLES.musician signs in with the seeded expert account.
  await page.goto(`/users/${ids.musician}`);
  await expect(page.getByTestId('profile-role-badge')).toHaveText('Expert');
  await expect(page.getByTestId('profile-role-badge').locator('svg[data-icon="Award"]')).toHaveCount(1);
});

test('a guest reads no role from public_profiles @story-6.1.38', async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  test.skip(!url || !key, 'needs the local Supabase URL and publishable key');
  const anon = createClient(url!, key!, { auth: { persistSession: false } });
  const { data, error } = await anon.from('public_profiles').select('id, role').eq('id', ids.admin).maybeSingle();
  expect(error).toBeNull();
  expect(data?.id).toBe(ids.admin);
  expect(data?.role).toBeNull();
});
