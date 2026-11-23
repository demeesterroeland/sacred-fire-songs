'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronLeft, Link2 } from 'lucide-react';
import { BottomSheet, BottomSheetContent } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/context/LocaleContext';
import { linkSongAsVersion, previewSongLink, searchSongsToLinkTo, type SongLinkCandidate } from '@/app/actions/linkSong';
import { SONG_LINK_ERROR_KEYS, linkPreviewLines, type SongLinkError, type SongLinkSummary } from '@/lib/songs/linkSong';

const SEARCH_DELAY_MS = 250;
const MIN_QUERY = 2;

interface LinkSongSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The song being linked away (the duplicate). */
  sourceId: string;
  sourceTitle: string;
  /** Called after the link: the page moves to the target song. */
  onLinked: (summary: SongLinkSummary) => void;
}

type Step =
  | { kind: 'pick' }
  | { kind: 'preview'; target: SongLinkCandidate; summary?: SongLinkSummary; error?: SongLinkError; linking?: boolean };

/**
 * Story 6.2.9 / G1.4 (#512): admins, and gatekeepers on their own songs, link a duplicate song as a version of
 * another song.
 * Step 1 searches and picks the song it is a version of; step 2 shows what moves (fn_preview_song_link) and asks
 * for a clear confirm. There is no undo: the merge deletes the duplicate, so the confirm step says so.
 */
export function LinkSongSheet({ open, onOpenChange, sourceId, sourceTitle, onLinked }: LinkSongSheetProps) {
  const { t } = useLocale();
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent title={t('song.link.title')} data-testid="link-song-sheet">
        {/* The body unmounts with the closed sheet, so the next open starts over at the search. */}
        <LinkSongBody sourceId={sourceId} sourceTitle={sourceTitle} onLinked={onLinked} onCancel={() => onOpenChange(false)} />
      </BottomSheetContent>
    </BottomSheet>
  );
}

