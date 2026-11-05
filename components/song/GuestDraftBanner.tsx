'use client';

import { useId } from 'react';
import Link from 'next/link';
import { PencilLine } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { signInHref } from '@/lib/auth/guestGate';

/**
 * Story 6.1.27 / G6.2 (#411): a guest on Add Song learns before typing that saving
 * needs an account. The draft stays on this device, so signing in from here brings
 * them back to the same form (`next=`).
 */
export default function GuestDraftBanner({ next }: { next: string }) {
  const { t } = useLocale();
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      data-testid="guest-draft-banner"
      className="mx-auto mb-4 flex w-full max-w-2xl items-start gap-3 rounded-panel border border-line bg-surface-2 p-4"
    >
      <PencilLine aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-fg-muted" />
      <div className="min-w-0 flex-1">
        <p id={titleId} className="text-body font-semibold text-fg">
          {t('songForm.guestDraft.title')}
        </p>
        <p className="text-meta text-fg-muted">{t('songForm.guestDraft.body')}</p>
      </div>
      <Link
        href={signInHref(next)}
        className="inline-flex min-h-tap shrink-0 items-center rounded-control bg-accent px-4 text-meta font-semibold text-on-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {t('songForm.guestDraft.signIn')}
      </Link>
    </section>
  );
}
