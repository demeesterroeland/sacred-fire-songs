// @vitest-environment jsdom
// Story 6.1.38 (#534) — docs/testing/ux-v2-profile-role-badge.feature
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { DICTIONARIES, type Locale } from '@/lib/i18n';
import { roleBadge, toProfileRole } from '@/lib/users/roleBadge';

const locale = { current: 'en' as Locale };
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    locale: locale.current,
    t: (k: string) => (DICTIONARIES[locale.current] as Record<string, string>)[k] ?? k,
  }),
}));

import RoleBadge from '@/components/profile/RoleBadge';

afterEach(() => {
  cleanup();
  locale.current = 'en';
});

describe('toProfileRole', () => {
  it('keeps the five known roles', () => {
    for (const r of ['admin', 'gatekeeper', 'expert', 'musician', 'member']) {
      expect(toProfileRole(r)).toBe(r);
    }
  });

  it('falls back to member for null, empty or unknown values', () => {
    expect(toProfileRole(null)).toBe('member');
    expect(toProfileRole(undefined)).toBe('member');
    expect(toProfileRole('')).toBe('member');
    expect(toProfileRole('owner')).toBe('member');
  });
});

describe('roleBadge', () => {
  it.each([
    ['admin', 'Shield', 'admin.role.admin'],
    ['gatekeeper', 'KeyRound', 'admin.role.gatekeeper'],
    ['expert', 'Award', 'admin.role.expert'],
    ['musician', 'Music', 'admin.role.musician'],
    ['member', 'UserCheck', 'admin.role.member'],
  ])('%s → %s icon and %s label', (role, icon, labelKey) => {
    expect(roleBadge(role)).toEqual({ role, icon, labelKey });
  });
});

describe('<RoleBadge>', () => {
  it.each([
    ['admin', 'Admin', 'Shield'],
    ['gatekeeper', 'Gatekeeper', 'KeyRound'],
    ['expert', 'Expert', 'Award'],
    ['musician', 'Musician', 'Music'],
    ['member', 'Member', 'UserCheck'],
  ])('shows %s as "%s" with the %s icon', (role, label, icon) => {
    render(<RoleBadge role={role} />);
    const badge = screen.getByTestId('profile-role-badge');
    expect(badge.textContent).toContain(label);
    expect(badge.getAttribute('data-role')).toBe(role);
    expect(badge.querySelector(`svg[data-icon="${icon}"]`)).not.toBeNull();
    expect(badge.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('shows the label in the chosen language', () => {
    locale.current = 'nl';
    render(<RoleBadge role="gatekeeper" />);
    expect(screen.getByTestId('profile-role-badge').textContent).toContain('Poortwachter');
  });

  it('shows the member badge when the role is unknown', () => {
    render(<RoleBadge role={null} />);
    const badge = screen.getByTestId('profile-role-badge');
    expect(badge.textContent).toContain('Member');
    expect(badge.getAttribute('data-role')).toBe('member');
  });
});
