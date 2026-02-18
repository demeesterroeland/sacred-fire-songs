'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCategoryTree, TaxonomyNode } from '@/lib/taxonomyUtils';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSidebar } from '@/context/SidebarContext';

// Helper to map slugs to approximate colors (mimicking the design)
import { getCategoryColor, getCategoryStyles } from '@/lib/uiUtils';

import { renderCategoryIcon } from '@/lib/iconUtils';

const ColorPill = ({
  slug,
  name,
  isActive,
  type = 'tag',
  icon_name,
  emoji
}: {
  slug: string,
  name: string,
  isActive: boolean,
  type?: 'header' | 'tag',
  icon_name?: string | null,
  emoji?: string | null
}) => {
  const color = getCategoryColor(slug);
  const style = getCategoryStyles(color);

  // Header Style
  if (type === 'header') {
    const baseClass = `flex items-center justify-between text-xs font-bold px-2 py-1.5 mb-3 rounded border uppercase tracking-wider group cursor-pointer transition-all`;

    if (isActive) {
      return (
        <div className={`${baseClass} text-white bg-gray-800 border-gray-700 shadow-sm`}>
          <div className="flex items-center gap-2">
            {renderCategoryIcon(icon_name, emoji, 'w-3.5 h-3.5', 'text-sm')}
            <span>{name}</span>
          </div>
          <span className="text-[9px] font-normal normal-case bg-gray-700 text-white px-1.5 py-0.5 rounded ml-2 border border-gray-600">Match Any</span>
        </div>
      );
    }
    return (
      <div className={`${baseClass} text-gray-400 border-transparent hover:text-white hover:bg-gray-800/50`}>
        <div className="flex items-center gap-2">
          {renderCategoryIcon(icon_name, emoji, 'w-3.5 h-3.5 opacity-50 group-hover:opacity-100', 'text-sm opacity-50 group-hover:opacity-100')}
          <span>{name}</span>
        </div>
      </div>
    );
  }

  // Tag Style (Pill)
  const finalClass = `flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${isActive ? style.active : style.inactive}`;

  return (
    <span className={finalClass}>
      {emoji && <span className="opacity-70">{emoji}</span>}
      {name}
    </span>
  );
}

export default function LibrarySidebar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { setIsOpen } = useSidebar();
  const activeCategory = searchParams.get('category');

  // Parse tags: split by comma to support multi-select
  const rawTags = searchParams.get('tag') || '';
  const activeTags = rawTags ? rawTags.split(',') : [];

  const { data: tree = [], isLoading } = useQuery({
    queryKey: ['taxonomy'],
    queryFn: fetchCategoryTree,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Helper to toggle tag in URL
  const getToggleTagUrl = (slug: string) => {
    const newTags = activeTags.includes(slug)
      ? activeTags.filter(t => t !== slug) // Remove if active
      : [...activeTags, slug];             // Add if inactive

    const params = new URLSearchParams(searchParams.toString());
    if (newTags.length > 0) {
      params.set('tag', newTags.join(','));
    } else {
      params.delete('tag');
    }

    // Keep category if set? The user might want to drill down.
    // If clicking a tag, usually we want to stay on the same base page
    return `${pathname}?${params.toString()}`;
  };

  if (isLoading) {
    return <div className="p-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-600" /></div>;
  }

  // Sort top-level categories alphabetically or by fixed order if we had one
  // "The Elements", "Nature", "Languages", "Lineage & Tradition", "Medicine & Healing", "Spiritual Concepts"
  const order = ["The Elements", "Nature", "Languages", "Lineage & Tradition", "Medicine & Healing", "Spiritual Concepts"];
  const sortedTree = [...tree].sort((a, b) => {
    const indexA = order.indexOf(a.name);
    const indexB = order.indexOf(b.name);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-6">
      {sortedTree.map(group => {
        const isGroupActive = activeCategory === group.slug;

        return (
          <div key={group.id}>
            {/* Parent Category Header (Selects Category OR Logic) */}
            {/* Clicking header usually resets tags to just the category context or toggle category */}
            <Link
              href={`/songs?category=${group.slug}`}
              className="block"
              onClick={() => setIsOpen(false)}
            >
              <ColorPill
                slug={group.slug}
                name={group.name}
                isActive={isGroupActive}
                type="header"
                icon_name={group.icon_name}
                emoji={group.emoji}
              />
            </Link>

            {/* Tags (Selects Tag AND Logic) */}
            <div className="flex flex-wrap gap-2 px-2">
              {group.children.map(child => {
                const isTagActive = activeTags.includes(child.slug);
                return (
                  <Link
                    key={child.id}
                    href={getToggleTagUrl(child.slug)}
                    scroll={false}
                    onClick={() => setIsOpen(false)}
                  >
                    <ColorPill
                      slug={child.slug}
                      name={child.name}
                      isActive={isTagActive}
                      emoji={child.emoji}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
