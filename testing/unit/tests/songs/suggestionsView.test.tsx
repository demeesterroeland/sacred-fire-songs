// @vitest-environment jsdom
// Story 6.2.26 / G1.5 (#598): the review page — queue, review sheet with the preview, decline, withdraw (L3, English copy).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DICTIONARIES, interpolate } from '@/lib/i18n';
import type { LinkSuggestion } from '@/lib/songs/linkSuggestion';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'en',
    t: (k: string, p?: Record<string, string | number>) => interpolate((DICTIONARIES.en as Record<string, string>)[k] ?? k, p),
  }),
}));
const refresh = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh, push: vi.fn() }) }));
const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock('sonner', () => ({ toast: { success: (...a: unknown[]) => toastSuccess(...a), error: (...a: unknown[]) => toastError(...a) } }));

const preview = vi.fn();
const accept = vi.fn();
const decline = vi.fn();
const withdraw = vi.fn();
const reopen = vi.fn();
vi.mock('@/app/actions/linkSuggestion', () => ({
  previewSuggestion: (...a: unknown[]) => preview(...a),
  acceptSuggestion: (...a: unknown[]) => accept(...a),
  declineSuggestion: (...a: unknown[]) => decline(...a),
  withdrawSuggestion: (...a: unknown[]) => withdraw(...a),
  reopenSuggestion: (...a: unknown[]) => reopen(...a),
}));

import { SuggestionsView } from '@/components/suggestions/SuggestionsView';

const row = (over: Partial<LinkSuggestion>): LinkSuggestion => ({
  id: 'r1',
  source_id: 's1',
  target_id: 't1',
  source_title: 'Siento la medica',
  target_title: 'Siento la medicina',
  suggested_by: 'anna',
  suggester_name: 'Anna',
  note: 'Same song, same chords.',
  status: 'open',
  decision_note: null,
  reviewed_by: null,
  reviewer_name: null,
  reviewed_at: null,
  reopened_at: null,
  created_at: '2026-11-20T10:00:00Z',
  ...over,
});
const summary = {
  source_id: 's1', source_title: 'Siento la medica', target_id: 't1', target_title: 'Siento la medicina',
  versions: 1, recordings: 2, playlist_items: 0, favourites: 0, favourites_merged: 0, categories_added: 0,
  aliases_added: [], catalog_slug: 'none', catalog_keys_cleared: 0, translations: 0,
};

beforeEach(() => {
  vi.clearAllMocks();
  preview.mockResolvedValue({ ok: true, summary });
  accept.mockResolvedValue({ ok: true, summary });
  decline.mockResolvedValue({ ok: true });
  withdraw.mockResolvedValue({ ok: true });
  reopen.mockResolvedValue({ ok: true });
});
afterEach(cleanup);

const reviewSheet = () => screen.queryByTestId('review-suggestion-sheet');

const renderView = (rows: LinkSuggestion[], user: { id: string; role: string }) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SuggestionsView rows={rows} user={user} />
    </QueryClientProvider>,
  );

