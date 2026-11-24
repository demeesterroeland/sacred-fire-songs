'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronLeft, Link2 } from 'lucide-react';
import { BottomSheet, BottomSheetContent } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/context/LocaleContext';
import { acceptSuggestion, declineSuggestion, previewSuggestion } from '@/app/actions/linkSuggestion';
import { linkPreviewLines, type SongLinkSummary } from '@/lib/songs/linkSong';
import {
  SUGGESTION_ERROR_KEYS,
  SUGGESTION_NOTE_MAX,
  type LinkSuggestion,
  type SuggestionError,
} from '@/lib/songs/linkSuggestion';

interface ReviewSuggestionSheetProps {
  suggestion: LinkSuggestion | null;
  onClose: () => void;
  /** Called after the suggestion was linked or declined. */
  onDecided: (result: { kind: 'linked'; summary: SongLinkSummary } | { kind: 'declined' }) => void;
  /** "Mar 9, 2026": the person's locale. */
  formatDate: (iso: string) => string;
}

/**
 * Story 6.2.26 / G1.5 (#598): a gatekeeper or admin looks at one suggestion. The sheet shows what a link would move
 * (the same summary as the direct link), two links to compare the songs, and offers Link (no undo, with the choice
 * of which song stays) or Decline (with an optional reason).
 */
export function ReviewSuggestionSheet({ suggestion, onClose, onDecided, formatDate }: ReviewSuggestionSheetProps) {
  const { t } = useLocale();
  return (
    <BottomSheet open={!!suggestion} onOpenChange={(open) => !open && onClose()}>
      <BottomSheetContent title={t('suggest.review.title')} data-testid="review-suggestion-sheet">
        {/* The body unmounts with the closed sheet, so the next suggestion starts fresh. */}
        {suggestion && <ReviewBody key={suggestion.id} suggestion={suggestion} onClose={onClose} onDecided={onDecided} formatDate={formatDate} />}
      </BottomSheetContent>
    </BottomSheet>
  );
}

type Preview = { summary: SongLinkSummary } | { error: SuggestionError };

