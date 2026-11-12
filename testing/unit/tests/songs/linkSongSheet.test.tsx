// @vitest-environment jsdom
// Story 6.2.9 / G1.4 (#512): the "Link as a version of…" sheet — pick a song, see what moves, confirm (L3, English copy).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DICTIONARIES, interpolate } from '@/lib/i18n';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string, p?: Record<string, string | number>) => interpolate((DICTIONARIES.en as Record<string, string>)[k] ?? k, p),
  }),
}));

const search = vi.fn();
const preview = vi.fn();
const link = vi.fn();
vi.mock('@/app/actions/linkSong', () => ({
  searchSongsToLinkTo: (...a: unknown[]) => search(...a),
  previewSongLink: (...a: unknown[]) => preview(...a),
  linkSongAsVersion: (...a: unknown[]) => link(...a),
}));

import { LinkSongSheet } from '@/components/song/LinkSongSheet';

const SOURCE = '550e8400-e29b-41d4-a716-446655440001';
const TARGET = '550e8400-e29b-41d4-a716-446655440002';
const summary = {
  source_id: SOURCE,
  source_title: 'Weyo Wey Yanna (Songbook B)',
  target_id: TARGET,
  target_title: 'Weyo wey yanna',
  versions: 1,
  recordings: 2,
  playlist_items: 0,
  favourites: 0,
  favourites_merged: 0,
  categories_added: 0,
  aliases_added: ['Weyo Wey Yanna (Songbook B)'],
  catalog_slug: 'none',
  catalog_keys_cleared: 0,
  translations: 0,
};

beforeEach(() => {
  vi.clearAllMocks();
  search.mockResolvedValue({ songs: [{ id: TARGET, title: 'Weyo wey yanna', original_author: 'Traditional' }] });
  preview.mockResolvedValue({ summary });
  link.mockResolvedValue({ summary });
});
afterEach(cleanup);

function setup() {
  const onLinked = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <LinkSongSheet open onOpenChange={onOpenChange} sourceId={SOURCE} sourceTitle="Weyo Wey Yanna (Songbook B)" onLinked={onLinked} />
  );
  return { onLinked, onOpenChange };
}

async function pickTarget() {
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search songs' }), { target: { value: 'weyo' } });
  const option = await screen.findByRole('button', { name: /Weyo wey yanna/ });
  await act(async () => {
    fireEvent.click(option);
  });
}

describe('LinkSongSheet', () => {
  it('searches without the song itself and previews the picked song before anything changes', async () => {
    setup();
    await pickTarget();
    expect(search).toHaveBeenCalledWith('weyo', SOURCE);
    expect(preview).toHaveBeenCalledWith(SOURCE, TARGET);
    expect(await screen.findByText('1 version')).toBeTruthy();
    expect(screen.getByText('2 recordings')).toBeTruthy();
    expect(screen.getByText(/cannot be undone/)).toBeTruthy();
    expect(link).not.toHaveBeenCalled();
  });

  it('links on confirm and hands the target to the page', async () => {
    const { onLinked } = setup();
    await pickTarget();
    await act(async () => {
      fireEvent.click(await screen.findByRole('button', { name: 'Link song' }));
    });
    expect(link).toHaveBeenCalledWith(SOURCE, TARGET);
    await waitFor(() => expect(onLinked).toHaveBeenCalledWith(expect.objectContaining({ target_id: TARGET })));
  });

  it('shows the reason when the database refuses, and goes back to the search', async () => {
    preview.mockResolvedValue({ error: 'alreadyLinked' });
    setup();
    await pickTarget();
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'This song is already linked to another song.');
    expect(screen.queryByRole('button', { name: 'Link song' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Pick another song' }));
    expect(screen.getByRole('searchbox', { name: 'Search songs' })).toBeTruthy();
  });
});
