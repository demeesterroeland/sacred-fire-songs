// @vitest-environment jsdom
// Story 6.1.19 / G4.6 (#403): the "Shared with me" list — words and icon, not colour alone.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { SharedWithMeList } from '@/components/library/SharedWithMeList';
import { DICTIONARIES } from '@/lib/i18n';
import type { SharedTake } from '@/lib/notifications/sharedWithMe';

const dict = DICTIONARIES.en as Record<string, string>;
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string, p?: Record<string, string | number>) =>
      Object.entries(p ?? {}).reduce((s, [n, v]) => s.replace(`{${n}}`, String(v)), dict[k] ?? k),
  }),
}));
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

afterEach(cleanup);

const take = (over: Partial<SharedTake> = {}): SharedTake => ({
  recordingId: 'rec-1',
  compositionId: 'song-1',
  songTitle: 'Danza del Cielo',
  takeName: 'Alice verse',
  sharedBy: 'Alice',
  sharedAt: '2026-11-05T10:00:00Z',
  unread: true,
  ...over,
});

describe('SharedWithMeList', () => {
  it('shows song, sharer and take, and links to the take permalink', () => {
    render(<SharedWithMeList items={[take()]} />);
    const row = screen.getByTestId('shared-with-me-row');
    expect(within(row).getByText('Danza del Cielo')).toBeTruthy();
    expect(within(row).getByText(/Shared by Alice/)).toBeTruthy();
    expect(within(row).getByText(/Alice verse/)).toBeTruthy();
    expect(row.getAttribute('href')).toBe('/recordings/rec-1');
  });

  it('marks unread in words, with a decorative icon', () => {
    const { container } = render(<SharedWithMeList items={[take()]} />);
    expect(screen.getByText('New')).toBeTruthy();
    for (const svg of container.querySelectorAll('svg')) expect(svg.getAttribute('aria-hidden')).toBe('true');
  });

  it('shows no marker for a take that was already opened', () => {
    render(<SharedWithMeList items={[take({ unread: false })]} />);
    expect(screen.queryByText('New')).toBeNull();
  });

  it('falls back to the generic text when the sharer is unknown', () => {
    render(<SharedWithMeList items={[take({ sharedBy: null })]} />);
    expect(screen.getByText(/Shared with you/)).toBeTruthy();
  });

  it('shows the empty state', () => {
    render(<SharedWithMeList items={[]} />);
    expect(screen.getByTestId('shared-with-me-empty').textContent).toBe(dict['sharedWithMe.empty']);
  });

  it('uses tokens only, no palette colours', () => {
    const { container } = render(<SharedWithMeList items={[take()]} />);
    expect(container.innerHTML).not.toMatch(/(gray|red|amber|emerald|indigo|orange)-\d|#[0-9a-f]{6}/i);
  });
});
