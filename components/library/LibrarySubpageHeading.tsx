import type { LucideIcon } from 'lucide-react';
import { formatCount } from '@/lib/format/count';

/**
 * The heading of a Library sub-page or section (History, New, Artists, Shared with me, the Playlists sections, Smart): one size, weight and colour for all of
 * them (validation 2, item 3), an h2 under the Library tabs' h1 (`level={1}` on a page without tabs), and the count in
 * parentheses like every other amount (#388).
 */
export function LibrarySubpageHeading({
  icon: Icon, title, count, level = 2, className = 'mb-4',
}: { icon: LucideIcon; title: string; count?: number; level?: 1 | 2; className?: string }) {
  const Heading = level === 1 ? 'h1' : 'h2';
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Icon className="size-4 text-fg-subtle" aria-hidden />
      <Heading data-testid="library-subpage-heading" className="text-body font-semibold text-fg">{title}</Heading>
      {count !== undefined && <span className="text-meta text-fg-subtle">{formatCount(count)}</span>}
    </div>
  );
}
