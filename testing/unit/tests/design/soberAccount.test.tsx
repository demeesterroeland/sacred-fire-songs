// @vitest-environment jsdom
// Story 6.1.35 (#485), group 5 — docs/testing/ux-v2-sober-account.feature. Account settings tabs and forms
// use semantic tokens only: no palette classes, at most one primary button per tab, 44 px targets, translated security labels.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DICTIONARIES } from '@/lib/i18n';
import { countPaletteClasses } from '@/lib/design/paletteAudit';
import type { User } from '@supabase/supabase-js';

const dict = DICTIONARIES.en as Record<string, string>;
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'en',
    t: (k: string, p?: Record<string, string | number>) =>
      (dict[k] ?? k).replace(/\{(\w+)\}/g, (_, n) => String(p?.[n] ?? '')),
    setLocaleAndPersist: vi.fn(),
    supportedLocales: ['en'],
    localeLabels: { en: 'English' },
  }),
}));
vi.mock('next/navigation', () => ({
  usePathname: () => '/account/settings',
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock('next/image', () => ({ default: () => null }));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'u1', email: 'member@sfs.example', full_name: 'Ana Example', role: 'member', avatar_url: null },
    loading: false,
    logout: vi.fn(),
  }),
}));
const setPreference = vi.fn();
vi.mock('@/context/UserPreferencesContext', () => ({
  useUserPreferences: () => ({
    preferences: { theme: 'dark', keepScreenAwake: false, autoHideBottomNav: false },
    setPreference,
  }),
}));
vi.mock('@/hooks/useWakeLock', () => ({
  useWakeLock: () => ({ isSupported: true, isLocked: false, requestWakeLock: vi.fn(), releaseWakeLock: vi.fn() }),
}));
vi.mock('@/lib/notifications/queries', () => ({
  getEmailNotificationsEnabled: () => Promise.resolve(true),
  setEmailNotificationsEnabled: () => Promise.resolve(),
}));
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({ update: () => ({ eq: () => Promise.resolve({ error: null }) }) }),
    auth: {
      updateUser: () => Promise.resolve({ error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
  }),
}));

import AccountSettings from '@/components/account/settings/AccountSettings';
import PrivacySettings from '@/components/account/settings/PrivacySettings';

afterEach(cleanup);

const mockUser = { id: 'u1', email: 'member@sfs.example' } as User;
const mockProfile = { id: 'u1', full_name: 'Ana Example', avatar_url: null };

describe('sober account settings', () => {
  it('renders Profile tab with semantic tokens and Save as the single primary button', () => {
    const { container } = render(<AccountSettings user={mockUser} profile={mockProfile} initialTab="profile" />);
    expect(countPaletteClasses(container.innerHTML)).toBe(0);
    const save = screen.getByRole('button', { name: dict['settings.profile.save'] });
    expect(save.className).toMatch(/\bbg-accent\b/);
    expect(save.className).toMatch(/\bmin-h-tap\b/);
  });

  it('marks the active tab with inverted greys and 44 px pill target', () => {
    render(<AccountSettings user={mockUser} profile={mockProfile} initialTab="profile" />);
    const profileTab = screen.getByRole('button', { name: dict['settings.tab.profile'] });
    const securityTab = screen.getByRole('button', { name: dict['settings.tab.security'] });
    expect(profileTab.className).toMatch(/\bbg-chip-active\b.*\btext-on-chip-active\b/);
    expect(profileTab.className).toMatch(/\bmin-h-tap\b/);
    expect(securityTab.className).toMatch(/\bbg-chip\b.*\btext-on-chip\b/);
  });

  it('renders Security tab with translated labels, outline Change Email, primary Update Password and danger Sign Out All', () => {
    const { container } = render(<AccountSettings user={mockUser} profile={mockProfile} initialTab="account" />);
    expect(countPaletteClasses(container.innerHTML)).toBe(0);
    expect(screen.getByRole('heading', { name: dict['field.email.label'] })).toBeTruthy();
    const changeEmail = screen.getByRole('button', { name: dict['settings.security.changeEmail'] });
    const updatePassword = screen.getByRole('button', { name: dict['settings.security.updatePassword'] });
    const signOutAll = screen.getByRole('button', { name: dict['settings.security.signOutAll'] });
    expect(changeEmail.className).not.toMatch(/\bbg-accent\b/);
    expect(changeEmail.className).toMatch(/\bborder-line-strong\b/);
    expect(updatePassword.className).toMatch(/\bbg-accent\b/);
    expect(signOutAll.className).toMatch(/\btext-danger\b/);
    expect(screen.getByText(dict['settings.security.emailReverifyHint'])).toBeTruthy();

    // Password visibility buttons are 44 px targets and toggle translated labels.
    const showBtns = screen.getAllByRole('button', { name: dict['settings.security.showPassword'] });
    expect(showBtns).toHaveLength(2);
    expect(showBtns[0].className).toMatch(/\bsize-tap\b/);
    fireEvent.click(showBtns[0]);
    expect(screen.getByRole('button', { name: dict['settings.security.hidePassword'] })).toBeTruthy();
  });

  it('renders Preferences tab with semantic tokens and pressed 44 px theme buttons', () => {
    const { container } = render(<AccountSettings user={mockUser} profile={mockProfile} initialTab="preferences" />);
    expect(countPaletteClasses(container.innerHTML)).toBe(0);
    const dark = screen.getByRole('button', { name: dict['theme.dark'] });
    const light = screen.getByRole('button', { name: dict['theme.light'] });
    expect(dark.getAttribute('aria-pressed')).toBe('true');
    expect(light.getAttribute('aria-pressed')).toBe('false');
    expect(dark.className).toMatch(/\bbg-chip-active\b/);
    expect(dark.className).toMatch(/\bmin-h-tap\b/);
    expect(light.className).not.toMatch(/\bbg-chip-active\b/);
  });

  it('renders PrivacySettings with semantic tokens only', () => {
    const { container } = render(<PrivacySettings user={mockUser} profile={mockProfile} />);
    expect(countPaletteClasses(container.innerHTML)).toBe(0);
  });
});
