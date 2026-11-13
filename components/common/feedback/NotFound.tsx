'use client';

import Link from 'next/link';
import { Compass, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/context/LocaleContext';
import type { TranslationKey } from '@/lib/i18n';

interface NotFoundProps {
  /** Dictionary keys; the defaults are the generic "Page not found" copy. */
  titleKey?: TranslationKey;
  descriptionKey?: TranslationKey;
  /** Decorative icon by name (server pages cannot pass components to a client component). */
  icon?: 'compass' | 'music';
}

const ICONS = { compass: Compass, music: Music2 } as const;

export default function NotFound({
  titleKey = 'feedback.notFound.page.title',
  descriptionKey = 'feedback.notFound.page.description',
  icon = 'compass',
}: NotFoundProps = {}) {
  const Icon = ICONS[icon];
  const { t } = useLocale();
  return (
    <div className="flex h-full min-h-[60vh] flex-1 flex-col items-center justify-center bg-bg p-8 text-center">
      <Icon aria-hidden="true" className="mb-6 size-16 text-fg-subtle" />

      <h1 className="mb-3 text-title font-semibold text-fg">{t(titleKey)}</h1>
      <p className="mb-8 max-w-xs text-body text-fg-muted">{t(descriptionKey)}</p>

      <Button asChild size="lg">
        <Link href="/">{t('feedback.notFound.page.home')}</Link>
      </Button>
    </div>
  );
}
