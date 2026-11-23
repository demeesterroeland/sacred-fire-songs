// @vitest-environment jsdom
// Story 6.2.21 (#524): the admin list of catalog corrections, in the real English copy (RTL, L3).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { DICTIONARIES, translateFrom } from '@/lib/i18n';
import type { CatalogEditsExport } from '@/lib/catalog/catalogEdits';

const clearCatalogEditAction = vi.fn();
vi.mock('@/app/actions/catalogEdits', () => ({ clearCatalogEditAction: (...a: unknown[]) => clearCatalogEditAction(...a) }));
const toastError = vi.fn();
vi.mock('sonner', () => ({ toast: { error: (...a: unknown[]) => toastError(...a) } }));
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'en',
    t: (k: string, p?: Record<string, string | number>) => translateFrom(DICTIONARIES.en, DICTIONARIES.en, k, p),
  }),
}));

const { default: CatalogEditsList } = await import('@/components/admin/CatalogEditsList');

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const edits: CatalogEditsExport = {
  songs: [
    {
      song_id: 's1',
      catalog_slug: 'song-a',
      title: 'Song A',
      edited_at: '2026-11-12T10:00:00+00:00',
      edited_fields: ['aliases', 'title'],
      values: {},
    },
  ],
  versions: [
    {
      song_id: 's1',
      version_id: '6f9619ff-8b86-4011-b42d-00c04fc964ff',
      catalog_slug: 'song-a',
      catalog_source_id: 'book-1',
      title: 'Song A',
      version_name: 'Book 1',
      edited_at: '2026-11-12T11:00:00+00:00',
      edited_fields: ['capo', 'content_chordpro', 'unknown_column'],
      values: {},
    },
  ],
};

