import type { TranslationKey } from '@/messages/en';

/**
 * Validation 2, item 22: what a person sees when the authentication service or the database says no.
 * Both answer with an error code (`invalid_credentials`, `42501`) next to an English message. The code picks a
 * translated sentence; a code we do not know gives the call site's fallback. The raw message is never shown.
 */
const CODES: Readonly<Record<string, TranslationKey>> = {
  // Authentication service (Supabase Auth)
  invalid_credentials: 'errors.auth.invalidCredentials',
  email_not_confirmed: 'errors.auth.emailNotConfirmed',
  user_already_exists: 'errors.auth.userExists',
  email_exists: 'errors.auth.userExists',
  weak_password: 'errors.auth.weakPassword',
  same_password: 'errors.auth.samePassword',
  over_request_rate_limit: 'errors.auth.rateLimited',
  over_email_send_rate_limit: 'errors.auth.rateLimited',
  over_sms_send_rate_limit: 'errors.auth.rateLimited',
  otp_expired: 'errors.auth.linkExpired',
  flow_state_expired: 'errors.auth.linkExpired',
  bad_jwt: 'errors.notSignedIn',
  session_not_found: 'errors.notSignedIn',
  not_authenticated: 'errors.notSignedIn',
  // Links that came back without what they need (the confirm route reports this code)
  missing_params: 'errors.auth.linkInvalid',
  // Database (PostgREST / Postgres)
  PGRST301: 'errors.notSignedIn',
  PGRST303: 'errors.notSignedIn',
  '42501': 'errors.accessDenied',
  '23505': 'errors.alreadyExists',
};

/** Older answers carry no code, only these texts. */
const MESSAGES: ReadonlyArray<[RegExp, TranslationKey]> = [
  [/invalid login credentials/i, 'errors.auth.invalidCredentials'],
  [/user already registered/i, 'errors.auth.userExists'],
  [/email not confirmed/i, 'errors.auth.emailNotConfirmed'],
  [/failed to fetch|network ?error|load failed/i, 'errors.network'],
];

type Translate = (key: TranslationKey) => string;

interface ErrorLike {
  code?: unknown;
  status?: unknown;
  name?: unknown;
  message?: unknown;
}

export function errorKey(error: unknown, fallbackKey: TranslationKey = 'errors.generic'): TranslationKey {
  if (!error || typeof error !== 'object') return fallbackKey;
  const e = error as ErrorLike;
  if (typeof e.code === 'string' && Object.hasOwn(CODES, e.code)) return CODES[e.code];
  if (e.status === 429) return 'errors.auth.rateLimited';
  if (e.name === 'AuthRetryableFetchError') return 'errors.network';
  if (typeof e.message === 'string') {
    for (const [pattern, key] of MESSAGES) if (pattern.test(e.message)) return key;
  }
  return fallbackKey;
}

/** The translated message for an error from the authentication service or the database. */
export function errorMessage(error: unknown, t: Translate, fallbackKey: TranslationKey = 'errors.generic'): string {
  return t(errorKey(error, fallbackKey));
}

/** True for a code this app has a translated sentence for. Inherited names ("constructor") are not codes. */
export function isKnownErrorCode(code: unknown): code is string {
  return typeof code === 'string' && Object.hasOwn(CODES, code);
}

/** The key for a code that came from an address: known codes only, anything else gives `auth.error.default`. */
export function errorKeyForCode(code: unknown): TranslationKey {
  return isKnownErrorCode(code) ? CODES[code] : 'auth.error.default';
}
