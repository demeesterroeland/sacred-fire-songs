'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCategoryTree, type TaxonomyNode } from '@/lib/taxonomyUtils';
import { sortCategories } from '@/lib/categoryOrder';
import { useLocale } from '@/context/LocaleContext';
import { formatCount } from '@/lib/format/count';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

const MOBILE_TAG_LIMIT = 4;

/** Pressed / focus feedback is the only place the accent appears (Story 6.1.4 / G1.4, #388). */
const PRESSED = 'active:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

/** Tags as plain text links with a grey count: no coloured chips, no emoji. `gap-1` is the visible gap, because a space inside a flex link collapses; the space keeps the name "Air (3)" for screen readers. */
function TagList({ tags }: { tags: TaxonomyNode[] }) {
  const { t } = useLocale();
  const [expanded, setExpanded] = useState(false);
  const overflow = tags.length - MOBILE_TAG_LIMIT;

  return (
    <ul className="flex flex-wrap gap-x-3">
      {tags.map((tag, i) => (
        <li key={tag.id} className={!expanded && i >= MOBILE_TAG_LIMIT ? 'hidden md:list-item' : ''}>
          <Link
            href={`/songs?tag=${tag.slug}`}
            className={`inline-flex min-h-tap items-center gap-1 text-meta text-fg-muted hover:text-fg ${PRESSED}`}
          >
            {tag.name}
            {tag.song_count !== undefined && ' '}
            {tag.song_count !== undefined && (
              <span data-testid="tag-count" className="tabular-nums text-fg-subtle">
                {formatCount(tag.song_count)}
              </span>
            )}
          </Link>
        </li>
      ))}
      {overflow > 0 && !expanded && (
        <li className="md:hidden">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className={`inline-flex min-h-tap items-center text-meta font-medium text-fg-muted hover:text-fg ${PRESSED}`}
          >
            {t('explore.categories.more', { count: overflow })}
          </button>
        </li>
      )}
    </ul>
  );
}

export default function CategoryGrid() {
  const { data: tree = [], isLoading } = useQuery({
    queryKey: ['taxonomy'],
    queryFn: fetchCategoryTree,
    staleTime: 1000 * 60 * 60,
  });

  const sortedTree = sortCategories(tree);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 aria-hidden="true" className="size-8 motion-safe:animate-spin text-fg-subtle" />
      </div>
    );
  }

  return (
    // Validation 4 (#388): two columns from md, like the song list on /songs. One line under every category.
    <div data-testid="category-grid" className="grid grid-cols-1 border-t border-line md:grid-cols-2 md:gap-x-6">
      {sortedTree.map((category) => (
        <section key={category.id} className="border-b border-line py-2">
          <Link href={`/songs?category=${category.slug}`} className={`group flex min-h-tap items-center ${PRESSED}`}>
            <h3 className="text-row font-semibold text-fg group-active:text-accent">{category.name}</h3>
          </Link>

          <TagList tags={category.children} />
        </section>
      ))}
    </div>
  );
}
