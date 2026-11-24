'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Segmented } from '@/components/ui/segmented';
import { useLocale } from '@/context/LocaleContext';
import { LOCALE_DATE_TAGS } from '@/lib/i18n';
import { withdrawSuggestion, reopenSuggestion } from '@/app/actions/linkSuggestion';
import { openSuggestionCountKey } from '@/lib/suggestions/queries';
import { SONG_KEYS } from '@/lib/songs/queryKeys';
import {
  SUGGESTION_ERROR_KEYS,
  SUGGESTION_STATUS_KEYS,
  canDecideSuggestion,
  canReopenSuggestion,
  canWithdrawSuggestion,
  rowsForSegment,
  suggestionHints,
  suggestionSegments,
  type LinkSuggestion,
  type SuggestionSegment,
} from '@/lib/songs/linkSuggestion';
import { ReviewSuggestionSheet } from './ReviewSuggestionSheet';

interface SuggestionsViewProps {
  rows: LinkSuggestion[];
  user: { id: string; role: string };
}

/**
 * Story 6.2.26 / G1.5 (#598): `/suggestions`. Gatekeepers and admins get "To review", "Reviewed" and "Mine"; everyone
 * else gets their own list with Withdraw on open suggestions. Status is always a word, never colour alone.
 */
export function SuggestionsView({ rows, user }: SuggestionsViewProps) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const segments = suggestionSegments(user.role);
  const reviewer = segments.length > 1;
  const [segment, setSegment] = useState<SuggestionSegment>(segments[0]);
  const [reviewing, setReviewing] = useState<LinkSuggestion | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const formatDate = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(LOCALE_DATE_TAGS[locale], { dateStyle: 'medium' });
    return (iso: string) => formatter.format(new Date(iso));
  }, [locale]);

  const reviewCount = rowsForSegment('review', rows, user.id).length;
  const visible = rowsForSegment(segment, rows, user.id);

  const changed = () => {
    void queryClient.invalidateQueries({ queryKey: openSuggestionCountKey(user.id) });
    router.refresh();
  };

  const act = async (row: LinkSuggestion, run: () => ReturnType<typeof withdrawSuggestion>, done: string) => {
    if (busyId) return;
    setBusyId(row.id);
    try {
      const result = await run();
      if (result.ok) {
        toast.success(done);
        changed();
      } else {
        toast.error(t(SUGGESTION_ERROR_KEYS[result.error]));
      }
    } catch {
      toast.error(t(SUGGESTION_ERROR_KEYS.failed));
    } finally {
      setBusyId(null);
    }
  };

  const options = segments.map((value) => ({
    value,
    label: value === 'review' ? t('suggest.segment.review', { count: reviewCount }) : t(`suggest.segment.${value}` as const),
  }));

  const empty =
    segment === 'review' ? 'suggest.empty.review' : segment === 'reviewed' ? 'suggest.empty.reviewed' : 'suggest.empty.mine';

  return (
    <div data-testid="suggestions-page">
      <h1 className="mb-3 text-body font-semibold text-fg">
        {reviewer ? t('suggest.page.titleReviewer') : t('suggest.page.titleMember')}
      </h1>
      {reviewer && (
        <Segmented
          aria-label={t('suggest.segment.label')}
          options={options}
          value={segment}
          onChange={(value) => setSegment(value as SuggestionSegment)}
          className="mb-3"
        />
      )}

      {visible.length === 0 ? (
        <div className="py-8 text-center" data-testid="suggestions-empty">
          <p className="text-row text-fg">{t(empty)}</p>
          {segment === 'review' && <p className="mt-1 text-meta text-fg-muted">{t('suggest.empty.reviewHint')}</p>}
        </div>
      ) : (
        <ul className="-mx-4 divide-y divide-line border-y border-line" data-testid="suggestions-list">
          {visible.map((row) => {
            const hints = suggestionHints(row, rows);
            const open = reviewer && segment === 'review' && canDecideSuggestion(user, row);
            const body = (
              <>
                <span className="block text-row font-medium text-fg [overflow-wrap:anywhere]" data-testid="suggestion-pair">
                  {t('suggest.pair', { source: row.source_title, target: row.target_title })}
                </span>
                <span className="block text-meta text-fg-muted">{rowMeta(row, t, formatDate)}</span>
                {row.note && (
                  <span className="mt-1 block border-s-2 border-line ps-2 text-meta text-fg-muted whitespace-pre-line [overflow-wrap:anywhere]">
                    {row.note}
                  </span>
                )}
                {row.status === 'declined' && row.decision_note && (
                  <span className="mt-1 block border-s-2 border-line ps-2 text-meta text-fg-muted whitespace-pre-line [overflow-wrap:anywhere]">
                    {row.decision_note}
                  </span>
                )}
                {row.status === 'superseded' && <span className="mt-1 block text-meta text-fg-muted">{t('suggest.hint.closedOther')}</span>}
                {hints.declinedBefore && row.status === 'open' && (
                  <span className="mt-1 mr-1 inline-block rounded-control bg-surface-2 px-1.5 py-0.5 text-caption text-fg-muted">
                    {t('suggest.hint.declinedBefore', { date: formatDate(hints.declinedBefore) })}
                  </span>
                )}
                {hints.alsoSuggested.length > 0 && (
                  <span className="mt-1 inline-block rounded-control bg-surface-2 px-1.5 py-0.5 text-caption text-fg-muted">
                    {t('suggest.hint.alsoSuggested', { titles: hints.alsoSuggested.join(', ') })}
                  </span>
                )}
              </>
            );
            return (
              <li key={row.id} className="flex items-start gap-3 px-4 py-3" data-testid="suggestion-row" data-status={row.status}>
                {open ? (
                  <button
                    type="button"
                    onClick={() => setReviewing(row)}
                    aria-label={t('suggest.row.review', { source: row.source_title, target: row.target_title })}
                    className="flex min-h-tap min-w-0 flex-1 items-start gap-3 text-start"
                  >
                    <span className="min-w-0 flex-1">{body}</span>
                    <ChevronRight className="mt-1 size-5 shrink-0 text-fg-subtle" aria-hidden />
                  </button>
                ) : (
                  <div className="min-w-0 flex-1">{body}</div>
                )}
                {!open && (
                  <div className="flex shrink-0 flex-col items-end">
                    <span className="text-caption font-semibold text-fg-muted">{t(SUGGESTION_STATUS_KEYS[row.status])}</span>
                    {canWithdrawSuggestion(user, row) && (
                      <button
                        type="button"
                        disabled={busyId === row.id}
                        onClick={() => void act(row, () => withdrawSuggestion(row.id), t('suggest.withdrawn'))}
                        className="inline-flex min-h-tap items-center text-meta text-fg underline underline-offset-4"
                      >
                        {t('suggest.withdraw')}
                      </button>
                    )}
                    {canReopenSuggestion(user, row) && (
                      <button
                        type="button"
                        disabled={busyId === row.id}
                        onClick={() => void act(row, () => reopenSuggestion(row.id), t('suggest.reopened'))}
                        className="inline-flex min-h-tap items-center text-meta text-fg underline underline-offset-4"
                      >
                        {t('suggest.reopen')}
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ReviewSuggestionSheet
        suggestion={reviewing}
        onClose={() => setReviewing(null)}
        formatDate={formatDate}
        onDecided={(result) => {
          setReviewing(null);
          if (result.kind === 'linked') {
            toast.success(t('suggest.review.linked', { source: result.summary.source_title, target: result.summary.target_title }));
            void queryClient.invalidateQueries({ queryKey: SONG_KEYS.all() });
          } else {
            toast.success(t('suggest.review.declinedToast'));
          }
          changed();
        }}
      />
    </div>
  );
}

function rowMeta(row: LinkSuggestion, t: ReturnType<typeof useLocale>['t'], formatDate: (iso: string) => string): string {
  const unnamed = t('user.unnamed');
  const decided = row.reviewed_at ? formatDate(row.reviewed_at) : formatDate(row.created_at);
  if (row.status === 'accepted') return t('suggest.row.linkedBy', { name: row.reviewer_name || unnamed, date: decided });
  if (row.status === 'declined') return t('suggest.row.declinedBy', { name: row.reviewer_name || unnamed, date: decided });
  if (row.status === 'superseded') return t('suggest.row.by', { name: row.suggester_name || unnamed, date: formatDate(row.created_at) });
  return t('suggest.row.by', { name: row.suggester_name || unnamed, date: formatDate(row.created_at) });
}
