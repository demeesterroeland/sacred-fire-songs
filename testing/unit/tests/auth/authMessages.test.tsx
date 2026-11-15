// @vitest-environment jsdom
// Auth pages show translated messages chosen by a code, never text taken from the address or from the provider.
// Unknown values give the default text. The redirects carry a known code only.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { DICTIONARIES } from '@/lib/i18n';
import { authNoticeKey, errorKeyForCode, knownAuthCode, safeEmailParam } from '@/lib/auth/notice';

const dict = DICTIONARIES.en as Record<string, string>;
let query = '';
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({ t: (k: string) => dict[k] ?? k }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(query),
}));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: {} }) }));

import AuthErrorPage from '@/app/auth/error/page';
import UpdatePasswordPage from '@/app/auth/update-password/page';
import ForgotPasswordPage from '@/app/auth/forgot-password/page';
import SignUpSuccessPage from '@/app/auth/sign-up-success/page';
import { LoginForm } from '@/components/login-form';
import { SignUpForm } from '@/components/sign-up-form';

beforeEach(() => {
  query = '';
});
afterEach(cleanup);

const ARBITRARY = 'Zebra crossing text 12345';

describe('authNoticeKey', () => {
  it('is null without a message', () => {
    expect(authNoticeKey(null)).toBeNull();
    expect(authNoticeKey('')).toBeNull();
  });
  it('maps a known code to its key', () => {
    expect(authNoticeKey('login_required')).toBe('auth.notice.loginRequired');
  });
  it('gives the default key for any other value', () => {
    expect(authNoticeKey(ARBITRARY)).toBe('auth.error.default');
    expect(authNoticeKey('constructor')).toBe('auth.error.default');
    expect(authNoticeKey('__proto__')).toBe('auth.error.default');
  });
});

describe('errorKeyForCode', () => {
  it('maps known codes', () => {
    expect(errorKeyForCode('otp_expired')).toBe('errors.auth.linkExpired');
    expect(errorKeyForCode('missing_params')).toBe('errors.auth.linkInvalid');
  });
  it('gives the default key for unknown or inherited names', () => {
    for (const v of [ARBITRARY, 'constructor', 'toString', '__proto__', '', null, undefined]) {
      expect(errorKeyForCode(v)).toBe('auth.error.default');
    }
  });
});

describe('knownAuthCode', () => {
  it('returns the code of a provider error only when it is a known one', () => {
    expect(knownAuthCode({ code: 'otp_expired', message: ARBITRARY })).toBe('otp_expired');
    expect(knownAuthCode({ code: 'something_new', message: ARBITRARY })).toBeNull();
    expect(knownAuthCode({ message: ARBITRARY })).toBeNull();
    expect(knownAuthCode({ code: 'constructor' })).toBeNull();
    expect(knownAuthCode(null)).toBeNull();
  });
});

describe('safeEmailParam', () => {
  it('keeps an email address and drops anything else', () => {
    expect(safeEmailParam('a@example.org')).toBe('a@example.org');
    expect(safeEmailParam('<b>x</b> hello there')).toBe('');
    expect(safeEmailParam(null)).toBe('');
    expect(safeEmailParam('a'.repeat(300) + '@example.org')).toBe('');
  });
});

describe('the error page', () => {
  it('shows the default text and never the text from the address', () => {
    query = `error=${encodeURIComponent(ARBITRARY)}&message=${encodeURIComponent(ARBITRARY)}&code=${encodeURIComponent(ARBITRARY)}`;
    const { container } = render(<AuthErrorPage />);
    expect(container.textContent).not.toContain(ARBITRARY);
    expect(screen.getByText(dict['auth.error.default'])).toBeTruthy();
  });
  it('ignores the old error parameter even when a code is known', () => {
    query = `error=${encodeURIComponent(ARBITRARY)}&code=otp_expired`;
    const { container } = render(<AuthErrorPage />);
    expect(container.textContent).not.toContain(ARBITRARY);
    expect(screen.getByText(dict['errors.auth.linkExpired'])).toBeTruthy();
  });
});

describe.each([
  ['LoginForm', () => <LoginForm />],
  ['SignUpForm', () => <SignUpForm />],
  ['UpdatePassword', () => <UpdatePasswordPage />],
  ['ForgotPassword', () => <ForgotPasswordPage />],
])('%s notice', (_name, mount) => {
  it('does not echo an arbitrary message parameter', () => {
    query = `message=${encodeURIComponent(ARBITRARY)}`;
    const { container } = render(mount());
    expect(container.textContent).not.toContain(ARBITRARY);
    expect(screen.getByText(dict['auth.error.default'])).toBeTruthy();
  });
  it('shows the translated sentence for a known code', () => {
    query = 'message=login_required';
    render(mount());
    expect(screen.getByText(dict['auth.notice.loginRequired'])).toBeTruthy();
  });
  it('shows no notice without the parameter', () => {
    render(mount());
    expect(screen.queryByText(dict['auth.error.default'])).toBeNull();
    expect(screen.queryByText(dict['auth.notice.loginRequired'])).toBeNull();
  });
});

