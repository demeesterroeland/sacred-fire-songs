// Validation 2, item 22 (second part): errors from the authentication service and the database are shown by their
// code, in the person's language. The raw service text (English, sometimes technical) is never shown.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { DICTIONARIES, SUPPORTED_LOCALES } from '@/lib/i18n';
import { errorKey, errorMessage } from '@/lib/errors/errorCode';

describe('errorKey', () => {
  it.each([
    [{ code: 'invalid_credentials', message: 'Invalid login credentials' }, 'errors.auth.invalidCredentials'],
    [{ message: 'Invalid login credentials' }, 'errors.auth.invalidCredentials'], // older answers have no code
    [{ code: 'email_not_confirmed' }, 'errors.auth.emailNotConfirmed'],
    [{ code: 'user_already_exists' }, 'errors.auth.userExists'],
    [{ message: 'User already registered' }, 'errors.auth.userExists'],
    [{ code: 'weak_password' }, 'errors.auth.weakPassword'],
    [{ code: 'same_password' }, 'errors.auth.samePassword'],
    [{ code: 'over_request_rate_limit' }, 'errors.auth.rateLimited'],
    [{ code: 'over_email_send_rate_limit' }, 'errors.auth.rateLimited'],
    [{ status: 429 }, 'errors.auth.rateLimited'],
    [{ code: 'otp_expired' }, 'errors.auth.linkExpired'],
    [{ code: 'bad_jwt' }, 'errors.notSignedIn'],
    [{ code: 'PGRST301' }, 'errors.notSignedIn'],
    [{ code: '42501', message: 'new row violates row-level security policy for table "compositions"' }, 'errors.accessDenied'],
    [{ code: '23505', message: 'duplicate key value violates unique constraint' }, 'errors.alreadyExists'],
    [{ name: 'AuthRetryableFetchError', message: 'Failed to fetch' }, 'errors.network'],
    [new TypeError('Failed to fetch'), 'errors.network'],
  ])('%j → %s', (error, key) => {
    expect(errorKey(error)).toBe(key);
  });

  it('uses the call site\'s fallback for anything else, never the raw message', () => {
    expect(errorKey({ message: 'duplicate key value violates something odd', code: 'XX000' }, 'auth.error.default')).toBe('auth.error.default');
    expect(errorKey(new Error('boom'))).toBe('errors.generic');
    expect(errorKey(null)).toBe('errors.generic');
    expect(errorKey('a string')).toBe('errors.generic');
  });
});

describe('errorMessage', () => {
  it('translates through t and shows no raw text', () => {
    const t = (k: string) => `T:${k}`;
    expect(errorMessage({ code: 'invalid_credentials', message: 'Invalid login credentials' }, t)).toBe('T:errors.auth.invalidCredentials');
  });
});

describe('every locale defines the new keys', () => {
  const KEYS = ['errors.auth.invalidCredentials', 'errors.auth.emailNotConfirmed', 'errors.auth.userExists', 'errors.auth.weakPassword',
    'errors.auth.samePassword', 'errors.auth.rateLimited', 'errors.auth.linkExpired', 'errors.auth.signUpAgain', 'errors.network', 'errors.alreadyExists'];
  it.each([...SUPPORTED_LOCALES])('%s', (locale) => {
    const d = DICTIONARIES[locale as keyof typeof DICTIONARIES] as Record<string, string>;
    for (const k of KEYS) expect(d[k], k).toBeTruthy();
  });
});

describe('call sites show a translated message, not error.message', () => {
  const files = [
    'components/login-form.tsx', 'components/sign-up-form.tsx', 'components/forgot-password-form.tsx',
    'components/update-password-form.tsx', 'components/finish-registration-form.tsx', 'components/song/SongForm.tsx',
    'app/auth/update-password/page.tsx', 'app/auth/forgot-password/page.tsx', 'app/auth/sign-up-success/page.tsx',
  ];
  it.each(files)('%s', (file) => {
    const src = readFileSync(file, 'utf8');
    expect(src).not.toMatch(/set(Error|ServerError)\(\s*error(\s+instanceof\s+Error\s*\?\s*error)?\.message/);
    expect(src).toContain('errorMessage(');
  });
});
