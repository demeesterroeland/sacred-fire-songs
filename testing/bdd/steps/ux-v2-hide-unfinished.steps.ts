// Story 6.1.5 / G1.5 (#389) — docs/testing/ux-v2-hide-unfinished.feature
import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { FEATURES } from '../../../lib/features';
import { parseSettingsTab, visibleSettingsTabs } from '../../../lib/account/settingsTabs';
import { libraryTabs } from '../../../lib/navigation';
import en from '../../../messages/en';
import nl from '../../../messages/nl';
import es from '../../../messages/es';
import it from '../../../messages/it';
import ru from '../../../messages/ru';
import qu from '../../../messages/qu';
import fr from '../../../messages/fr';
import pt from '../../../messages/pt';

Given('the unfinished features are switched off', function () {
  assert.equal(Object.values(FEATURES).some(Boolean), false);
});

Then('the Settings tabs are Profile, Security and Preferences', function () {
  assert.deepEqual(visibleSettingsTabs(), ['profile', 'account', 'preferences']);
});

Then('the Settings tab for {string} is Profile', function (tab: string) {
  assert.equal(parseSettingsTab(tab), 'profile');
});

Then('the Library tabs do not include Albums', function () {
  assert.equal(libraryTabs().some((t) => t.href === '/library/albums'), false);
});

Then('the avatar, planned preferences and melody notation sections are off', function () {
  assert.equal(FEATURES.avatarUpload, false);
  assert.equal(FEATURES.plannedPreferences, false);
  assert.equal(FEATURES.melodyNotation, false);
});

Given('the message catalogues of all 8 locales', function () {
  assert.equal([en, nl, es, it, ru, qu, fr, pt].length, 8);
});

Then('no message key is a "Coming soon" label', function () {
  for (const catalogue of [en, nl, es, it, ru, qu, fr, pt]) {
    const keys = Object.keys(catalogue).filter((k) => /comingsoon|notactive/i.test(k));
    assert.deepEqual(keys, []);
  }
});