describe('SuggestionsView as a reviewer', () => {
  it('lists open suggestions with the note and hints, counts them in the tab', () => {
    renderView(
      [
        row({}),
        row({ id: 'r2', source_title: 'Pipe song 58', target_title: 'Pipe song 65', source_id: 'p58', target_id: 'p65' }),
        row({ id: 'r3', status: 'declined', source_id: 'p65', target_id: 'p58', source_title: 'Pipe song 65', target_title: 'Pipe song 58', reviewed_at: '2026-11-09T10:00:00Z' }),
      ],
      { id: 'dana', role: 'gatekeeper' },
    );
    expect(screen.getByRole('radio', { name: 'To review (2)' })).toBeTruthy();
    expect(screen.getAllByTestId('suggestion-row')).toHaveLength(2);
    // The pair is one translated text (no literal arrow in the markup), so a locale can order it its own way.
    expect(screen.getAllByTestId('suggestion-pair')[0].textContent).toBe('Siento la medica → Siento la medicina');
    expect(screen.getAllByText('Same song, same chords.').length).toBeGreaterThan(0);
    expect(screen.getByText(/Declined before on/)).toBeTruthy();
  });

  it('shows what a link moves, says there is no undo, and links from the suggestion', async () => {
    renderView([row({})], { id: 'dana', role: 'gatekeeper' });
    fireEvent.click(screen.getByRole('button', { name: /Review the suggestion Siento la medica/ }));
    expect(await screen.findByText('2 recordings')).toBeTruthy();
    expect(preview).toHaveBeenCalledWith('r1', false);
    expect(screen.getByText(/There is no undo/)).toBeTruthy();
    await act(async () => {
      fireEvent.click(screen.getByTestId('suggest-link'));
    });
    expect(accept).toHaveBeenCalledWith('r1', false);
    expect(toastSuccess).toHaveBeenCalled();
    expect(refresh).toHaveBeenCalled();
  });

  it('keeps the other song when the reviewer asks, and previews that direction', async () => {
    renderView([row({})], { id: 'dana', role: 'admin' });
    fireEvent.click(screen.getByRole('button', { name: /Review the suggestion/ }));
    await screen.findByText('2 recordings');
    await act(async () => {
      fireEvent.click(screen.getByTestId('review-swap'));
    });
    expect(preview).toHaveBeenLastCalledWith('r1', true);
    await act(async () => {
      fireEvent.click(screen.getByTestId('suggest-link'));
    });
    expect(accept).toHaveBeenCalledWith('r1', true);
  });

  it('declines with an optional reason', async () => {
    renderView([row({})], { id: 'dana', role: 'admin' });
    fireEvent.click(screen.getByRole('button', { name: /Review the suggestion/ }));
    await screen.findByText('2 recordings');
    fireEvent.click(screen.getByTestId('suggest-decline'));
    fireEvent.change(screen.getByLabelText('Reason for Anna (optional)'), { target: { value: 'Different songs' } });
    await act(async () => {
      fireEvent.click(screen.getByTestId('suggest-decline-confirm'));
    });
    expect(decline).toHaveBeenCalledWith('r1', 'Different songs');
    expect(reviewSheet()).toBeNull();
  });

  it('only an admin reopens a declined suggestion', () => {
    const declined = row({ status: 'declined', reviewed_at: '2026-11-09T10:00:00Z', reviewer_name: 'Dana' });
    renderView([declined], { id: 'dana', role: 'admin' });
    fireEvent.click(screen.getByRole('radio', { name: 'Reviewed' }));
    expect(screen.getByRole('button', { name: 'Reopen' })).toBeTruthy();
    cleanup();
    renderView([declined], { id: 'gate', role: 'gatekeeper' });
    fireEvent.click(screen.getByRole('radio', { name: 'Reviewed' }));
    expect(screen.queryByRole('button', { name: 'Reopen' })).toBeNull();
  });

  it('says plainly when nothing waits', () => {
    renderView([], { id: 'dana', role: 'gatekeeper' });
    expect(screen.getByText('Nothing to review.')).toBeTruthy();
  });
});

describe('SuggestionsView as a member', () => {
  it('lists only their own list, with Withdraw on an open suggestion and a status word on the others', async () => {
    renderView(
      [row({ suggested_by: 'anna' }), row({ id: 'r2', suggested_by: 'anna', status: 'declined', decision_note: 'Different songs', reviewer_name: 'Dana', reviewed_at: '2026-11-09T10:00:00Z' })],
      { id: 'anna', role: 'member' },
    );
    expect(screen.queryByRole('radio')).toBeNull();
    expect(screen.getByText('My suggestions')).toBeTruthy();
    const rows = screen.getAllByTestId('suggestion-row');
    expect(within(rows[1]).getByText('Declined')).toBeTruthy();
    expect(within(rows[1]).getByText('Different songs')).toBeTruthy();
    await act(async () => {
      fireEvent.click(within(rows[0]).getByRole('button', { name: 'Withdraw' }));
    });
    expect(withdraw).toHaveBeenCalledWith('r1');
    // A member never opens the review sheet.
    expect(screen.queryByRole('button', { name: /Review the suggestion/ })).toBeNull();
  });
});
