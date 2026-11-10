'use client';

import * as React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/context/LocaleContext';
import { cn } from '@/lib/utils';
import { guestGateKeys, signInHref, type GuestGateFeature } from '@/lib/auth/guestGate';

/**
 * GuestGate (Story 6.1.26 / G6.1, #410): the one locked-preview pattern for every
 * members-only screen. A greyed placeholder of what the screen would show, with a card
 * that says WHY it is locked and a "Sign in" button that brings the user back (`next=`).
 *
 * - `variant="page"`: a screen of its own (edit, history, new playlist, settings, profile, library).
 * - `variant="card"`: just the card, for a sheet or dialog (see GuestGateSheet).
 * - `variant="overlay"`: laid over content the parent already renders blurred and inert
 *   (the Practice → Record tab); the parent must be `relative`.
 *
 * Render it from a Server Component too: copy comes from `useLocale()`, which the root
 * LocaleProvider seeds with the server locale, so there is no flash of English.
 */
export interface GuestGateProps {
  feature: GuestGateFeature;
  /** Path (+ query) to return to after signing in. */
  next: string;
  variant?: 'page' | 'overlay' | 'card';
  className?: string;
}

function GateCard({ feature, next, headingId }: { feature: GuestGateFeature; next: string; headingId: string }) {
  const { t } = useLocale();
  const keys = guestGateKeys(feature);
  return (
    <div className="mx-auto w-full max-w-sm rounded-panel border border-line bg-surface p-5 text-center">
      <span className="mx-auto flex size-tap items-center justify-center rounded-pill bg-surface-2 text-fg-muted">
        <Lock aria-hidden="true" className="size-5" />
      </span>
      <h2 id={headingId} className="mt-3 text-row font-semibold text-fg">
        {t(keys.title)}
      </h2>
      <p className="mt-1 text-meta text-fg-muted">{t(keys.reason)}</p>
      <Button asChild className="mt-4 w-full">
        <Link href={signInHref(next)} data-testid="guest-gate-sign-in">
          {t('guestGate.signIn')}
        </Link>
      </Button>
    </div>
  );
}

export default function GuestGate({ feature, next, variant = 'page', className }: GuestGateProps) {
  const headingId = React.useId();

  if (variant === 'card') {
    return (
      <section aria-labelledby={headingId} data-testid="guest-gate" data-feature={feature} className={className}>
        <GateCard feature={feature} next={next} headingId={headingId} />
      </section>
    );
  }

  if (variant === 'overlay') {
    return (
      <section
        aria-labelledby={headingId}
        data-testid="guest-gate"
        data-feature={feature}
        className={cn('absolute inset-0 z-10 flex items-center justify-center p-6', className)}
      >
        <GateCard feature={feature} next={next} headingId={headingId} />
      </section>
    );
  }

  return (
    <section
      aria-labelledby={headingId}
      data-testid="guest-gate"
      data-feature={feature}
      className={cn('grid w-full', className)}
    >
      {/* Locked preview: decorative placeholder rows, hidden from assistive tech and not focusable. */}
      <div
        aria-hidden="true"
        {...{ inert: true }}
        className="col-start-1 row-start-1 flex select-none flex-col gap-3 opacity-60 blur-[3px]"
      >
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex min-h-16 items-center gap-3 rounded-panel border border-line bg-surface p-3">
            <span className="size-10 shrink-0 rounded-control bg-surface-2" />
            <span className="flex flex-1 flex-col gap-2">
              <span className="h-3 w-2/3 rounded-pill bg-surface-2" />
              <span className="h-3 w-1/3 rounded-pill bg-surface-2" />
            </span>
          </div>
        ))}
      </div>
      <div className="relative z-10 col-start-1 row-start-1 flex items-center justify-center px-4 py-6">
        <GateCard feature={feature} next={next} headingId={headingId} />
      </div>
    </section>
  );
}
