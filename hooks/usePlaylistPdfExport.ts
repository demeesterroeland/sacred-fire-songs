'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { getPlaylistSongsForExport } from '@/app/actions/playlistActions';
import { exportPlaylistToPdf, downloadPdf } from '@/lib/export/pdfExport';
import { browserPdfStore, exportFingerprint, getOrCreatePdf, pdfCacheKey } from '@/lib/export/pdfCache';
import { actionErrorMessage } from '@/lib/errors/actionError';
import { useLocale } from '@/context/LocaleContext';

/** Largest playlist that can be exported in one PDF. */
export const PDF_EXPORT_MAX_SONGS = 200;

/**
 * Export a playlist as a PDF: from the playlist page and from a playlist row's ⋯ menu.
 * `songCount` is a quick check before the server is asked; the server's list decides.
 */
export function usePlaylistPdfExport({
  playlistId,
  title,
  description,
  songCount,
  isLoggedIn = true,
  onNeedLogin,
}: {
  playlistId: string;
  title: string;
  description?: string | null;
  songCount?: number;
  isLoggedIn?: boolean;
  onNeedLogin?: () => void;
}) {
  const { t, locale } = useLocale();
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const exportPdf = async () => {
    if (!isLoggedIn) {
      onNeedLogin?.();
      return;
    }
    if (songCount !== undefined && songCount > PDF_EXPORT_MAX_SONGS) {
      toast.error(t('playlists.export.limitExceeded', { max: PDF_EXPORT_MAX_SONGS }));
      return;
    }
    if (songCount === 0) {
      toast.info(t('playlists.export.empty'));
      return;
    }

    setIsExportingPdf(true);
    const toastId = toast.loading(t('playlists.export.generating'));
    try {
      const result = await getPlaylistSongsForExport(playlistId);
      if (result.error) {
        toast.error(t('playlists.export.failed'), { id: toastId, description: actionErrorMessage(result.error, t) });
        return;
      }
      if (!result.songs || result.songs.length === 0) {
        toast.info(t('playlists.export.empty'), { id: toastId });
        return;
      }
      if (result.songs.length > PDF_EXPORT_MAX_SONGS) {
        toast.error(t('playlists.export.limitExceeded', { max: PDF_EXPORT_MAX_SONGS }), { id: toastId });
        return;
      }

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const exportData = {
        title: result.title || title,
        description: description || result.description,
        songs: result.songs,
        baseUrl,
        locale,
      };

      // Reuse the last PDF while the playlist is unchanged (#304).
      const userId = result.userId ?? 'anonymous';
      const { blob } = await getOrCreatePdf({
        store: browserPdfStore(),
        key: pdfCacheKey(userId, playlistId),
        fingerprint: await exportFingerprint({ ...exportData, userId, playlistId }),
        generate: () => exportPlaylistToPdf(exportData),
      });

      downloadPdf(blob, result.title || title);
      toast.success(t('playlists.export.downloaded'), { id: toastId });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast.error(t('playlists.export.failed'), { id: toastId });
    } finally {
      setIsExportingPdf(false);
    }
  };

  return { exportPdf, isExportingPdf };
}
