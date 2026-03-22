'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCategoryTree } from '@/lib/taxonomyUtils';
import { renderCategoryIcon } from '@/lib/iconUtils';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

const getColorClasses = (slug: string) => {
  switch (slug) {
    case 'the-elements':
      return {
        bg: 'hover:border-blue-500/40 shadow-blue-900/10',
        icon: 'bg-blue-500/10 text-blue-500',
        text: 'group-hover:text-blue-400',
      };
    case 'nature':
      return {
        bg: 'hover:border-green-500/40 shadow-green-900/10',
        icon: 'bg-green-500/10 text-green-500',
        text: 'group-hover:text-green-400',
      };
    case 'languages':
      return {
        bg: 'hover:border-purple-500/40 shadow-purple-900/10',
        icon: 'bg-purple-500/10 text-purple-500',
        text: 'group-hover:text-purple-400',
      };
    case 'lineage-tradition':
      return {
        bg: 'hover:border-amber-500/40 shadow-amber-900/10',
        icon: 'bg-amber-500/10 text-amber-500',
        text: 'group-hover:text-amber-400',
      };
    case 'medicine-healing':
      return {
        bg: 'hover:border-red-500/40 shadow-red-900/10',
        icon: 'bg-red-500/10 text-red-500',
        text: 'group-hover:text-red-400',
      };
    case 'spiritual-concepts':
      return {
        bg: 'hover:border-indigo-500/40 shadow-indigo-900/10',
        icon: 'bg-indigo-500/10 text-indigo-500',
        text: 'group-hover:text-indigo-400',
      };
    default:
      return {
        bg: 'hover:border-gray-700',
        icon: 'bg-gray-800 text-gray-500',
        text: 'group-hover:text-white',
      };
  }
};

const CATEGORY_ORDER = [
  'The Elements',
  'Nature',
  'Languages',
  'Lineage & Tradition',
  'Medicine & Healing',
  'Spiritual Concepts',
];

export default function CategoryGrid() {
  const { data: tree = [], isLoading } = useQuery({
    queryKey: ['taxonomy'],
    queryFn: fetchCategoryTree,
    staleTime: 1000 * 60 * 60,
  });

  const sortedTree = [...tree].sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a.name);
    const indexB = CATEGORY_ORDER.indexOf(b.name);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
      {sortedTree.map((category) => {
        const colors = getColorClasses(category.slug);
        return (
          <div key={category.id} className="category-card group flex flex-col h-full">
            <div
              className={`glass-panel relative p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-800/50 transition-all h-full shadow-2xl ${colors.bg}`}
            >
              <div className="flex items-start justify-center mb-4 md:mb-6">
                <div
                  className={`category-icon w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-transform duration-300 ${colors.icon}`}
                >
                  {renderCategoryIcon(category.icon_name, category.emoji, 'w-6 h-6 md:w-8 md:h-8', 'text-2xl md:text-3xl')}
                </div>
              </div>

              <Link
                href={`/songs?category=${category.slug}`}
                className="before:absolute before:inset-0 z-0 block"
              >
                <h3 className={`text-base md:text-xl font-bold text-white mb-2 md:mb-3 transition-colors ${colors.text}`}>
                  {category.name}
                </h3>
              </Link>

              <p className="hidden md:block text-gray-400 text-sm mb-6 leading-relaxed relative z-0">
                Explore songs related to {category.name.toLowerCase()}.
              </p>

              <div className="flex flex-wrap gap-1.5 md:gap-2 relative z-10 mt-auto">
                {category.children.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/songs?tag=${tag.slug}`}
                    className="px-2 py-1 md:px-3 md:py-1.5 rounded-full bg-gray-800 text-gray-400 text-[10px] md:text-xs font-medium border border-gray-700 hover:bg-gray-700 hover:text-white transition-all"
                  >
                    {tag.emoji} {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
