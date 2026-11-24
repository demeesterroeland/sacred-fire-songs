// @vitest-environment jsdom
// Story 6.2.26 / G1.5 (#598): the bell tells the member their suggestion was linked or declined, in the reader's locale.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DICTIONARIES } from '@/lib/i18n';

const dict = DICTIONARIES.en as Record<string, string>;
const push = vi.fn();
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'en',
    t: (k: string, p?: Record<string, string | number>) => (dict[k] ?? k).replace(/\{(\w+)\}/g, (_, n) => String(p?.[n] ?? '')),
  }),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }));

const now = new Date().toISOString();
const notes = [
  {
    id: 'n1',
    type: 'link_suggestion_accepted',
    read_at: null,
    created_at: now,
    recording_id: null,
    composition_id: 'song-b',
    metadata: { source_title: 'Siento la medica', target_title: 'Siento la medicina' },
  },
  {
    id: 'n2',
    type: 'link_suggestion_declined',
    read_at: null,
    created_at: now,
    recording_id: null,
    composition_id: 'song-c',
    metadata: { source_title: 'Pipe song 58', target_title: 'Pipe song 65', reason: 'Different songs' },
  },
];
vi.mock('@/hooks/useNotificationsQuery', () => ({ useNotificationsQuery: () => ({ data: notes }) }));
vi.mock('@/lib/notifications/queries', async (orig) => ({ ...(await orig<object>()), markNotificationsRead: vi.fn() }));

import { NotificationBell } from '@/components/common/navigation/NotificationBell';

afterEach(cleanup);

describe('notification bell: link suggestions', () => {
  it('reads the linked and declined items and opens the song', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <NotificationBell userId="u1" />
      </QueryClientProvider>,
    );
    fireEvent.keyDown(screen.getByRole('button', { name: /Notifications/ }), { key: 'Enter' });
    expect(screen.getByText('Siento la medica was linked as a version of Siento la medicina.')).toBeTruthy();
    const declined = screen.getByText('Your suggestion for Pipe song 58 was declined: Different songs.');
    fireEvent.click(declined);
    expect(push).toHaveBeenCalledWith('/songs/song-c');
  });
});