describe('sign-up-success', () => {
  it('shows an email address from the address, but not other text', () => {
    query = `email=${encodeURIComponent(ARBITRARY)}`;
    const { container } = render(<SignUpSuccessPage />);
    expect(container.textContent).not.toContain(ARBITRARY);
    cleanup();
    query = 'email=a%40example.org';
    render(<SignUpSuccessPage />);
    expect(screen.getByText('a@example.org')).toBeTruthy();
  });
});

describe('redirect routes carry a known code only', () => {
  const PROVIDER_TEXT = 'Provider says: ' + ARBITRARY;
  let exchange: (code: string) => Promise<{ error: unknown }>;
  let verify: () => Promise<{ error: unknown }>;

  beforeEach(() => {
    vi.resetModules();
    exchange = async () => ({ error: { code: 'otp_expired', message: PROVIDER_TEXT } });
    verify = async () => ({ error: { code: 'unheard_of_code', message: PROVIDER_TEXT } });
    vi.doMock('@/lib/supabase/server', () => ({
      createClient: async () => ({
        auth: { exchangeCodeForSession: (c: string) => exchange(c), verifyOtp: () => verify() },
      }),
    }));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.doUnmock('@/lib/supabase/server');
    vi.restoreAllMocks();
  });

  const locationOf = (res: Response) => decodeURIComponent(res.headers.get('location') ?? '');

  it('confirm: a failed code exchange redirects with the known code and none of the provider text', async () => {
    const { GET } = await import('@/app/auth/confirm/route');
    const { NextRequest } = await import('next/server');
    const res = await GET(new NextRequest('http://localhost:3000/auth/confirm?code=abc&foo=bar'));
    const loc = locationOf(res);
    expect(loc).toContain('/auth/error?code=otp_expired');
    expect(loc).not.toContain(ARBITRARY);
    expect(loc).not.toContain('foo');
  });

  it('confirm: an unknown provider code gives a plain error redirect', async () => {
    const { GET } = await import('@/app/auth/confirm/route');
    const { NextRequest } = await import('next/server');
    const res = await GET(new NextRequest('http://localhost:3000/auth/confirm?token_hash=x&type=signup'));
    const loc = locationOf(res);
    expect(new URL(loc).pathname).toBe('/auth/error');
    expect(loc).not.toContain(ARBITRARY);
    expect(loc).not.toContain('unheard_of_code');
  });

  it('confirm: no usable parameters redirects with the missing_params code, naming no parameter', async () => {
    const { GET } = await import('@/app/auth/confirm/route');
    const { NextRequest } = await import('next/server');
    const res = await GET(new NextRequest('http://localhost:3000/auth/confirm?secret_param=1&other=2'));
    const loc = locationOf(res);
    expect(loc).toContain('/auth/error?code=missing_params');
    expect(loc).not.toContain('secret_param');
    expect(loc).not.toContain('other');
  });

  it('callback: a failed exchange redirects with a known code only', async () => {
    const { GET } = await import('@/app/auth/callback/route');
    const res = await GET(new Request('http://localhost:3000/auth/callback?code=abc'));
    const loc = locationOf(res);
    expect(loc).toContain('/auth/error?code=otp_expired');
    expect(loc).not.toContain(ARBITRARY);
  });

  it('callback: no code redirects to the plain error page', async () => {
    const { GET } = await import('@/app/auth/callback/route');
    const res = await GET(new Request('http://localhost:3000/auth/callback'));
    expect(new URL(locationOf(res)).search).toBe('');
  });
});

describe('sources', () => {
  it.each([
    'app/auth/error/page.tsx',
    'app/auth/confirm/route.ts',
    'app/auth/callback/route.ts',
    'components/login-form.tsx',
    'components/sign-up-form.tsx',
    'app/auth/update-password/page.tsx',
    'app/auth/forgot-password/page.tsx',
    'lib/supabase/proxy.ts',
  ])('%s does not read, print or build address text', (file) => {
    const src = readFileSync(file, 'utf8');
    expect(src).not.toMatch(/searchParams\.get\(['"]error['"]\)/);
    expect(src).not.toMatch(/error=\$\{|error\?\.message|encodeURIComponent\(error\.message\)/);
    expect(src).not.toMatch(/\{message\}/);
    expect(src).not.toMatch(/Please log in to access this page/);
  });
});
