'use client';

import { Segmented } from '@/components/ui/segmented';
import { useLocale } from '@/context/LocaleContext';
import { versionOptions, type VersionLike } from '@/lib/songs/versionSwitch';

interface SongVersionSwitchProps {
  versions: ReadonlyArray<VersionLike> | null | undefined;
  selectedIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}

/**
 * Story 6.1.11 (#395): the slot under the song title for the version switch
 * (Original · Simplified · Live). Renders nothing unless the song has more than one
 * version, so a single-version song gets no control and no extra space. The language
 * switch of the planned translation layer joins this slot later.
 */
export function SongVersionSwitch({ versions, selectedIndex, onSelect, className }: SongVersionSwitchProps) {
  const { t, locale } = useLocale();
  const options = versionOptions(versions, t, locale);
  if (!options) return null;
  const selected = options[selectedIndex] ?? options[0];
  return (
    <div data-testid="song-version-switch" className={className}>
      <Segmented
        aria-label={t('song.version.label')}
        options={options}
        value={selected.value}
        onChange={(id) => onSelect(options.findIndex((o) => o.value === id))}
      />
    </div>
  );
}
