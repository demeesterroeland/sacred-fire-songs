'use client';

import { Globe, Lock } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';

/** Lock for private, globe for public, with the word for a screen reader and on hover (design tokens rule 2). */
export function VisibilityIcon({ isPublic, className }: { isPublic: boolean; className?: string }) {
  const { t } = useLocale();
  const label = t(isPublic ? 'song.visibility.public' : 'song.visibility.private');
  const Icon = isPublic ? Globe : Lock;
  return (
    <span title={label} className="inline-flex shrink-0">
      <Icon aria-hidden className={className} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
