// @vitest-environment jsdom
// Story 6.1.25 / G5.4 (#409): auth pages have no fake ✕; "Back" leads where the guest came from (RTL, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BackButton } from '@/components/common/BackButton';
import { LoginForm } from '@/components/login-form';
import { SignUpForm } from '@/components/sign-up-form';
import { DICTIONARIES } from '@/lib/i18n';
import { countPaletteClasses } from '@/lib/design/paletteAudit';

const dict = DICTIONARIES.en as Record<string, string>;
let query = '';
const push = vi.fn();

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({ t: (k: string) => dict[k] ?? k }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(query),
}));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: {} }) }));

afterEach(() => {
  cleanup();
  push.mockClear();
  query = '';
});

describe('BackButton', () => {
  it('links to the given href with the word Back and a 44 px target', () => {
    render(<BackButton href="/songs/abc" />);
    const link = screen.getByRole('link', { name: 'Back' });
    expect(link.getAttribute('href')).toBe('/songs/abc');
    expect(link.className).toMatch(/min-h-tap/);
  });

  it('uses design tokens only', () => {
    const { container } = render(<BackButton href="/" />);
    expect(countPaletteClasses(container.innerHTML)).toBe(0);
  });
});

describe.each([
  ['LoginForm', LoginForm],
  ['SignUpForm', SignUpForm],
])('%s', (_name, Form) => {
  it('has no close (✕) button that silently leaves for Home', () => {
    query = 'next=%2Fsongs%2Fabc';
    render(<Form />);
    expect(screen.queryByRole('button', { name: /close|✕|×/i })).toBeNull();
    const iconOnly = screen.queryAllByRole('button').filter((b) => !b.textContent?.trim() && !b.getAttribute('aria-label'));
    expect(iconOnly).toHaveLength(0);
    expect(push).not.toHaveBeenCalled();
  });

  it('uses design tokens only', () => {
    const { container } = render(<Form />);
    expect(countPaletteClasses(container.innerHTML)).toBe(0);
  });
});

describe('LoginForm next= carry-over', () => {
  it('keeps next on the sign-up link and on the forgot-password link', () => {
    query = 'next=%2Fsongs%2Fabc';
    render(<LoginForm />);
    expect(screen.getByRole('link', { name: dict['auth.login.joinTheCircle'] }).getAttribute('href')).toBe(
      '/auth/sign-up?next=%2Fsongs%2Fabc'
    );
    fireEvent.click(screen.getByRole('button', { name: dict['auth.login.switchToPassword'] }));
    expect(screen.getByRole('link', { name: dict['auth.login.forgotShort'] }).getAttribute('href')).toBe(
      '/auth/forgot-password?next=%2Fsongs%2Fabc'
    );
  });
});

describe('Forgot-password and update-password pages', () => {
  it('forgot-password: Back and "Sign in" return to login and keep the way back', async () => {
    const { default: ForgotPassword } = await import('@/app/auth/forgot-password/page');
    query = 'next=%2Fsongs%2Fabc&email=a%40b.c';
    const { container } = render(<ForgotPassword />);
    expect(screen.getByTestId('auth-back').getAttribute('href')).toBe('/auth/login?next=%2Fsongs%2Fabc');
    expect(screen.getByRole('link', { name: dict['auth.signInLink'] }).getAttribute('href')).toBe(
      '/auth/login?next=%2Fsongs%2Fabc'
    );
    expect(screen.queryByRole('button', { name: /close|✕|×/i })).toBeNull();
    expect(countPaletteClasses(container.innerHTML)).toBe(0);
  });

  it('forgot-password: a hostile next is dropped', async () => {
    const { default: ForgotPassword } = await import('@/app/auth/forgot-password/page');
    query = 'next=%2F%2Fevil.example';
    render(<ForgotPassword />);
    expect(screen.getByTestId('auth-back').getAttribute('href')).toBe('/auth/login');
  });

  it('update-password uses design tokens only', async () => {
    const { default: UpdatePassword } = await import('@/app/auth/update-password/page');
    const { container } = render(<UpdatePassword />);
    expect(countPaletteClasses(container.innerHTML)).toBe(0);
  });
});
