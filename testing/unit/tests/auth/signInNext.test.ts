// #600: every sign-in link and redirect keeps next= (path and query); guests get a GuestGate on Favorites.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { RETURN_PATH_HEADER, loginRedirectHref, returnPath, signInHref } from '@/lib/auth/guestGate';
import { songsGuestGateFeature } from '@/lib/songs/guestCollections';

describe('returnPath', () => {
  it('joins path and query', () => {
    expect(returnPath('/songs', 'favorites=true')).toBe('/songs?favorites=true');
    expect(returnPath('/songs', '?favorites=true')).toBe('/songs?favorites=true');
    expect(returnPath('/songs', '')).toBe('/songs');
    expect(returnPath('/songs', new URLSearchParams('status=draft&sort=newest'))).toBe('/songs?status=draft&sort=newest');
    expect(returnPath('/songs', null)).toBe('/songs');
  });
  it('is unsafe-proof through signInHref', () => {
    expect(signInHref(returnPath('//evil.example', 'x=1'))).toBe('/auth/login?next=%2F');
  });
});

describe('loginRedirectHref (proxy)', () => {
  it('keeps the page and its query in next= and the known login_required reason', () => {
    expect(loginRedirectHref('/admin/users', '?tab=roles')).toBe(
      '/auth/login?next=%2Fadmin%2Fusers%3Ftab%3Droles&message=login_required'
    );
  });
});

describe('songsGuestGateFeature', () => {
  it('gates Favorites for a guest once the session is known', () => {
    expect(songsGuestGateFeature({ favorites: true, status: 'all', isGuest: true, authLoading: false })).toBe('favourites');
  });
  it('does not gate while the session loads, for members, or on other views', () => {
    expect(songsGuestGateFeature({ favorites: true, status: 'all', isGuest: true, authLoading: true })).toBeNull();
    expect(songsGuestGateFeature({ favorites: true, status: 'all', isGuest: false, authLoading: false })).toBeNull();
    expect(songsGuestGateFeature({ favorites: false, status: 'all', isGuest: true, authLoading: false })).toBeNull();
  });
  it('gates Drafts for a guest once the session is known (supersedes the empty state of #232)', () => {
    expect(songsGuestGateFeature({ favorites: false, status: 'draft', isGuest: true, authLoading: false })).toBe('drafts');
    expect(songsGuestGateFeature({ favorites: false, status: 'draft', isGuest: true, authLoading: true })).toBeNull();
    expect(songsGuestGateFeature({ favorites: false, status: 'draft', isGuest: false, authLoading: false })).toBeNull();
  });
});

const getUser = vi.fn();
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ auth: { getUser } }),
}));

describe('proxy updateSession', () => {
  beforeEach(() => getUser.mockReset());

  it('redirects a guest on /admin/* to login with next= (path and query)', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const { updateSession } = await import('@/lib/supabase/proxy');
    const res = await updateSession(new NextRequest('http://app.test/admin/users?tab=roles'));
    const location = new URL(res.headers.get('location')!);
    expect(location.pathname).toBe('/auth/login');
    expect(location.searchParams.get('next')).toBe('/admin/users?tab=roles');
    expect(location.searchParams.get('message')).toBe('login_required');
    expect(location.searchParams.get('tab')).toBeNull();
  });

  it('forwards the return path to Server Components in a request header', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const { updateSession } = await import('@/lib/supabase/proxy');
    const req = new NextRequest('http://app.test/admin/catalog-edits?page=2', {
      headers: { [RETURN_PATH_HEADER]: '//spoofed' },
    });
    const res = await updateSession(req);
    expect(res.headers.get(`x-middleware-request-${RETURN_PATH_HEADER}`)).toBe('/admin/catalog-edits?page=2');
  });
});

const redirect = vi.fn((url: string) => {
  throw new Error(`REDIRECT ${url}`);
});
const headerStore = new Headers();
vi.mock('next/navigation', () => ({ redirect: (url: string) => redirect(url) }));
vi.mock('next/headers', () => ({ headers: async () => headerStore }));
vi.mock('@/lib/admin/serverQueries', () => ({ checkAdminAccess: async () => ({ authorized: false, user: null }) }));
vi.mock('@/components/admin/AdminHeader', () => ({ default: () => null }));
vi.mock('@/components/admin/AccessDeniedNotice', () => ({ default: () => null }));

describe('admin layout', () => {
  afterEach(() => {
    redirect.mockClear();
    headerStore.delete(RETURN_PATH_HEADER);
  });

  it('sends a guest to login with the admin page they opened, not a fixed /admin/users', async () => {
    headerStore.set(RETURN_PATH_HEADER, '/admin/catalog-edits?page=2');
    const { default: AdminLayout } = await import('@/app/admin/layout');
    await expect(AdminLayout({ children: null })).rejects.toThrow('REDIRECT');
    expect(redirect).toHaveBeenCalledWith(signInHref('/admin/catalog-edits?page=2'));
  });

  it('falls back to /admin when the header is missing', async () => {
    const { default: AdminLayout } = await import('@/app/admin/layout');
    await expect(AdminLayout({ children: null })).rejects.toThrow('REDIRECT');
    expect(redirect).toHaveBeenCalledWith(signInHref('/admin'));
  });
});
