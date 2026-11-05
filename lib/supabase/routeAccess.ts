/**
 * Route-level access decision for the proxy (Story 6.1.22, G5.1).
 *
 * Only these path prefixes bounce a guest to the login page. Every other path falls
 * through, so a real page guards itself (songs, library, recordings ...) and an unknown
 * URL reaches `app/not-found.tsx` instead of a misleading login redirect.
 *
 * This is a routing rule, not an access-control rule: row-level security and the
 * per-page checks stay the source of truth. Do not add a prefix here to "open" a page.
 * Reusable by the guest gate (G6.1) when it decides what to lock.
 */
export const PROTECTED_PATH_PREFIXES = ['/account', '/admin', '/users'] as const;

/** True when `pathname` is a protected prefix itself or below it (`/admin-x` is not). */
export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** A guest is sent to login only on a protected path; signed-in users never are. */
export function shouldRedirectToLogin(pathname: string, isAuthenticated: boolean): boolean {
  return !isAuthenticated && isProtectedPath(pathname);
}
