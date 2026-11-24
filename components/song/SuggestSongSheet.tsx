'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronLeft, Link2 } from 'lucide-react';
import { BottomSheet, BottomSheetContent } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/context/LocaleContext';
import { searchSongsToSuggest, suggestSongLink, type SuggestCandidate } from '@/app/actions/linkSuggestion';
import { SUGGESTION_ERROR_KEYS, SUGGESTION_NOTE_MAX, type SuggestionError } from '@/lib/songs/linkSuggestion';

const SEARCH_DELAY_MS = 250;
const MIN_QUERY = 2;

interface SuggestSongSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The song being suggested as a version (the duplicate). */
  sourceId: string;
  sourceTitle: string;
  /** Called after the suggestion was saved. */
  onSent: () => void;
}

type Step = { kind: 'pick' } | { kind: 'confirm'; target: SuggestCandidate; error?: SuggestionError; sending?: boolean };

/**
 * Story 6.2.26 / G1.5 (#598): a member suggests that a song is a version of another song. Step 1 searches public
 * songs and shows enough to tell look-alike titles apart (author, versions, "Open song" in a new tab); step 2 takes an
 * optional note and says plainly that nothing changes until a gatekeeper or admin decides.
 */
export function SuggestSongSheet({ open, onOpenChange, sourceId, sourceTitle, onSent }: SuggestSongSheetProps) {
  const { t } = useLocale();
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent title={t('suggest.sheet.title')} data-testid="suggest-song-sheet">
        {/* The body unmounts with the closed sheet, so the next open starts over at the search. */}
        <SuggestBody sourceId={sourceId} sourceTitle={sourceTitle} onSent={onSent} />
      </BottomSheetContent>
    </BottomSheet>
  );
}

function SuggestBody({ sourceId, sourceTitle, onSent }: Omit<SuggestSongSheetProps, 'open' | 'onOpenChange'>) {
  const { t } = useLocale();
  const searchId = useId();
  const [step, setStep] = useState<Step>({ kind: 'pick' });
  const [query, setQuery] = useState('');
  const [note, setNote] = useState('');
  const sendingRef = useRef(false);
  const [found, setFound] = useState<{ text: string; songs: SuggestCandidate[]; error: SuggestionError | null } | null>(null);

  const text = query.trim();
  const searchable = text.length >= MIN_QUERY;
  const answer = searchable && found?.text === text ? found : null;
  const searching = searchable && !answer;
  const results = answer?.songs ?? [];

  useEffect(() => {
    if (step.kind !== 'pick' || !searchable) return;
    let current = true;
    const timer = setTimeout(async () => {
      const result = await searchSongsToSuggest(text, sourceId);
      if (!current) return;
      setFound('error' in result ? { text, songs: [], error: result.error } : { text, songs: result.songs, error: null });
    }, SEARCH_DELAY_MS);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [step.kind, searchable, text, sourceId]);

  const send = async () => {
    if (step.kind !== 'confirm' || sendingRef.current) return;
    sendingRef.current = true;
    const target = step.target;
    setStep({ ...step, sending: true, error: undefined });
    try {
      const result = await suggestSongLink(sourceId, target.id, note);
      if (result.ok) {
        onSent();
        return;
      }
      setStep((s) => (s.kind === 'confirm' ? { ...s, sending: false, error: result.error } : s));
    } catch {
      setStep((s) => (s.kind === 'confirm' ? { ...s, sending: false, error: 'failed' } : s));
    } finally {
      sendingRef.current = false;
    }
  };

  if (step.kind === 'confirm') {
    const { target, error, sending } = step;
    const counterId = `${searchId}-counter`;
    return (
      <div className="flex flex-col gap-3 px-4 pb-4">
        <p className="text-body font-medium text-fg">{t('suggest.confirm.title', { source: sourceTitle, target: target.title })}</p>
        <div>
          <label htmlFor={`${searchId}-note`} className="block pb-1 text-meta font-medium text-fg">
            {t('suggest.confirm.noteLabel')}
          </label>
          <textarea
            id={`${searchId}-note`}
            value={note}
            maxLength={SUGGESTION_NOTE_MAX}
            rows={3}
            aria-describedby={counterId}
            placeholder={t('suggest.confirm.notePlaceholder')}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-24 w-full rounded-control border border-line-strong bg-surface px-3 py-2 text-body text-fg placeholder:text-fg-muted"
          />
          <p id={counterId} className="text-right text-caption text-fg-subtle">
            {t('suggest.confirm.counter', { count: note.length, max: SUGGESTION_NOTE_MAX })}
          </p>
        </div>
        <p className="text-meta text-fg-muted">{t('suggest.confirm.explain')}</p>
        {error && (
          <p role="alert" className="text-meta text-danger">
            {t(SUGGESTION_ERROR_KEYS[error])}
          </p>
        )}
        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => setStep({ kind: 'pick' })} disabled={sending}>
            <ChevronLeft aria-hidden />
            {t('suggest.confirm.back')}
          </Button>
          <Button type="button" onClick={() => void send()} disabled={sending} aria-busy={sending || undefined} data-testid="suggest-send">
            <Link2 aria-hidden />
            {sending ? t('suggest.confirm.sending') : t('suggest.confirm.send')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-4 pb-4">
      <label htmlFor={searchId} className="text-meta font-medium text-fg">
        {t('suggest.sheet.intro', { title: sourceTitle })}
      </label>
      <input
        id={searchId}
        type="search"
        value={query}
        autoComplete="off"
        placeholder={t('suggest.sheet.searchPlaceholder')}
        aria-label={t('suggest.sheet.searchLabel')}
        onChange={(e) => setQuery(e.target.value)}
        className="min-h-tap w-full rounded-control border border-line-strong bg-surface px-3 text-body text-fg placeholder:text-fg-muted"
      />
      <p className="text-meta text-fg-muted" aria-live="polite">
        {!searchable
          ? t('suggest.sheet.searchHint')
          : searching
            ? t('suggest.sheet.searching')
            : answer?.error
              ? t(SUGGESTION_ERROR_KEYS[answer.error])
              : results.length === 0
                ? t('suggest.sheet.noResults')
                : null}
      </p>
      {results.length > 0 && (
        <ul className="-mx-4 divide-y divide-line" data-testid="suggest-results">
          {results.map((song) => (
            <li key={song.id} className="flex items-center">
              <button
                type="button"
                disabled={song.alreadySuggested}
                onClick={() => setStep({ kind: 'confirm', target: song })}
                aria-label={t('suggest.sheet.pick', { title: song.title })}
                className="flex min-h-tap min-w-0 flex-1 flex-col justify-center px-4 py-2 text-left transition-colors hover:bg-surface-2 disabled:opacity-60"
              >
                <span className="text-body text-fg">{song.title}</span>
                <span className="text-meta text-fg-muted">
                  {song.alreadySuggested
                    ? t('suggest.sheet.suggested')
                    : t('suggest.sheet.meta', {
                        author: song.original_author || t('song.noArtist'),
                        versions: t(song.versionCount === 1 ? 'song.link.preview.versions.one' : 'song.link.preview.versions.other', {
                          count: song.versionCount,
                        }),
                      })}
                </span>
              </button>
              <a
                href={`/songs/${song.id}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('suggest.sheet.openSongLabel', { title: song.title })}
                className="inline-flex min-h-tap items-center px-4 text-meta text-fg underline underline-offset-4"
              >
                {t('suggest.sheet.openSong')}
              </a>
            </li>
          ))}
        </ul>
      )}
      <p className="text-meta text-fg-muted">{t('suggest.sheet.hint')}</p>
    </div>
  );
}
