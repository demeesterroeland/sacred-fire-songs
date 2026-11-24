// @vitest-environment jsdom
// Story 6.2.26 / G1.5 (#598): the "Suggest as a version of…" sheet — pick a song, add a note, send (L3, English copy).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DICTIONARIES, interpolate } from '@/lib/i18n';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string, p?: Record<string, string | number>) => interpolate((DICTIONARIES.en as Record<string, string>)[k] ?? k, p),
  }),
}));

const search = vi.fn();
const suggest = vi.fn();
vi.mock('@/app/actions/linkSuggestion', () => ({
  searchSongsToSuggest: (...a: unknown[]) => search(...a),
  suggestSongLink: (...a: unknown[]) => suggest(...a),
}));

import { SuggestSongSheet } from '@/components/song/SuggestSongSheet';

const SOURCE = '550e8400-e29b-41d4-a716-446655440001';
const TARGET = '550e8400-e29b-41d4-a716-446655440002';

beforeEach(() => {
  vi.clearAllMocks();
  search.mockResolvedValue({
    songs: [
      { id: TARGET, title: 'Siento la medicina', original_author: 'Herbert Quinteros', versionCount: 3, alreadySuggested: false },
      { id: 'other', title: 'Siento la medicina 2', original_author: null, versionCount: 1, alreadySuggested: true },
    ],
  });
  suggest.mockResolvedValue({ ok: true, id: 'new' });
});
afterEach(cleanup);

function setup() {
  const onSent = vi.fn();
  render(<SuggestSongSheet open onOpenChange={vi.fn()} sourceId={SOURCE} sourceTitle="Siento la medica" onSent={onSent} />);
  return { onSent };
}

async function pickTarget() {
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search songs' }), { target: { value: 'siento' } });
  const option = await screen.findByRole('button', { name: 'Pick Siento la medicina' });
  await act(async () => {
    fireEvent.click(option);
  });
}

describe('SuggestSongSheet', () => {
  it('searches without the song itself and shows author and versions to tell look-alikes apart', async () => {
    setup();
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search songs' }), { target: { value: 'siento' } });
    expect(await screen.findByText('Herbert Quinteros · 3 versions')).toBeTruthy();
    expect(search).toHaveBeenCalledWith('siento', SOURCE);
    // A pair that is already suggested is disabled and says so.
    expect((screen.getByRole('button', { name: 'Pick Siento la medicina 2' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText('Suggested')).toBeTruthy();
    // "Open song" opens the song in a new tab, to compare the lyrics.
    const open = screen.getByRole('link', { name: 'Open Siento la medicina in a new tab' });
    expect(open.getAttribute('target')).toBe('_blank');
    expect(open.getAttribute('rel')).toContain('noopener');
  });

  it('says that nothing changes now, and sends the suggestion with the note', async () => {
    const { onSent } = setup();
    await pickTarget();
    expect(screen.getByText(/Nothing changes now/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Note for the reviewer (optional)'), { target: { value: 'Same song' } });
    expect(screen.getByText('9 / 280')).toBeTruthy();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Send suggestion' }));
    });
    expect(suggest).toHaveBeenCalledWith(SOURCE, TARGET, 'Same song');
    expect(onSent).toHaveBeenCalledTimes(1);
  });

  it('shows the reason of a refusal and keeps the sheet open', async () => {
    suggest.mockResolvedValue({ ok: false, error: 'duplicate' });
    const { onSent } = setup();
    await pickTarget();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Send suggestion' }));
    });
    expect((await screen.findByRole('alert')).textContent).toBe('This suggestion already exists.');
    expect(onSent).not.toHaveBeenCalled();
  });

  it('sends only once on a double click', async () => {
    let resolve: (v: unknown) => void = () => {};
    suggest.mockReturnValue(new Promise((r) => (resolve = r)));
    setup();
    await pickTarget();
    const send = screen.getByRole('button', { name: 'Send suggestion' });
    await act(async () => {
      fireEvent.click(send);
      fireEvent.click(send);
    });
    expect(suggest).toHaveBeenCalledTimes(1);
    await act(async () => resolve({ ok: true, id: 'x' }));
  });
});
