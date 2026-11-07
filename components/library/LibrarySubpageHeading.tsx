import type { LucideIcon } from 'lucide-react';
import { formatCount } from '@/lib/format/count';

/**
 * The heading of a Library sub-page (History, Artists, Shared with me): one size, weight and colour for all of
 * them (validation 2, item 3), an h1 because these pages show only a breadcrumb above it, and the count in
 * parentheses like every other amount (#388).
 */
export function LibrarySubpageHeading({ icon: Icon, title, count }: { icon: LucideIcon; title: string; count?: number }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Icon className="size-4 text-fg-subtle" aria-hidden />
      <h1 className="text-body font-semibold text-fg">{title}</h1>
      {count !== undefined && <span className="text-meta text-fg-subtle">{formatCount(count)}</span>}
    </div>
  );
}
