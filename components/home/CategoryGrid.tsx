'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCategoryTree, type TaxonomyNode } from '@/lib/taxonomyUtils';
import { sortCategories } from '@/lib/categoryOrder';
import { renderCategoryIcon } from '@/lib/iconUtils';
import { useLocale } from '@/context/LocaleContext';
import { formatCount } from '@/lib/format/count';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

const MOBILE_TAG_LIMIT = 4;

/** Pressed / focus feedback is the only place the accent appears (Story 6.1.4 / G1.4, #388). */
const PRESSED = 'active:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

/** Tags as plain text links with a grey count: no coloured chips, no emoji. */
function TagList({ tags }: { tags: TaxonomyNode[] }) {
  const { t } = useLocale();
  const [expanded, setExpanded] = useState(false);
  const overflow = tags.length - MOBILE_TAG_LIMIT;

  return (
    <ul className="relative z-10 flex flex-wrap gap-x-3">
      {tags.map((tag, i) => (
        <li key={tag.id} className={!expanded && i >= MOBILE_TAG_LIMIT ? 'hidden md:list-item' : ''}>
          <Link
            href={`/songs?tag=${tag.slug}`}
            className={`inline-flex min-h-tap items-center text-meta text-fg-muted hover:text-fg ${PRESSED}`}
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
  const { t } = useLocale();
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
    <div data-testid="category-grid" className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
      {sortedTree.map((category) => (
        <div
          key={category.id}
          className="group relative flex h-full flex-col rounded-panel border border-line bg-surface p-4 transition-colors hover:bg-surface-2 active:border-line-strong md:p-6"
        >
          <div
            aria-hidden="true"
            className="mb-3 flex size-10 items-center justify-center rounded-control bg-surface-2 text-fg-muted md:size-12"
          >
            {renderCategoryIcon(category.icon_name, category.emoji, 'size-5 md:size-6', 'text-xl grayscale')}
          </div>

          <Link
            href={`/songs?category=${category.slug}`}
            className="z-0 flex min-h-tap items-center outline-none before:absolute before:inset-0 before:rounded-panel focus-visible:before:outline-2 focus-visible:before:outline-offset-2 focus-visible:before:outline-accent"
          >
            <h3 className="text-row font-semibold text-fg group-active:text-accent">{category.name}</h3>
          </Link>

          <p className="relative z-0 mb-4 hidden text-meta text-fg-muted md:block">
            {t('explore.category.description', { category: category.name.toLowerCase() })}
          </p>

          <TagList tags={category.children} />
        </div>
      ))}
    </div>
  );
}
