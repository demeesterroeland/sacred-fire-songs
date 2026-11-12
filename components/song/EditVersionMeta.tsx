'use client';

import { useEffect, useState } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { useLocale } from '@/context/LocaleContext';
import type { SongFormData } from '@/components/song/SongForm';
import { formatSourceLines, type VersionSourceRow } from '@/lib/songs/versionSources';
import {
  BEATS_MAX_LENGTH,
  NOTE_MAX_LENGTH,
  SOURCE_PAGE_MAX_LENGTH,
  SOURCE_TITLE_MAX_LENGTH,
  beatsError,
  normalizeBeats,
  normalizeNote,
  noteError,
  sourceTextError,
  normalizeSourceText,
  type SourceInput,
} from '@/lib/songs/versionMeta';

interface EditVersionMetaProps {
  register: UseFormRegister<SongFormData>;
  errors: FieldErrors<SongFormData>;
  /** The values the form was prefilled with: a stored value the user did not touch is never refused. */
  initialBeats?: string | null;
  initialNote?: string | null;
  /** The page and original title of the primary source the form was prefilled with (same rule). */
  initialSource?: SourceInput;
  /** The sources of the version being edited (primary first in the list shown). */
  sources?: ReadonlyArray<VersionSourceRow> | null;
  songTitle: string;
  /** Admins may correct the page and original title of the primary source. */
  canCorrectSource: boolean;
  /** Whether a primary source row exists to correct. */
  hasPrimarySource: boolean;
  defaultOpen: boolean;
}

const FIELD =
  'w-full rounded-control border border-line-strong bg-surface px-3 py-2 text-body text-fg placeholder:text-fg-subtle';
const LABEL = 'block text-meta font-medium text-fg-muted';
const ERROR = 'text-danger text-meta';

/**
 * Story 6.2.20 / G5.3 (#523): beats, note and source of the version being edited (edit form only).
 * Beats and note are plain fields. The source is shown read-only for everyone; admins get a "Correct source" link
 * that opens the page and original title of the primary source (the songbook itself is shared by many songs and
 * is not edited here).
 */
