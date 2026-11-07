// UX v2 validation round 2 — docs/testing/ux-v2-validation-2.feature (@unit scenarios)
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { formatCount } from '../../../lib/format/count';
import { versionSearch } from '../../../lib/songs/versionSwitch';
import { readOperator } from '../../../lib/legal/operator';
import { errorKey } from '../../../lib/errors/errorCode';
import { DICTIONARIES, SUPPORTED_LOCALES } from '../../../lib/i18n';
import { parseChordProForDisplay } from '../../../lib/chordUtils';

interface State {
  count?: number;
  search: string;
  env: Record<string, string>;
  operator?: ReturnType<typeof readOperator>;
  authError?: { code: string; message: string };
  chorusLine: string;
}
const state = new WeakMap<object, State>();
const get = (w: object): State => {
  let s = state.get(w);
  if (!s) {
    s = { search: '', env: {}, chorusLine: '' };
    state.set(w, s);
  }
  return s;
};
const dict = (l: string) => DICTIONARIES[l as keyof typeof DICTIONARIES] as Record<string, string>;

// 4
Given('a category {string} that holds {int} songs', function (this: object, _name: string, n: number) {
  get(this).count = n;
});
Then('its amount reads {string}', function (this: object, text: string) {
  assert.equal(formatCount(get(this).count ?? 0), text);
});

// 5
Given('a song page without parameters', function (this: object) {
  get(this).search = '';
});
When('I switch the page to the second version', function (this: object) {
  const s = get(this);
  s.search = versionSearch(s.search, 'v2', false);
});
Then('the address ends in {string}', function (this: object, tail: string) {
  assert.equal(get(this).search, tail);
});
When('I switch the page to the first version', function (this: object) {
  const s = get(this);
  s.search = versionSearch(s.search, 'v1', true);
});
Then('the address has no parameters', function (this: object) {
  assert.equal(get(this).search, '');
});

// 8 and 14
Given('every interface language', function () {
  assert.equal(SUPPORTED_LOCALES.length, 8);
});
Then('no string says {string} or the old word for it', function (word: string) {
  assert.ok(word); // the quoted word is the English one; every language's own old word is listed below
  const old: Record<string, RegExp> = {
    en: /\btakes?\b/i, nl: /\b(takes?|oefentakes?)\b/i, es: /\btomas?\b/i, it: /\btakes?\b/i,
    ru: /дубл(ь|я|ю|ем|е|и|ей|ям|ями|ях)\b/i, qu: /\btoma(kuna|ykikuna|ta|pa|qa|ykita)?\b/i, fr: /\bprises?\b(?! en charge)/i, pt: /\btakes?\b/i,
  };
  for (const l of SUPPORTED_LOCALES) {
    const bad = Object.entries(dict(l)).filter(([k, v]) => k !== 'settings.privacy.dataExport' && old[l].test(v));
    assert.deepEqual(bad, [], l);
  }
});
Then('the recorder toggle has the same label as the Practice tab', function () {
  assert.equal(dict('en')['recorder.tab.record'], dict('en')['practice.tab.record']);
});
Then('the heart on the song page uses the word of the user menu\'s {string}', function (menu: string) {
  assert.ok(menu);
  const stem: Record<string, RegExp> = { en: /favou?rite/i, nl: /favoriet/i, es: /favorit/i, it: /preferit/i, ru: /избранн/i, qu: /munasqa/i, fr: /favori/i, pt: /favorit/i };
  for (const l of SUPPORTED_LOCALES) {
    assert.match(dict(l)['song.addToFavorites'], stem[l], l);
    assert.match(dict(l)['userMenu.favorites'], stem[l], l);
  }
});

// 12
Given('the operator variables are not set', function (this: object) {
  get(this).env = {};
});
Then('the operator is empty and the page says no contact details are configured', function (this: object) {
  assert.deepEqual(readOperator(get(this).env), { name: null, email: null });
  assert.ok(dict('en')['legal.operator.none'].includes('has not configured contact details'));
});
Given('OPERATOR_NAME is {string} and OPERATOR_CONTACT_EMAIL is {string}', function (this: object, name: string, email: string) {
  get(this).env = { OPERATOR_NAME: name, OPERATOR_CONTACT_EMAIL: email };
});
Then('the operator has that name and that email', function (this: object) {
  assert.deepEqual(readOperator(get(this).env), { name: 'Example Songs Circle', email: 'privacy@example.org' });
});

// 16
Given('a line that holds only {string}', function (this: object, line: string) {
  get(this).chorusLine = line;
});
Then('the reader shows it as plain text, with chords on or off', function (this: object) {
  const items = parseChordProForDisplay(get(this).chorusLine).flatMap((s) => s.lines.flatMap((l) => l.items));
  assert.deepEqual(items.map((i) => i.comment), ['Chorus']);
  assert.ok(items.every((i) => !i.chords));
});

// 22
Given('the authentication service answers {string}', function (this: object, code: string) {
  get(this).authError = { code, message: 'Invalid login credentials' };
});
Then('the person reads the translated sentence for wrong credentials', function (this: object) {
  assert.equal(errorKey(get(this).authError), 'errors.auth.invalidCredentials');
  for (const l of SUPPORTED_LOCALES) assert.ok(dict(l)['errors.auth.invalidCredentials'], l);
});
Then('the raw service message is never shown', function (this: object) {
  for (const l of SUPPORTED_LOCALES) assert.notEqual(dict(l)['errors.auth.invalidCredentials'], get(this).authError?.message);
});
