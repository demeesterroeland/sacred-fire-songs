// Runasimi (qu): every interface string added in validation round 2 is translated (best effort, not yet checked by a
// speaker), except the body text of the Terms and Privacy pages, which stays English until the owner approves the wording.
import { describe, expect, it } from 'vitest';
import { DICTIONARIES } from '@/lib/i18n';
import { LEGAL_KEYS } from '@/lib/legal/sections';

const en = DICTIONARIES.en as Record<string, string>;
const qu = DICTIONARIES.qu as Record<string, string>;

const TRANSLATED = [
  'viewer.awake.description', 'song.menu.actions', 'auth.notice.loginRequired',
  'errors.auth.invalidCredentials', 'errors.auth.emailNotConfirmed', 'errors.auth.userExists', 'errors.auth.weakPassword',
  'errors.auth.samePassword', 'errors.auth.rateLimited', 'errors.auth.linkExpired', 'errors.auth.linkInvalid',
  'errors.auth.signUpAgain', 'errors.network', 'errors.alreadyExists',
  'legal.draft', 'legal.account.title', 'legal.operator.title', 'legal.operator.nameLine', 'legal.operator.contactLine',
  'legal.operator.none', 'legal.operator.noEmail',
];
const LEGAL_BODY = LEGAL_KEYS.filter((k) => /^legal\.(terms|privacy)\./.test(k));

describe('qu coverage', () => {
  it.each(TRANSLATED)('%s is not the English text', (key) => {
    expect(qu[key], key).toBeTruthy();
    expect(qu[key], key).not.toBe(en[key]);
  });
  it('keeps the placeholder of the operator line', () => {
    expect(qu['legal.operator.nameLine']).toContain('{name}');
  });
  it('the Terms and Privacy body stays English (owner has not approved the wording)', () => {
    expect(LEGAL_BODY.length).toBeGreaterThan(40);
    for (const key of LEGAL_BODY) expect(qu[key], key).toBe(en[key]);
  });
});
