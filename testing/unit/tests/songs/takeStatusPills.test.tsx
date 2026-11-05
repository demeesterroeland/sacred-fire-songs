// @vitest-environment jsdom
// Story 6.1.16 / G4.3 (#400): status is readable text, not a tooltip (RTL, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { TakeStatusPills } from '@/components/song/TakeStatusPills';
import { DICTIONARIES, SUPPORTED_LOCALES } from '@/lib/i18n';

const dict = DICTIONARIES.en as Record<string, string>;
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string, p?: Record<string, string | number>) =>
      Object.entries(p ?? {}).reduce((s, [n, v]) => s.replace(`{${n}}`, String(v)), dict[k] ?? k),
  }),
}));

afterEach(cleanup);

describe('TakeStatusPills', () => {
  it('shows the texts "Public" and "Shared · 2" for a public take shared with two people', () => {
    render(<TakeStatusPills pills={[{ kind: 'public' }, { kind: 'shared', count: 2 }]} />);
    expect(screen.getByText('Public')).toBeTruthy();
    expect(screen.getByText('Shared · 2')).toBeTruthy();
  });

  it('shows "Pending invite" and "Verified musician" as text', () => {
    render(<TakeStatusPills pills={[{ kind: 'pending' }, { kind: 'verified' }]} />);
    expect(screen.getByText('Pending invite')).toBeTruthy();
    expect(screen.getByText('Verified musician')).toBeTruthy();
  });

  it('has no title-only semantics: no title attribute, icons are decorative', () => {
    const { container } = render(<TakeStatusPills pills={[{ kind: 'public' }, { kind: 'shared', count: 2 }, { kind: 'pending' }, { kind: 'verified' }]} />);
    expect(container.querySelectorAll('[title]')).toHaveLength(0);
    expect(container.querySelectorAll('title')).toHaveLength(0);
    for (const svg of container.querySelectorAll('svg')) expect(svg.getAttribute('aria-hidden')).toBe('true');
  });

  it('uses grey chip tokens at 12 px, no palette colour', () => {
    const { container } = render(<TakeStatusPills pills={[{ kind: 'public' }]} />);
    const pill = screen.getByText('Public').closest('li')!;
    expect(pill.className).toMatch(/bg-chip/);
    expect(pill.className).toMatch(/text-on-chip/);
    expect(pill.className).toMatch(/text-caption/);
    expect(container.innerHTML).not.toMatch(/(gray|red|amber|emerald|indigo)-\d/);
  });

  it('renders nothing without pills', () => {
    const { container } = render(<TakeStatusPills pills={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('status keys in every locale', () => {
  const keys = ['recording.status.public', 'recording.status.shared', 'recording.status.pending', 'recording.status.verified'];
  it.each(keys)('%s exists in all locales; shared keeps the {count} placeholder', (key) => {
    for (const locale of SUPPORTED_LOCALES) {
      const v = (DICTIONARIES[locale] as Record<string, string>)[key];
      expect(v, `${locale} ${key}`).toBeTruthy();
      if (key.endsWith('shared')) expect(v).toContain('{count}');
    }
  });
});
