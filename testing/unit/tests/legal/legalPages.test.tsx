// @vitest-environment jsdom
// Validation 2, item 12: real /terms and /privacy pages. The operator's name and email come from server
// environment variables read on each request (never NEXT_PUBLIC_, so a public image works for every self-hoster);
// unset, the pages say so and do not crash. Both pages carry a visible Draft note until the owner approves the text.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { DICTIONARIES, SUPPORTED_LOCALES } from '@/lib/i18n';
import { readOperator } from '@/lib/legal/operator';
import { LEGAL_KEYS, PRIVACY_SECTIONS, TERMS_SECTIONS } from '@/lib/legal/sections';

const dict = DICTIONARIES.en as Record<string, string>;
vi.mock('@/lib/i18n/server', () => ({
  getServerT: async () => (k: string, p?: Record<string, string | number>) =>
    (dict[k] ?? k).replace(/\{(\w+)\}/g, (_m, n) => String(p?.[n] ?? '')),
}));
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a>,
}));

import TermsPage from '@/app/terms/page';
import PrivacyPage from '@/app/privacy/page';

const ENV_KEYS = ['OPERATOR_NAME', 'OPERATOR_CONTACT_EMAIL'] as const;
beforeEach(() => ENV_KEYS.forEach((k) => delete process.env[k]));
afterEach(() => {
  cleanup();
  ENV_KEYS.forEach((k) => delete process.env[k]);
});

describe('readOperator', () => {
  it('is empty when nothing is set, or only blanks', () => {
    expect(readOperator({})).toEqual({ name: null, email: null });
    expect(readOperator({ OPERATOR_NAME: '  ', OPERATOR_CONTACT_EMAIL: '' })).toEqual({ name: null, email: null });
  });
  it('trims name and email', () => {
    expect(readOperator({ OPERATOR_NAME: ' Example Circle ', OPERATOR_CONTACT_EMAIL: ' privacy@example.org ' })).toEqual({
      name: 'Example Circle',
      email: 'privacy@example.org',
    });
  });
  it('ignores something that is not an email address instead of showing or linking it', () => {
    expect(readOperator({ OPERATOR_CONTACT_EMAIL: 'javascript:alert(1)' }).email).toBeNull();
    expect(readOperator({ OPERATOR_CONTACT_EMAIL: 'not an email' }).email).toBeNull();
  });
  it('reads the process environment by default, at call time', () => {
    process.env.OPERATOR_NAME = 'Late Name';
    expect(readOperator().name).toBe('Late Name');
  });
});

