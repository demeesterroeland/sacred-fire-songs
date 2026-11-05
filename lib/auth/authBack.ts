import { safeNextPath } from '@/lib/auth/safeNext';

/**
 * Where the "Back" link on the auth pages leads (Story 6.1.25 / G5.4, #409).
 * The hardened `next=` target is the page the guest came from; without one, or when it would
 * only lead into another auth page (a loop), Back goes Home.
 */
export function authBackHref(next: string | null | undefined): string {
  const target = safeNextPath(next);
  return isAuthPath(target) ? '/' : target;
}

/** True for `/auth`, `/auth/…`, also when the path is percent-encoded (e.g. `/%61uth/login`). */
function isAuthPath(target: string): boolean {
  let path = target;
  for (let i = 0; i < 3; i++) {
    try {
      const decoded = decodeURIComponent(path);
      if (decoded === path) break;
      path = decoded;
    } catch {
      break;
    }
  }
  path = path.toLowerCase();
  return path === '/auth' || /^\/auth[/?#]/.test(path);
}

/** `/auth/<page>` URL that keeps the way back (`next`) and an optional prefilled email. */
export function authPageHref(page: 'login' | 'sign-up' | 'forgot-password', opts: { next?: string | null; email?: string } = {}): string {
  const params = new URLSearchParams();
  if (opts.email) params.set('email', opts.email);
  const next = opts.next ? safeNextPath(opts.next) : null;
  if (next && next !== '/') params.set('next', next);
  const qs = params.toString();
  return `/auth/${page}${qs ? `?${qs}` : ''}`;
}
