// Story 6.1.35 (#485), group 4 — docs/testing/ux-v2-sober-header.feature (@unit scenarios). The rendered user
// menu and bell are covered in testing/unit/tests/design/soberHeader.test.tsx; the @e2e scenario in
// e2e/tests/ux-v2-sober-header.spec.ts.
import { Given, Then } from '@cucumber/cucumber';
import type { DataTable } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { countPaletteClasses } from '../../../lib/design/paletteAudit';
import { DICTIONARIES, SUPPORTED_LOCALES } from '../../../lib/i18n';

const ROOT = path.resolve(__dirname, '../../..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const MENU = 'components/common/navigation/UserProfile.tsx';
const BELL = 'components/common/navigation/NotificationBell.tsx';

Then('these header files use no palette classes:', function (table: DataTable) {
  for (const { file } of table.hashes()) assert.equal(countPaletteClasses(read(file)), 0, `${file} has palette classes`);
});

Then('the unused coloured header pieces are gone', function () {
  for (const file of ['components/common/navigation/ThemeToggle.tsx', 'components/ui/popover.tsx']) {
    assert.equal(fs.existsSync(path.join(ROOT, file)), false, `${file} is unused and removed`);
  }
});

Given('the user menu source', function () {});
Given('the notification bell source', function () {});

Then('no menu item has its own colour', function () {
  const src = read(MENU);
  assert.equal(countPaletteClasses(src), 0);
  // No gradient avatar and no per-item hover hue.
  assert.doesNotMatch(src, /bg-gradient|group-hover:/);
});

Then('every menu item, Admin Portal included, uses the shared menu item style', function () {
  const src = read(MENU);
  // Admin Portal, Settings, Favourites, Drafts, Playlists, Shared with me, Recently viewed and Sign out.
  assert.ok((src.match(/\bMENU_ITEM\b/g) ?? []).length >= 9, 'MENU_ITEM defined once and used by all 8 items');
  assert.doesNotMatch(src, /purple|text-blue/);
});

Then("the role is shown in the user's language", function () {
  assert.match(read(MENU), /admin\.role\./, 'the role label comes from admin.role.*');
  for (const locale of SUPPORTED_LOCALES) {
    const d = DICTIONARIES[locale] as Record<string, string>;
    for (const role of ['admin', 'gatekeeper', 'expert', 'musician', 'member']) {
      assert.ok(d[`admin.role.${role}`], `${locale}: admin.role.${role}`);
    }
  }
});

Then('the theme buttons announce the chosen theme as pressed', function () {
  const src = read(MENU);
  assert.match(src, /aria-pressed=\{active\}/);
  assert.match(src, /bg-chip-active text-on-chip-active/);
});

Then('the bell names the unread count', function () {
  assert.match(read(BELL), /notifications\.bell\.labelUnread/);
});

Then('every unread item says "unread" to screen readers', function () {
  assert.match(read(BELL), /<span className="sr-only">\{t\('notifications\.unread'\)\}<\/span>/);
  for (const locale of SUPPORTED_LOCALES) {
    assert.ok((DICTIONARIES[locale] as Record<string, string>)['notifications.unread'], `${locale}: notifications.unread`);
  }
});

Then('the badge uses the inverted greys, not a colour', function () {
  const src = read(BELL);
  assert.equal(countPaletteClasses(src), 0);
  assert.match(src, /data-testid="notification-badge"[^>]*bg-chip-active text-on-chip-active/);
});
