'use client';

import { TagPill } from '@/components/ui/TagPill';
import { AuthorPill } from '@/components/ui/AuthorPill';
import { parseArtists } from '@/lib/songs/artistUtils';

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
  const artists = parseArtists(originalAuthor);
  const displayArtists = artists.length > 0 ? artists : ['Traditional'];

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