function LinkSongBody({
  sourceId,
  sourceTitle,
  onLinked,
  onCancel,
}: Omit<LinkSongSheetProps, 'open' | 'onOpenChange'> & { onCancel: () => void }) {
  const { t } = useLocale();
  const searchId = useId();
  const [step, setStep] = useState<Step>({ kind: 'pick' });
  // A second click on Confirm can land before React re-renders the button as disabled: link once.
  const linkingRef = useRef(false);
  const [query, setQuery] = useState('');
  // The answer for one search text: results show only while they belong to the text in the field.
  const [found, setFound] = useState<{ text: string; songs: SongLinkCandidate[]; error: SongLinkError | null } | null>(null);

  const text = query.trim();
  const searchable = text.length >= MIN_QUERY;
  const answer = searchable && found?.text === text ? found : null;
  const searching = searchable && !answer;
  const results = answer?.songs ?? [];

  useEffect(() => {
    if (step.kind !== 'pick' || !searchable) return;
    let current = true;
    const timer = setTimeout(async () => {
      const result = await searchSongsToLinkTo(text, sourceId);
      if (!current) return;
      setFound('error' in result ? { text, songs: [], error: result.error } : { text, songs: result.songs, error: null });
    }, SEARCH_DELAY_MS);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [step.kind, searchable, text, sourceId]);

  const pick = async (target: SongLinkCandidate) => {
    setStep({ kind: 'preview', target });
    const result = await previewSongLink(sourceId, target.id);
    setStep((s) => (s.kind === 'preview' && s.target.id === target.id ? { ...s, ...result } : s));
  };

  const confirm = async () => {
    if (step.kind !== 'preview' || !step.summary || linkingRef.current) return;
    linkingRef.current = true;
    const target = step.target;
    setStep({ ...step, linking: true, error: undefined });
    try {
      const result = await linkSongAsVersion(sourceId, target.id);
      if ('summary' in result) {
        onLinked(result.summary);
        return;
      }
      setStep((s) => (s.kind === 'preview' ? { ...s, linking: false, error: result.error } : s));
    } catch {
      setStep((s) => (s.kind === 'preview' ? { ...s, linking: false, error: 'failed' } : s));
    } finally {
      linkingRef.current = false;
    }
  };

  if (step.kind === 'preview') {
    return (
      <LinkPreview
        step={step}
        sourceTitle={sourceTitle}
        onBack={() => setStep({ kind: 'pick' })}
        onConfirm={() => void confirm()}
        onCancel={onCancel}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 px-4 pb-4">
      <p className="text-meta text-fg-muted">{t('song.link.intro', { title: sourceTitle })}</p>
      <label htmlFor={searchId} className="pt-1 text-meta font-medium text-fg">
        {t('song.link.searchLabel')}
      </label>
      <input
        id={searchId}
        type="search"
        value={query}
        autoComplete="off"
        placeholder={t('song.link.searchPlaceholder')}
        onChange={(e) => setQuery(e.target.value)}
        className="min-h-tap w-full rounded-control border border-line-strong bg-surface px-3 text-body text-fg placeholder:text-fg-muted"
      />
      <p className="text-meta text-fg-muted" aria-live="polite">
        {!searchable
          ? t('song.link.searchHint')
          : searching
            ? t('song.link.searching')
            : answer?.error
              ? t(SONG_LINK_ERROR_KEYS[answer.error])
              : results.length === 0
                ? t('song.link.noResults')
                : null}
      </p>
      {results.length > 0 && (
        <ul className="-mx-4 divide-y divide-line">
          {results.map((song) => (
            <li key={song.id}>
              <button
                type="button"
                onClick={() => void pick(song)}
                aria-label={t('song.link.pick', { title: song.title })}
                className="flex min-h-tap w-full flex-col justify-center px-4 py-2 text-left transition-colors hover:bg-surface-2"
              >
                <span className="text-body text-fg">{song.title}</span>
                {song.original_author && <span className="text-meta text-fg-muted">{song.original_author}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LinkPreview({
  step,
  sourceTitle,
  onBack,
  onConfirm,
  onCancel,
}: {
  step: Extract<Step, { kind: 'preview' }>;
  sourceTitle: string;
  onBack: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useLocale();
  const { summary, error, linking, target } = step;
  const targetTitle = summary?.target_title || target.title;
  const lines = summary ? linkPreviewLines(summary) : [];

  return (
    <div className="flex flex-col gap-3 px-4 pb-4">
      <p className="text-body font-medium text-fg">
        {t('song.link.previewTitle', { source: sourceTitle, target: targetTitle })}
      </p>
      {!summary && !error && <p className="text-meta text-fg-muted" aria-live="polite">{t('song.link.previewLoading')}</p>}
      {summary && (
        <>
          <p className="text-meta text-fg-muted">
            {lines.length ? t('song.link.previewIntro', { target: targetTitle }) : t('song.link.previewNothing')}
          </p>
          {lines.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-body text-fg" data-testid="link-song-preview">
              {lines.map((line) => (
                <li key={line.key}>{t(line.key, line.params)}</li>
              ))}
            </ul>
          )}
          <p className="text-meta text-fg-muted">
            {t('song.link.irreversible', { source: sourceTitle, target: targetTitle })}
          </p>
        </>
      )}
      {error && (
        <p role="alert" className="text-meta text-danger">
          {t(SONG_LINK_ERROR_KEYS[error])}
        </p>
      )}
      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onBack} disabled={linking}>
          <ChevronLeft aria-hidden />
          {t('song.link.back')}
        </Button>
        {summary && (
          <>
            <Button type="button" variant="outline" onClick={onCancel} disabled={linking}>
              {t('song.link.cancel')}
            </Button>
            <Button type="button" onClick={onConfirm} disabled={linking} aria-busy={linking || undefined}>
              <Link2 aria-hidden />
              {linking ? t('song.link.linking') : t('song.link.confirm')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
