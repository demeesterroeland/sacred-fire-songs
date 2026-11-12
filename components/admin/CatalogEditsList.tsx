'use client';

import { useRef, useState, useTransition } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

import { useLocale } from '@/context/LocaleContext';
import { LOCALE_DATE_TAGS, type TranslationKey } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { clearCatalogEditAction, type ClearCatalogEditReason } from '@/app/actions/catalogEdits';
import { catalogVersionKey } from '@/lib/catalog/importContract';
import type { CatalogEditKind, CatalogEditsExport } from '@/lib/catalog/catalogEdits';

/** Label of every tracked column (migration 20261112160000); an unknown column shows its name. */
const FIELD_LABELS: Record<string, TranslationKey> = {
  catalog_slug: 'admin.catalogEdits.field.catalog_key',
  catalog_source_id: 'admin.catalogEdits.field.catalog_key',
  title: 'admin.catalogEdits.field.title',
  original_author: 'admin.catalogEdits.field.original_author',
  aliases: 'admin.catalogEdits.field.aliases',
  authors: 'admin.catalogEdits.field.authors',
  version_name: 'admin.catalogEdits.field.version_name',
  content_chordpro: 'admin.catalogEdits.field.content_chordpro',
  melody_notation: 'admin.catalogEdits.field.melody_notation',
  key: 'admin.catalogEdits.field.key',
  capo: 'admin.catalogEdits.field.capo',
  tuning: 'admin.catalogEdits.field.tuning',
  soundcloud_url: 'admin.catalogEdits.field.soundcloud_url',
  youtube_url: 'admin.catalogEdits.field.youtube_url',
  spotify_url: 'admin.catalogEdits.field.spotify_url',
  version_kind: 'admin.catalogEdits.field.version_kind',
  beats: 'admin.catalogEdits.field.beats',
  song_note: 'admin.catalogEdits.field.song_note',
  composition_id: 'admin.catalogEdits.field.composition_id',
};

interface Row {
  kind: CatalogEditKind;
  id: string;
  title: string;
  subtitle: string | null;
  /** Null when the catalog key was removed in the app. */
  catalogKey: string | null;
  editedAt: string | null;
  fields: string[];
}

function toRows(edits: CatalogEditsExport): { songs: Row[]; versions: Row[] } {
  return {
    songs: edits.songs.map((s) => ({
      kind: 'song',
      id: s.song_id,
      title: s.title,
      subtitle: null,
      catalogKey: s.catalog_slug,
      editedAt: s.edited_at,
      fields: s.edited_fields,
    })),
    versions: edits.versions.map((v) => ({
      kind: 'version',
      id: v.version_id,
      title: v.title,
      subtitle: v.version_name,
      catalogKey:
        v.catalog_slug && v.catalog_source_id
          ? catalogVersionKey(v.catalog_slug, v.catalog_source_id)
          : v.catalog_source_id,
      editedAt: v.edited_at,
      fields: v.edited_fields,
    })),
  };
}

const FAILURE_MESSAGES: Record<Exclude<ClearCatalogEditReason, 'not_marked'>, TranslationKey> = {
  changed: 'admin.catalogEdits.changedSinceDownload',
  forbidden: 'admin.catalogEdits.forbidden',
  error: 'admin.catalogEdits.clearFailed',
};

/**
 * Story 6.2.21 (#524): admin list of catalog songs and versions corrected in the app. An importer
 * skips them (docs/guides/importing-songbooks.md); the admin downloads them as JSON for the source
 * catalog and marks each one as taken over once the catalog has the correction.
 */
