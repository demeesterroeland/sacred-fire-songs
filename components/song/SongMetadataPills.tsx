'use client';

import { TagPill } from '@/components/ui/TagPill';
import { AuthorPill } from '@/components/ui/AuthorPill';
import { parseArtists } from '@/lib/songs/artistUtils';
import { useLocale } from '@/context/LocaleContext';

interface CategoryItem {
  name: string;
  slug: string;
  emoji?: string;
  parent?: string | null;
}

interface SongMetadataPillsProps {
  originalAuthor?: string | null;
  categories?: CategoryItem[];
}

export function SongMetadataPills({ originalAuthor, categories = [] }: SongMetadataPillsProps) {
  const { t } = useLocale();
  const artists = parseArtists(originalAuthor);
  const displayArtists = artists.length > 0
    ? artists.map((a) => a.toLowerCase() === 'traditional' ? t('song.traditional') : a)
    : [t('song.traditional')];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {displayArtists.map((artistName: string, idx: number) => (
        <AuthorPill
          key={idx}
          author={artistName}
          href={`/songs?artist=${encodeURIComponent(artistName)}`}
        />
      ))}
      {categories.map((cat) => (
        <TagPill
          key={cat.slug}
          label={cat.name}
          categorySlug={cat.slug}
          emoji={cat.emoji}
          variant="badge"
          href={`/songs?tag=${encodeURIComponent(cat.slug)}`}
        />
      ))}
    </div>
  );
}
