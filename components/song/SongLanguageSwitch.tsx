'use client';

import { Segmented } from '@/components/ui/segmented';
import { useLocale } from '@/context/LocaleContext';
import { languageOptions, type SongTranslation } from '@/lib/songs/translations';

interface SongLanguageSwitchProps {
  /** Only while a translation is read (Translation or Both; `readingState().languageSwitchVisible`). */
  visible: boolean;
  translations: ReadonlyArray<SongTranslation> | null | undefined;
  /** Tag of the translation being read. */
  selected: string | null;
  /** Called with the tag of the tapped language. */
  onSelect: (language: string) => void;
  className?: string;
}

/**
 * Story 6.2.13 (#516), 6.2.14 (#517): the language of the translation (Dutch · English), next to the view switch
 * Original · Translation · Both. It lists the languages the song has in `song_translations` and renders nothing, so no
 * space either, while the original is read or when there are fewer than two languages. "Original" lives in the view
 * switch only. Same control as the version switch (`Segmented`), so it behaves and looks alike.
 */
export function SongLanguageSwitch({ visible, translations, selected, onSelect, className }: SongLanguageSwitchProps) {
  const { t, locale } = useLocale();
  const options = languageOptions(translations, locale);
  if (!visible || !options) return null;
  return (
    <div data-testid="song-language-switch" className={className}>
      <Segmented
        aria-label={t('song.language.label')}
        options={options}
        value={selected && options.some((o) => o.value === selected) ? selected : options[0].value}
        onChange={onSelect}
      />
    </div>
  );
}