function ReviewBody({
  suggestion,
  onClose,
  onDecided,
  formatDate,
}: Omit<ReviewSuggestionSheetProps, 'suggestion'> & { suggestion: LinkSuggestion }) {
  const { t } = useLocale();
  const reasonId = useId();
  const [swap, setSwap] = useState(false);
  const [step, setStep] = useState<'review' | 'decline'>('review');
  const [preview, setPreview] = useState<{ swap: boolean; result: Preview } | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState<'link' | 'decline' | null>(null);
  const [error, setError] = useState<SuggestionError | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    let current = true;
    void previewSuggestion(suggestion.id, swap)
      .then((r) => ('ok' in r && r.ok ? { summary: r.summary } : { error: 'error' in r ? r.error : ('failed' as const) }))
      .catch(() => ({ error: 'failed' as const }))
      .then((result) => current && setPreview({ swap, result }));
    return () => {
      current = false;
    };
  }, [suggestion.id, swap]);

  const answer = preview?.swap === swap ? preview.result : null;
  const summary = answer && 'summary' in answer ? answer.summary : null;
  const lines = summary ? linkPreviewLines(summary) : [];
  const suggester = suggestion.suggester_name || t('user.unnamed');
  // The song that goes and the song that stays, as the reviewer chose.
  const goes = swap ? suggestion.target_title : suggestion.source_title;
  const stays = swap ? suggestion.source_title : suggestion.target_title;

  const run = async (kind: 'link' | 'decline') => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(kind);
    setError(null);
    try {
      if (kind === 'link') {
        const result = await acceptSuggestion(suggestion.id, swap);
        if (result.ok) return onDecided({ kind: 'linked', summary: result.summary });
        setError(result.error);
      } else {
        const result = await declineSuggestion(suggestion.id, reason);
        if (result.ok) return onDecided({ kind: 'declined' });
        setError(result.error);
      }
    } catch {
      setError('failed');
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  };

  if (step === 'decline') {
    return (
      <div className="flex flex-col gap-3 px-4 pb-4">
        <div>
          <label htmlFor={reasonId} className="block pb-1 text-meta font-medium text-fg">
            {t('suggest.decline.reasonLabel', { name: suggester })}
          </label>
          <textarea
            id={reasonId}
            value={reason}
            maxLength={SUGGESTION_NOTE_MAX}
            rows={3}
            placeholder={t('suggest.decline.placeholder')}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-24 w-full rounded-control border border-line-strong bg-surface px-3 py-2 text-body text-fg placeholder:text-fg-muted"
          />
          <p className="text-right text-caption text-fg-subtle">
            {t('suggest.confirm.counter', { count: reason.length, max: SUGGESTION_NOTE_MAX })}
          </p>
        </div>
        <p className="text-meta text-fg-muted">{t('suggest.decline.hint')}</p>
        {error && (
          <p role="alert" className="text-meta text-danger">
            {t(SUGGESTION_ERROR_KEYS[error])}
          </p>
        )}
        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => setStep('review')} disabled={busy !== null}>
            <ChevronLeft aria-hidden />
            {t('suggest.confirm.back')}
          </Button>
          <Button type="button" onClick={() => void run('decline')} disabled={busy !== null} data-testid="suggest-decline-confirm">
            {t('suggest.decline.confirm')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 pb-4">
      <div>
        <p className="text-body text-fg">
          <strong className="font-semibold">{suggestion.source_title}</strong> → <strong className="font-semibold">{suggestion.target_title}</strong>
        </p>
        <p className="text-meta text-fg-muted">
          {t('suggest.review.by', { name: suggester, date: formatDate(suggestion.created_at) })}
        </p>
        {suggestion.note && (
          <blockquote className="mt-1 border-s-2 border-line ps-2 text-meta text-fg-muted whitespace-pre-line break-words">
            {suggestion.note}
          </blockquote>
        )}
        <p className="mt-1 flex flex-wrap gap-x-4">
          {suggestion.source_id && (
            <a
              href={`/songs/${suggestion.source_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-tap items-center text-meta text-fg underline underline-offset-4"
            >
              {t('suggest.review.openSong', { title: suggestion.source_title })}
            </a>
          )}
          {suggestion.target_id && (
            <a
              href={`/songs/${suggestion.target_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-tap items-center text-meta text-fg underline underline-offset-4"
            >
              {t('suggest.review.openSong', { title: suggestion.target_title })}
            </a>
          )}
        </p>
      </div>

      <h3 className="text-meta font-semibold text-fg">{t('suggest.review.moves')}</h3>
      {!answer && (
        <p className="text-meta text-fg-muted" aria-live="polite">
          {t('suggest.review.loading')}
        </p>
      )}
      {summary && lines.length > 0 && (
        <ul className="list-disc space-y-1 ps-5 text-meta text-fg" data-testid="review-preview">
          {lines.map((line) => (
            <li key={line.key}>{t(line.key, line.params)}</li>
          ))}
        </ul>
      )}
      {summary && lines.length === 0 && <p className="text-meta text-fg-muted">{t('suggest.review.nothing')}</p>}
      {answer && 'error' in answer && (
        <p role="alert" className="text-meta text-danger">
          {t(SUGGESTION_ERROR_KEYS[answer.error])}
        </p>
      )}

      <label className="flex min-h-tap items-center gap-3 text-meta text-fg">
        <input type="checkbox" checked={swap} onChange={(e) => setSwap(e.target.checked)} className="size-5" data-testid="review-swap" />
        <span>{t('suggest.review.keep', { source: suggestion.source_title })}</span>
      </label>

      <p className="rounded-control bg-surface-2 px-3 py-2 text-meta text-fg" role="note">
        {t('suggest.review.irreversible', { source: goes, target: stays })}
      </p>
      {error && (
        <p role="alert" className="text-meta text-danger">
          {t(SUGGESTION_ERROR_KEYS[error])}
        </p>
      )}
      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onClose} disabled={busy !== null}>
          {t('suggest.review.close')}
        </Button>
        <Button type="button" variant="outline" onClick={() => setStep('decline')} disabled={busy !== null} data-testid="suggest-decline">
          {t('suggest.review.decline')}
        </Button>
        <Button
          type="button"
          onClick={() => void run('link')}
          disabled={busy !== null || !summary}
          aria-busy={busy === 'link' || undefined}
          data-testid="suggest-link"
        >
          <Link2 aria-hidden />
          {busy === 'link' ? t('suggest.review.linking') : t('suggest.review.link')}
        </Button>
      </div>
    </div>
  );
}