export default function CatalogEditsList({ edits }: { edits: CatalogEditsExport }) {
  const { t, locale } = useLocale();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<Row | null>(null);
  // The row button that opened the dialog gets the focus back when it closes.
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const returnFocusTo = useRef<string | null>(null);
  const { songs, versions } = toRows(edits);

  const formatDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString(LOCALE_DATE_TAGS[locale], { year: 'numeric', month: 'short', day: 'numeric' })
      : '';
  const fieldLabel = (field: string) => (FIELD_LABELS[field] ? t(FIELD_LABELS[field]) : field);
  const keyLabel = (row: Row) => row.catalogKey ?? t('admin.catalogEdits.noCatalogKey');

  const askTakeOver = (row: Row) => {
    returnFocusTo.current = row.id;
    setConfirming(row);
  };

  const takeOver = (row: Row) => {
    setConfirming(null);
    setBusyId(row.id);
    startTransition(async () => {
      try {
        // edited_at goes back exactly as exported, so a newer correction is not cleared by mistake.
        const { ok, reason } = await clearCatalogEditAction(row.kind, row.id, row.editedAt);
        if (!ok) toast.error(t(FAILURE_MESSAGES[reason === 'changed' || reason === 'forbidden' ? reason : 'error']));
      } catch {
        toast.error(t(FAILURE_MESSAGES.error));
      } finally {
        setBusyId(null);
      }
    });
  };

  const section = (labelKey: TranslationKey, rows: Row[]) =>
    rows.length > 0 && (
      <section aria-labelledby={`catalog-edits-${labelKey}`} className="space-y-3">
        <h2 id={`catalog-edits-${labelKey}`} className="text-row font-semibold text-fg">
          {t(labelKey)} · {rows.length}
        </h2>
        <ul className="divide-y divide-line rounded-panel border border-line bg-surface">
          {rows.map((row) => (
            <li
              key={row.id}
              data-testid="catalog-edit-row"
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <p className="text-body font-medium text-fg break-words">
                  {row.title}
                  {row.subtitle ? <span className="text-fg-muted"> · {row.subtitle}</span> : null}
                </p>
                <p className="text-meta text-fg-muted break-all">
                  <span className="sr-only">{t('admin.catalogEdits.catalogKey')} </span>
                  {row.catalogKey ? <code>{row.catalogKey}</code> : t('admin.catalogEdits.noCatalogKey')}
                </p>
                <p className="text-meta text-fg-muted">
                  {t('admin.catalogEdits.changed', { fields: row.fields.map(fieldLabel).join(', ') })}
                  {row.editedAt ? ` · ${t('admin.catalogEdits.editedOn', { date: formatDate(row.editedAt) })}` : ''}
                </p>
              </div>
              <button
                type="button"
                ref={(node) => {
                  if (node) triggers.current.set(row.id, node);
                  else triggers.current.delete(row.id);
                }}
                onClick={() => askTakeOver(row)}
                disabled={pending && busyId === row.id}
                className="inline-flex min-h-tap shrink-0 items-center justify-center rounded-control border border-line-strong px-4 text-meta font-medium text-fg transition-colors hover:bg-surface-2 disabled:opacity-40"
              >
                {t('admin.catalogEdits.takenOver')}
              </button>
            </li>
          ))}
        </ul>
      </section>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-prose text-body text-fg-muted">{t('admin.catalogEdits.intro')}</p>
        {/* A plain link: the route answers with a JSON attachment (no client-side fetch needed). */}
        <a
          href="/admin/catalog-edits/export"
          download
          className="inline-flex min-h-tap shrink-0 items-center justify-center gap-2 rounded-control bg-accent px-4 text-meta font-semibold text-on-accent"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {t('admin.catalogEdits.download')}
        </a>
      </div>
      {songs.length === 0 && versions.length === 0 ? (
        <p className="rounded-panel border border-line bg-surface p-6 text-body text-fg-muted">
          {t('admin.catalogEdits.empty')}
        </p>
      ) : (
        <>
          {section('admin.catalogEdits.songs', songs)}
          {section('admin.catalogEdits.versions', versions)}
        </>
      )}
      <Dialog open={confirming !== null} onOpenChange={(open) => !open && setConfirming(null)}>
        <DialogContent
          className="max-w-md rounded-panel border border-line bg-surface p-6 text-fg shadow-sheet"
          onCloseAutoFocus={(event) => {
            const trigger = returnFocusTo.current ? triggers.current.get(returnFocusTo.current) : undefined;
            if (trigger) {
              event.preventDefault();
              trigger.focus();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-row font-semibold text-fg">{t('admin.catalogEdits.confirmTitle')}</DialogTitle>
            <DialogDescription className="text-body text-fg-muted">
              {confirming ? t('admin.catalogEdits.confirmBody', { key: keyLabel(confirming) }) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirming(null)}>
              {t('common.cancel')}
            </Button>
            <Button type="button" onClick={() => confirming && takeOver(confirming)}>
              {t('admin.catalogEdits.confirmAction')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