export function EditVersionMeta({
  register,
  errors,
  initialBeats,
  initialNote,
  initialSource,
  sources,
  songTitle,
  canCorrectSource,
  hasPrimarySource,
  defaultOpen,
}: EditVersionMetaProps) {
  const { t, locale } = useLocale();
  const [correcting, setCorrecting] = useState(false);
  const lines = formatSourceLines(sources, songTitle, t, locale);
  // The panel stays closed until asked for, but a refused value must be visible and focusable.
  const pageInvalid = !!errors.sourcePage;
  const titleInvalid = !!errors.sourceOriginalTitle;
  const correctionOpen = correcting || pageInvalid || titleInvalid;
  useEffect(() => {
    // Runs after the panel is shown: react-hook-form tried to focus the field while it was still hidden.
    if (pageInvalid) document.getElementById('source-page')?.focus();
    else if (titleInvalid) document.getElementById('source-original-title')?.focus();
  }, [pageInvalid, titleInvalid]);

  // A stored value the user left alone is never refused (an importer may have written it in another form).
  const beatsValidate = (value: string | undefined) => {
    if (normalizeBeats(value) === normalizeBeats(initialBeats)) return true;
    const error = beatsError(value);
    if (error === 'tooLong') return t('songForm.field.beats.tooLong', { max: BEATS_MAX_LENGTH });
    return error === null ? true : t('songForm.field.beats.invalid');
  };
  const noteValidate = (value: string | undefined) =>
    normalizeNote(value) === normalizeNote(initialNote) || noteError(value) === null
      ? true
      : t('songForm.field.note.tooLong', { max: NOTE_MAX_LENGTH });
  const sourceValidate = (field: 'page' | 'originalTitle', max: number) => (value: string | undefined) => {
    const initial = field === 'page' ? initialSource?.sourcePage : initialSource?.sourceOriginalTitle;
    return normalizeSourceText(value) === normalizeSourceText(initial) || sourceTextError(field, value) === null
      ? true
      : t('songForm.source.tooLong', { max });
  };

  return (
    <details className="group" open={defaultOpen} data-testid="edit-version-meta">
      <summary className="w-full flex min-h-tap items-center justify-between cursor-pointer select-none list-none">
        <h3 className="text-fg-muted font-semibold text-meta">{t('songForm.section.songbook')}</h3>
        <span className="material-symbols-outlined text-fg-muted transition-transform group-open:rotate-180">expand_more</span>
      </summary>
      <div className="space-y-4 pb-3">
        <div className="space-y-1.5">
          <label htmlFor="beats" className={LABEL}>
            {t('songForm.field.beats')}
          </label>
          <input
            id="beats"
            inputMode="text"
            autoComplete="off"
            aria-describedby="beats-hint"
            aria-invalid={errors.beats ? true : undefined}
            {...register('beats', { validate: beatsValidate })}
            className={`${FIELD} min-h-tap sm:max-w-40`}
            placeholder="8"
          />
          <p id="beats-hint" className="text-caption text-fg-muted">
            {t('songForm.field.beats.hint')}
          </p>
          {errors.beats && (
            <p role="alert" className={ERROR}>
              {errors.beats.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="note" className={LABEL}>
            {t('songForm.field.note')}
          </label>
          <textarea
            id="note"
            rows={5}
            aria-describedby="note-hint"
            aria-invalid={errors.note ? true : undefined}
            {...register('note', { validate: noteValidate })}
            className={`${FIELD} min-h-tap`}
          />
          <p id="note-hint" className="text-caption text-fg-muted">
            {t('songForm.field.note.hint')}
          </p>
          {errors.note && (
            <p role="alert" className={ERROR}>
              {errors.note.message}
            </p>
          )}
        </div>

        {lines.length > 0 && (
          <div className="space-y-1.5">
            <p className={LABEL}>{t('songForm.section.source')}</p>
            <ul data-testid="edit-source-line" className="space-y-1 text-meta text-fg">
              {lines.map((line) => (
                <li key={line.id}>{line.text}</li>
              ))}
            </ul>
            <p className="text-caption text-fg-muted">{t('songForm.source.hint')}</p>
            {canCorrectSource && hasPrimarySource && (
              <>
                <button
                  type="button"
                  aria-expanded={correctionOpen}
                  aria-controls="source-correction"
                  onClick={() => setCorrecting(!correctionOpen)}
                  className="inline-flex min-h-tap items-center text-meta font-semibold text-fg underline underline-offset-2"
                >
                  {t('songForm.source.correct')}
                </button>
                <div id="source-correction" hidden={!correctionOpen} className="space-y-3">
                  <p className="text-caption text-fg-muted">{t('songForm.source.correctHint')}</p>
                  <div className="space-y-1.5">
                    <label htmlFor="source-page" className={LABEL}>
                      {t('songForm.source.page')}
                    </label>
                    <input
                      id="source-page"
                      autoComplete="off"
                      {...register('sourcePage', { validate: sourceValidate('page', SOURCE_PAGE_MAX_LENGTH) })}
                      className={`${FIELD} min-h-tap sm:max-w-40`}
                    />
                    {errors.sourcePage && (
                      <p role="alert" className={ERROR}>
                        {errors.sourcePage.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="source-original-title" className={LABEL}>
                      {t('songForm.source.originalTitle')}
                    </label>
                    <input
                      id="source-original-title"
                      autoComplete="off"
                      {...register('sourceOriginalTitle', {
                        validate: sourceValidate('originalTitle', SOURCE_TITLE_MAX_LENGTH),
                      })}
                      className={`${FIELD} min-h-tap`}
                    />
                    {errors.sourceOriginalTitle && (
                      <p role="alert" className={ERROR}>
                        {errors.sourceOriginalTitle.message}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </details>
  );
}
