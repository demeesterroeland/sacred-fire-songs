import { test, expect } from '@playwright/test';
import pg from 'pg';
import en from '../../messages/en';
import { ROLES } from '../fixtures/roles';
import { SUGGEST_LINK_FIXTURE_IDS as IDS, SUGGEST_LINK_TITLES as TITLES } from '../fixtures/ids';
import { openSongMenu } from '../fixtures/songMenu';

/**
 * Story 6.2.26 / G1.5 (#598): a member suggests a song as a version of another song, an admin links them from the
 * suggestion, the member is told in the bell. Gherkin: docs/testing/ux-v3-suggest-song-link.feature (@e2e).
 * The journey deletes the source song, so it runs once (the desktop project) on fixed rows it resets first.
 */
const ADMIN_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

test.describe.configure({ mode: 'serial' });
test.use({ locale: 'en-US' });

test.beforeAll(async () => {
  const connectionString = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    const titles = [TITLES.source, TITLES.target];
    await client.query('DELETE FROM public.notifications WHERE type LIKE $1', ['link_suggestion_%']);
    await client.query('DELETE FROM public.song_link_suggestions WHERE source_title = ANY($1) OR target_title = ANY($1)', [titles]);
    await client.query('DELETE FROM public.song_link_audit WHERE source_title = ANY($1) OR target_title = ANY($1)', [titles]);
    await client.query('DELETE FROM public.composition_redirects WHERE old_id = ANY($1)', [[IDS.source, IDS.target]]);
    await client.query('DELETE FROM public.song_versions WHERE id = ANY($1)', [[IDS.sourceVersion, IDS.targetVersion]]);
    await client.query('DELETE FROM public.compositions WHERE id = ANY($1)', [[IDS.source, IDS.target]]);
    for (const [song, version, title] of [
      [IDS.source, IDS.sourceVersion, TITLES.source],
      [IDS.target, IDS.targetVersion, TITLES.target],
    ]) {
      await client.query(
        `INSERT INTO public.compositions (id, title, is_public, owner_id) VALUES ($1, $2, true, $3)`,
        [song, title, ADMIN_ID],
      );
      await client.query(
        `INSERT INTO public.song_versions (id, composition_id, content_chordpro, version_name) VALUES ($1, $2, '[C]Weyo wey', 'Standard')`,
        [version, song],
      );
    }
  } finally {
    await client.end();
  }
});

test('a member suggests, an admin links from the suggestion, the member is told', async ({ browser }, testInfo) => {
  test.skip(!/desktop/.test(testInfo.project.name), 'one project is enough: the journey deletes the source song');

  // The member suggests from the song menu.
  const member = await browser.newContext({ storageState: ROLES.member.storage, locale: 'en-US' });
  const memberPage = await member.newPage();
  await memberPage.goto(`/songs/${IDS.source}`);
  const sheet = await openSongMenu(memberPage);
  await expect(sheet.getByTestId('song-menu-link-version')).toHaveCount(0);
  await sheet.getByTestId('song-menu-suggest-version').click();
  await memberPage.getByRole('searchbox', { name: en['suggest.sheet.searchLabel'] }).fill('E2E Suggest Target');
  await memberPage.getByRole('button', { name: `Pick ${TITLES.target}` }).click();
  await memberPage.getByLabel(en['suggest.confirm.noteLabel']).fill('Same song');
  await memberPage.getByTestId('suggest-send').click();
  await expect(memberPage.getByText(en['suggest.sent'])).toBeVisible();

  // The admin sees it, with what a link would move, and links.
  const admin = await browser.newContext({ storageState: ROLES.admin.storage, locale: 'en-US' });
  const adminPage = await admin.newPage();
  await adminPage.goto('/suggestions');
  const row = adminPage.getByTestId('suggestion-row').filter({ hasText: TITLES.source });
  await expect(row).toBeVisible();
  await row.getByRole('button').first().click();
  await expect(adminPage.getByTestId('review-preview')).toBeVisible();
  await expect(adminPage.getByText(/There is no undo/)).toBeVisible();
  await adminPage.getByTestId('suggest-link').click();
  await expect(adminPage.getByTestId('review-suggestion-sheet')).toHaveCount(0);

  // The old link opens the song that stays, and the member has a bell item.
  await adminPage.goto(`/songs/${IDS.source}`);
  await expect(adminPage.getByRole('heading', { name: TITLES.target }).first()).toBeVisible();
  await memberPage.goto('/');
  await memberPage.getByRole('button', { name: /Notifications/ }).click();
  await expect(memberPage.getByText(`${TITLES.source} was linked as a version of ${TITLES.target}.`)).toBeVisible();

  await member.close();
  await admin.close();
});
