'use client';

import { Segmented } from '@/components/ui/segmented';
import { useLocale } from '@/context/LocaleContext';
import { readingViewOptions, type ReadingView } from '@/lib/songs/translations';

interface SongReadingViewSwitchProps {
  /** Shown for a song with a translation (`readingState().viewSwitchVisible`); nothing (and no space) otherwise. */
  visible: boolean;
  value: ReadingView;
  onChange: (view: ReadingView) => void;
  className?: string;
}

/**
 * Story 6.2.14 (#517): Original · Translation · Both, next to the version switch. "Translation" and "Both" use the
 * language of the language switch (its first one by default). With "Both" the reader shows each stanza of the original
 * with its translation: side by side from md up, line under line on a phone. Same control as the version and language
 * switches (`Segmented`).
 */
export function SongReadingViewSwitch({ visible, value, onChange, className }: SongReadingViewSwitchProps) {
  const { t } = useLocale();
  if (!visible) return null;
  return (
    <div data-testid="song-reading-view-switch" className={className}>
      <Segmented
        aria-label={t('song.translation.view.label')}
        options={readingViewOptions(t)}
        value={value}
        onChange={(v) => onChange(v as ReadingView)}
      />
    </div>
  );
}
