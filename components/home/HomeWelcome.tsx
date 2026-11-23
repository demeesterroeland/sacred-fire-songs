'use client';

import { useLocale } from '@/context/LocaleContext';

/**
 * Story 6.1.28 (G6.3, #412): one line that says what the site is, for first-time visitors.
 * Shown to guests only; members see their Your Library stats instead.
 */
export default function HomeWelcome() {
  const { t } = useLocale();
  return (
    <div>
      <h1 className="text-title font-semibold text-fg">{t('home.welcome.title')}</h1>
      <p className="mt-1 text-body text-fg-muted">{t('home.welcome.line')}</p>
    </div>
  );
}
