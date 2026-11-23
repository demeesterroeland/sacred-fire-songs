// Story 6.1.25 / G5.4 (#409): the auth pages' "Back" returns to the hardened `next=` target, else Home (L2).
import { describe, expect, it } from 'vitest';
import { authBackHref, authPageHref } from '@/lib/auth/authBack';

describe('authBackHref', () => {
  it('returns the page the guest came from', () => {
    expect(authBackHref('/songs/abc-123')).toBe('/songs/abc-123');
    expect(authBackHref('/songs/abc?tab=lyrics#x')).toBe('/songs/abc?tab=lyrics#x');
    expect(authBackHref('/songs/add')).toBe('/songs/add');
  });

  it('falls back to Home without a next target', () => {
    expect(authBackHref(null)).toBe('/');
    expect(authBackHref(undefined)).toBe('/');
    expect(authBackHref('')).toBe('/');
  });

  it('never follows a hostile next target', () => {
    expect(authBackHref('//evil.example')).toBe('/');
    expect(authBackHref('https://evil.example')).toBe('/');
    expect(authBackHref('/\\evil.example')).toBe('/');
    expect(authBackHref('javascript:alert(1)')).toBe('/');
  });

  it('never loops back into the auth pages', () => {
    expect(authBackHref('/auth/login')).toBe('/');
    expect(authBackHref('/auth/sign-up?next=%2Fsongs%2Fx')).toBe('/');
    expect(authBackHref('/auth')).toBe('/');
    expect(authBackHref('/authors')).toBe('/authors');
  });

  it('treats an encoded auth path as an auth page too', () => {
    expect(authBackHref('/%61uth/login')).toBe('/');
    expect(authBackHref('/%2561uth/login')).toBe('/');
  });
});

describe('authPageHref', () => {
  it('carries a safe next target and an email', () => {
    expect(authPageHref('sign-up', { next: '/songs/x' })).toBe('/auth/sign-up?next=%2Fsongs%2Fx');
    expect(authPageHref('forgot-password', { next: '/songs/x', email: 'a@b.c' })).toBe(
      '/auth/forgot-password?email=a%40b.c&next=%2Fsongs%2Fx',
    );
  });

  it('drops a hostile or empty next target instead of carrying it along', () => {
    expect(authPageHref('login', { next: '//evil.example' })).toBe('/auth/login');
    expect(authPageHref('login', { next: 'https://evil.example' })).toBe('/auth/login');
    expect(authPageHref('login', { next: '/' })).toBe('/auth/login');
    expect(authPageHref('login', { next: null })).toBe('/auth/login');
  });
});
