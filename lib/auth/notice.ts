import type { TranslationKey } from '@/messages/en';
import { errorKeyForCode, isKnownErrorCode } from '@/lib/errors/errorCode';

/**
 * What the auth pages show for a value that came with the address (`?message=`, `?code=`) or from a provider error.
 * Only codes this app knows map to a translated sentence; every other value gives the default text. The text of an
 * address or of a provider answer is never printed.
 */
const NOTICE_KEYS: Readonly<Record<string, TranslationKey>> = {
  login_required: 'auth.notice.loginRequired',
};

/** The `message` parameter sent by the redirect to sign-in. */
export const LOGIN_REQUIRED_NOTICE = 'login_required';

/** Null without a parameter; the sentence of a known code; the default text for anything else. */
export function authNoticeKey(value: string | null | undefined): TranslationKey | null {
  if (!value) return null;
  return Object.hasOwn(NOTICE_KEYS, value) ? NOTICE_KEYS[value] : 'auth.error.default';
}

export { errorKeyForCode };

/** The code of a provider error when it is one this app knows, else null (for the redirect to the error page). */
export function knownAuthCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  const code = (error as { code?: unknown }).code;
  return isKnownErrorCode(code) ? code : null;
}

/** The address of the error page, with a known code when there is one. */
export function authErrorPath(code: string | null): string {
  return code ? `/auth/error?code=${encodeURIComponent(code)}` : '/auth/error';
}

const EMAIL = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;

/** An email address taken from the address bar, or an empty string. */
export function safeEmailParam(value: string | null | undefined): string {
  const v = (value ?? '').trim();
  return v.length <= 254 && EMAIL.test(v) ? v : '';
}
