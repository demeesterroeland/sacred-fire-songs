// @vitest-environment jsdom
// Story 6.2.21 (#524): the admin list of catalog corrections, in the real English copy (RTL, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DICTIONARIES, translateFrom } from '@/lib/i18n';
import type { CatalogEditsExport } from '@/lib/catalog/catalogEdits';

const clearCatalogEditAction = vi.fn();
vi.mock('@/app/actions/catalogEdits', () => ({ clearCatalogEditAction: (...a: unknown[]) => clearCatalogEditAction(...a) }));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));
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

  it('marks a correction as taken over after confirming', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    clearCatalogEditAction.mockResolvedValue({ ok: true });
    render(<CatalogEditsList edits={edits} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Taken over' })[1]);
    await waitFor(() =>
      expect(clearCatalogEditAction).toHaveBeenCalledWith('version', '6f9619ff-8b86-4011-b42d-00c04fc964ff')
    );
  });

  it('does nothing when the admin cancels', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    clearCatalogEditAction.mockClear();
    render(<CatalogEditsList edits={edits} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Taken over' })[0]);
    expect(clearCatalogEditAction).not.toHaveBeenCalled();
  });
});
