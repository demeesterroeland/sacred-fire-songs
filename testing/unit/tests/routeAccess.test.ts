import { describe, it, expect } from 'vitest';
import {
  PROTECTED_PATH_PREFIXES,
  isProtectedPath,
  shouldRedirectToLogin,
} from '@/lib/supabase/routeAccess';

describe('route access decision (story 6.1.22, unknown URLs are real 404s)', () => {
  it('exports the protected prefixes as the single source of truth', () => {
    expect([...PROTECTED_PATH_PREFIXES].sort()).toEqual(['/admin']);
  });

  it.each([
    '/admin',
    '/admin/users',
    '/admin/users/abc-123',
  ])('treats %s as protected', (path) => {
    expect(isProtectedPath(path)).toBe(true);
  });

  it.each([
    '/this-page-does-not-exist',
    '/admin-panel',
    '/accounting',
    '/users-list',
    '/a/b/c',
    '/robots.txt',
    '/accountx/settings',
  ])('does not treat unknown path %s as protected', (path) => {
    expect(isProtectedPath(path)).toBe(false);
  });

  it.each([
    '/',
    '/auth/login',
    '/auth/sign-up',
    '/songs',
    '/songs/abc',
    '/songs/abc/edit',
    '/songs/add',
    '/explore',
    '/library',
    '/library/playlists/add',
    '/library/recently-viewed',
    '/playlists/x',
    '/recordings/abc',
    '/notes',
    '/account',
    '/account/settings',
    '/users/abc-123',
    '/supabase-api/rest/v1/songs',
  ])('keeps existing public/self-guarded route %s unprotected (pages guard themselves)', (path) => {
    expect(isProtectedPath(path)).toBe(false);
  });

  it('redirects a guest to login on a protected path only', () => {
    expect(shouldRedirectToLogin('/admin/users', false)).toBe(true);
    // Story 6.1.26: /account and /users render the GuestGate for guests instead.
    expect(shouldRedirectToLogin('/account/settings', false)).toBe(false);
    expect(shouldRedirectToLogin('/users/abc', false)).toBe(false);
    expect(shouldRedirectToLogin('/this-page-does-not-exist', false)).toBe(false);
    expect(shouldRedirectToLogin('/songs/abc', false)).toBe(false);
  });

  it('never redirects a signed-in member or admin', () => {
    expect(shouldRedirectToLogin('/admin/users', true)).toBe(false);
    expect(shouldRedirectToLogin('/this-page-does-not-exist', true)).toBe(false);
  });
});
