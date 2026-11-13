// Story 6.1.35 (#485), group 5 — docs/testing/ux-v2-sober-account.feature (@unit scenarios). The rendered tabs and
// forms are covered in testing/unit/tests/design/soberAccount.test.tsx; the @e2e scenario in
// e2e/tests/ux-v2-sober-account.spec.ts.
import { Given, Then } from '@cucumber/cucumber';
import type { DataTable } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { countPaletteClasses } from '../../../lib/design/paletteAudit';
import { DICTIONARIES, SUPPORTED_LOCALES } from '../../../lib/i18n';

const ROOT = path.resolve(__dirname, '../../..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const ACCOUNT = 'components/account/settings/AccountSettings.tsx';
const PROFILE = 'components/account/settings/ProfileSettings.tsx';
const SECURITY = 'components/account/settings/SecuritySettings.tsx';
const PREFS = 'components/account/settings/PreferencesSettings.tsx';

Then('these account settings files use no palette classes:', function (table: DataTable) {
  for (const { file } of table.hashes()) {
    assert.equal(countPaletteClasses(read(file)), 0, `${file} has palette classes`);
  }
});

Given('the account settings source', function () {});

Then('Profile settings uses Button with Save as the single primary action', function () {
  const src = read(PROFILE);
  assert.equal(countPaletteClasses(src), 0);
  assert.match(src, /from ["']@\/components\/ui\/button["']/);
  assert.doesNotMatch(src, /shadow-orange|brightness-110/);
});

Then(
  'Security settings uses Button with Update Password as the single primary action, Change Email as outline and Sign Out All in danger text',
  function () {
    const src = read(SECURITY);
    assert.equal(countPaletteClasses(src), 0);
    assert.match(src, /from ["']@\/components\/ui\/button["']/);
    assert.match(src, /variant="outline"/);
    assert.match(src, /text-danger/);
    assert.doesNotMatch(src, /shadow-orange|brightness-110/);
  },
);

Then(
  'Security settings translates the email heading, button, hint and password visibility labels in all languages',
  function () {
    const src = read(SECURITY);
    assert.doesNotMatch(src, />\s*Email Address\s*</);
    assert.doesNotMatch(src, />\s*Change Email\s*</);
    assert.doesNotMatch(src, /Changing your email will require/);
    assert.doesNotMatch(src, /"Hide password"|"Show password"/);
    const keys = [
      'settings.security.changeEmail',
      'settings.security.emailReverifyHint',
      'settings.security.showPassword',
      'settings.security.hidePassword',
    ];
    for (const locale of SUPPORTED_LOCALES) {
      const d = DICTIONARIES[locale] as Record<string, string>;
      for (const k of keys) assert.ok(d[k], `${locale}: ${k}`);
    }
  },
);

Then('the settings tab buttons are 44 px pills with inverted greys when active', function () {
  const src = read(ACCOUNT);
  assert.equal(countPaletteClasses(src), 0);
  assert.match(src, /min-h-tap/);
  assert.match(src, /rounded-pill/);
  assert.match(src, /bg-chip-active text-on-chip-active/);
});

Then('the Preferences theme buttons are 44 px targets that announce the chosen theme as pressed', function () {
  const src = read(PREFS);
  assert.equal(countPaletteClasses(src), 0);
  assert.match(src, /aria-pressed=/);
  assert.match(src, /min-h-tap/);
  assert.match(src, /bg-chip-active text-on-chip-active/);
});