describe('CatalogEditsList', () => {
  it('lists every correction with its catalog key and changed fields', () => {
    render(<CatalogEditsList edits={edits} />);
    const rows = screen.getAllByTestId('catalog-edit-row').map((r) => r.textContent);
    expect(rows[0]).toContain('song-a');
    expect(rows[0]).toContain('Changed: Other titles, Title');
    expect(rows[1]).toContain('song-a/book-1');
    expect(rows[1]).toContain('Changed: Capo, Lyrics and chords, unknown_column');
    expect(screen.getByRole('link', { name: /Download JSON/ }).getAttribute('href')).toBe('/admin/catalog-edits/export');
  });

  it('shows an empty state without corrections', () => {
    render(<CatalogEditsList edits={{ songs: [], versions: [] }} />);
    expect(screen.getByText('No catalog song or version has been corrected in the app.')).toBeTruthy();
  });

  beforeEach(() => {
    clearCatalogEditAction.mockReset();
    toastError.mockReset();
  });

  const openConfirm = (index: number) => {
    const trigger = screen.getAllByRole('button', { name: 'Taken over' })[index];
    fireEvent.click(trigger);
    return { trigger, dialog: screen.getByRole('dialog') };
  };

  it('asks for confirmation in a dialog, not the browser prompt (review N1)', () => {
    const confirm = vi.spyOn(window, 'confirm');
    render(<CatalogEditsList edits={edits} />);
    const { dialog } = openConfirm(1);
    expect(confirm).not.toHaveBeenCalled();
    expect(within(dialog).getByRole('heading', { name: 'Mark as taken over?' })).toBeTruthy();
    expect(dialog.textContent).toContain('song-a/book-1');
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: 'Mark as taken over' }).className).toContain('min-h-tap');
    expect(clearCatalogEditAction).not.toHaveBeenCalled();
  });

  it('marks the downloaded correction as taken over after confirming', async () => {
    clearCatalogEditAction.mockResolvedValue({ ok: true });
    render(<CatalogEditsList edits={edits} />);
    const { dialog } = openConfirm(1);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Mark as taken over' }));
    await waitFor(() =>
      expect(clearCatalogEditAction).toHaveBeenCalledWith(
        'version',
        '6f9619ff-8b86-4011-b42d-00c04fc964ff',
        '2026-11-12T11:00:00+00:00'
      )
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(toastError).not.toHaveBeenCalled();
  });

  it('does nothing when the admin cancels, and returns focus to the row button', async () => {
    render(<CatalogEditsList edits={edits} />);
    const { trigger, dialog } = openConfirm(0);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(clearCatalogEditAction).not.toHaveBeenCalled();
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it.each([
    ['changed', 'This row was corrected again after you downloaded it. Download the list again and copy the newer correction into the catalog first.'],
    ['forbidden', 'Only admins can mark corrections as taken over.'],
    ['error', 'Could not mark the correction as taken over. Try again.'],
  ])('explains a %s answer (review S1, N2)', async (reason, message) => {
    clearCatalogEditAction.mockResolvedValue({ ok: false, reason });
    render(<CatalogEditsList edits={edits} />);
    const { dialog } = openConfirm(0);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Mark as taken over' }));
    await waitFor(() => expect(toastError).toHaveBeenCalledWith(message));
  });

  it('explains a failure when the action throws', async () => {
    clearCatalogEditAction.mockRejectedValue(new Error('network'));
    render(<CatalogEditsList edits={edits} />);
    const { dialog } = openConfirm(0);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Mark as taken over' }));
    await waitFor(() => expect(toastError).toHaveBeenCalledWith('Could not mark the correction as taken over. Try again.'));
  });

  describe('focus after a correction is taken over (re-check nit)', () => {
    const second = { ...edits.versions[0], version_id: 'v2', catalog_source_id: 'book-2', version_name: 'Book 2' };
    const twoVersions: CatalogEditsExport = { songs: edits.songs, versions: [edits.versions[0], second] };

    const confirmAndRefresh = async (
      view: ReturnType<typeof render>,
      index: number,
      after: CatalogEditsExport
    ) => {
      clearCatalogEditAction.mockResolvedValue({ ok: true });
      const { dialog } = openConfirm(index);
      fireEvent.click(within(dialog).getByRole('button', { name: 'Mark as taken over' }));
      await waitFor(() => expect(clearCatalogEditAction).toHaveBeenCalled());
      await act(async () => {});
      // The server action revalidates the page: the list comes back without the cleared row.
      view.rerender(<CatalogEditsList edits={after} />);
    };

    it('moves focus to the next row once the cleared row is gone', async () => {
      const view = render(<CatalogEditsList edits={twoVersions} />);
      await confirmAndRefresh(view, 1, { songs: edits.songs, versions: [second] });
      const next = screen.getAllByRole('button', { name: 'Taken over' })[1];
      await waitFor(() => expect(document.activeElement).toBe(next));
      expect(within(screen.getAllByTestId('catalog-edit-row')[1]).getByText(/Book 2/)).toBeTruthy();
    });

    it('moves focus to the previous row when the last row was cleared', async () => {
      const view = render(<CatalogEditsList edits={twoVersions} />);
      await confirmAndRefresh(view, 2, { songs: edits.songs, versions: [edits.versions[0]] });
      const previous = screen.getAllByRole('button', { name: 'Taken over' })[1];
      await waitFor(() => expect(document.activeElement).toBe(previous));
    });

    it('moves focus to the empty state when nothing is left', async () => {
      const view = render(<CatalogEditsList edits={{ songs: edits.songs, versions: [] }} />);
      await confirmAndRefresh(view, 0, { songs: [], versions: [] });
      const empty = screen.getByText('No catalog song or version has been corrected in the app.');
      await waitFor(() => expect(document.activeElement).toBe(empty));
    });

    it('keeps focus on the row button when the clear fails', async () => {
      clearCatalogEditAction.mockResolvedValue({ ok: false, reason: 'changed' });
      render(<CatalogEditsList edits={twoVersions} />);
      const { trigger, dialog } = openConfirm(1);
      fireEvent.click(within(dialog).getByRole('button', { name: 'Mark as taken over' }));
      await waitFor(() => expect(toastError).toHaveBeenCalled());
      await waitFor(() => expect(document.activeElement).toBe(trigger));
    });
  });

  it('names a row whose catalog key was removed in the app (review N5)', () => {
    render(
      <CatalogEditsList
        edits={{ songs: [{ ...edits.songs[0], catalog_slug: null, edited_fields: ['catalog_slug'] }], versions: [] }}
      />
    );
    const row = screen.getByTestId('catalog-edit-row').textContent;
    expect(row).toContain('No catalog key (removed in the app)');
    expect(row).toContain('Changed: Catalog key');
  });
});