describe.each([
  ['terms', TermsPage, TERMS_SECTIONS],
  ['privacy', PrivacyPage, PRIVACY_SECTIONS],
] as const)('/%s', (name, Page, sections) => {
  it('shows a visible Draft note', async () => {
    render(await Page());
    expect(screen.getByRole('note').textContent).toContain(dict['legal.draft']);
  });

  it('says that no contact details are configured when the variables are unset, and does not crash', async () => {
    render(await Page());
    expect(screen.getByText(dict['legal.operator.none'])).toBeTruthy();
    expect(screen.queryByRole('link', { name: /@/ })).toBeNull();
  });

  it('shows the operator\'s name and a mailto link when the variables are set (read on each request)', async () => {
    process.env.OPERATOR_NAME = 'Example Songs Circle';
    process.env.OPERATOR_CONTACT_EMAIL = 'privacy@example.org';
    render(await Page());
    expect(screen.getByText(/Example Songs Circle/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'privacy@example.org' }).getAttribute('href')).toBe('mailto:privacy@example.org');
    expect(screen.queryByText(dict['legal.operator.none'])).toBeNull();
    cleanup();
    process.env.OPERATOR_NAME = 'Another Operator';
    delete process.env.OPERATOR_CONTACT_EMAIL;
    render(await Page());
    expect(screen.getByText(/Another Operator/)).toBeTruthy();
    expect(screen.getByText(dict['legal.operator.noEmail'])).toBeTruthy();
  });

  it('renders every section: a heading and its paragraphs', async () => {
    render(await Page());
    for (const s of sections) {
      expect(screen.getByRole('heading', { level: 2, name: dict[s.titleKey] })).toBeTruthy();
      for (const p of s.paragraphKeys) expect(screen.getByText(dict[p])).toBeTruthy();
    }
  });

  it('has one h1 and is a dynamic page (the environment is read per request)', async () => {
    render(await Page());
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(readFileSync(`app/${name}/page.tsx`, 'utf8')).toMatch(/export const dynamic = ['"]force-dynamic['"]/);
  });
});

describe('legal copy exists in every language', () => {
  it.each([...SUPPORTED_LOCALES])('%s has every legal key', (locale) => {
    const d = DICTIONARIES[locale as keyof typeof DICTIONARIES] as Record<string, string>;
    const missing = LEGAL_KEYS.filter((k) => !d[k]);
    expect(missing).toEqual([]);
  });
});

describe('operator variables', () => {
  it('are never exposed to the browser (no NEXT_PUBLIC_ prefix anywhere)', () => {
    for (const file of ['.env.example', 'lib/legal/operator.ts', 'app/terms/page.tsx', 'app/privacy/page.tsx', 'docker-compose.yml']) {
      expect(readFileSync(file, 'utf8')).not.toMatch(/NEXT_PUBLIC_OPERATOR/);
    }
  });
  it('are in .env.example with neutral placeholders and passed to the container', () => {
    const env = readFileSync('.env.example', 'utf8');
    // Commented out: a copied file must give the neutral "not configured" sentence, not an example operator.
    expect(env).toMatch(/^# OPERATOR_NAME=/m);
    expect(env).toMatch(/^# OPERATOR_CONTACT_EMAIL=/m);
    expect(env).not.toMatch(/^OPERATOR_NAME=/m);
    expect(env).not.toMatch(/^OPERATOR_CONTACT_EMAIL=/m);
    const compose = readFileSync('docker-compose.yml', 'utf8');
    expect(compose).toContain('OPERATOR_NAME=');
    expect(compose).toContain('OPERATOR_CONTACT_EMAIL=');
  });
});

describe('links', () => {
  it.each(['components/sign-up-form.tsx', 'components/login-form.tsx'])('%s links Terms and Privacy to real pages', (file) => {
    const src = readFileSync(file, 'utf8');
    expect(src).toContain('href="/terms"');
    expect(src).toContain('href="/privacy"');
    expect(src).not.toContain('href="#"');
  });
  it('the Account settings page links to both', () => {
    const src = readFileSync('components/account/settings/AccountSettings.tsx', 'utf8');
    expect(src).toContain('href="/terms"');
    expect(src).toContain('href="/privacy"');
  });
});

// Owner review: no third-party speed measurement in the app, and the privacy text says what the operator can reach.
describe('no speed measurement script', () => {
  it('the layout and package.json do not use Vercel Speed Insights', () => {
    expect(readFileSync('app/layout.tsx', 'utf8')).not.toMatch(/speed-insights|SpeedInsights/);
    expect(readFileSync('package.json', 'utf8')).not.toContain('speed-insights');
  });
  it.each([...SUPPORTED_LOCALES])('%s privacy text does not mention it', (locale) => {
    const d = DICTIONARIES[locale as keyof typeof DICTIONARIES] as Record<string, string>;
    for (const [key, value] of Object.entries(d)) {
      if (key.startsWith('legal.privacy.')) expect(value, key).not.toMatch(/speed insights|vercel/i);
    }
  });
});

describe('the privacy text names what the operator can reach', () => {
  it('has a paragraph on direct access to the database and file storage, in every language', () => {
    const section = PRIVACY_SECTIONS.find((x) => x.id === 'visible')!;
    expect(section.paragraphKeys).toContain('legal.privacy.visible.p5');
    for (const locale of SUPPORTED_LOCALES) {
      const d = DICTIONARIES[locale as keyof typeof DICTIONARIES] as Record<string, string>;
      expect(d['legal.privacy.visible.p5'], locale).toBeTruthy();
    }
    expect(dict['legal.privacy.visible.p5']).toMatch(/private recordings/i);
  });
});

