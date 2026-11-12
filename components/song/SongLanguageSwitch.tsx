'use client';

import { Segmented } from '@/components/ui/segmented';
import { useLocale } from '@/context/LocaleContext';
import { languageOptions, ORIGINAL_LANGUAGE, type SongTranslation } from '@/lib/songs/translations';

interface SongLanguageSwitchProps {
  translations: ReadonlyArray<SongTranslation> | null | undefined;
  /** Tag of the language being read, or `null` for the original language. */
  selected: string | null;
  /** Called with the tag, or `null` for "Original". */
  onSelect: (language: string | null) => void;
  className?: string;
}

/**
 * Story 6.2.13 (#516): the language switch (Original · Dutch · English) in the slot next to the version switch.
 * It lists the languages the song has in `song_translations` and renders nothing, so no space either, when there
 * are none. Same control as the version switch (`Segmented`), so it behaves and looks alike.
 */
export function SongLanguageSwitch({ translations, selected, onSelect, className }: SongLanguageSwitchProps) {
  const { t, locale } = useLocale();
  const options = languageOptions(translations, t, locale);
  if (!options) return null;
  return (
    <div data-testid="song-language-switch" className={className}>
      <Segmented
        aria-label={t('song.language.label')}
        options={options}
        value={selected && options.some((o) => o.value === selected) ? selected : ORIGINAL_LANGUAGE}
        onChange={(value) => onSelect(value === ORIGINAL_LANGUAGE ? null : value)}
      />
    </div>
  );
}
