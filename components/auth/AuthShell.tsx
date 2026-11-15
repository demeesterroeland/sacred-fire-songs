import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Plain page layout for the auth pages (Story 6.1.25 / G5.4, #409). Semantic tokens only.
 * No fake modal: the page has a "Back" link above the card (BackButton), never a ✕.
 */

export const authInputClass =
  'h-auto min-h-tap w-full rounded-control border border-line-strong bg-transparent py-3 pl-12 pr-4 text-body text-fg placeholder:text-fg-muted focus-visible:outline-2 focus-visible:outline-focus';
export const authIconClass =
  'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-muted transition-colors group-focus-within:text-accent';
export const authLabelClass = 'ml-1 text-meta font-semibold text-fg-muted';
export const authLinkClass = 'font-medium text-accent underline underline-offset-4 hover:text-accent/80';
export const authFooterClass = 'mt-8 border-t border-line pt-6 text-center text-meta text-fg-muted';

export function AuthPage({ back, children }: { back?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-4">
      {back ? <div>{back}</div> : null}
      <div className="flex flex-1 items-center justify-center py-6">{children}</div>
    </div>
  );
}

export function AuthCard({ className, children, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn('w-full max-w-[420px] p-2 md:rounded-panel md:border md:border-line md:bg-surface md:p-8', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function AuthHeader({ icon, title, description }: { icon: ReactNode; title: string; description?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-row items-center gap-4 md:mb-10 md:flex-col md:gap-0">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-pill bg-accent-soft text-accent md:mb-6 md:size-20 [&_svg]:size-6 md:[&_svg]:size-10">
        {icon}
      </div>
      <div className="text-left md:text-center">
        <h1 className="text-title font-bold text-fg md:mb-2">{title}</h1>
        {description ? <p className="text-meta text-fg-muted">{description}</p> : null}
      </div>
    </div>
  );
}

/** Message box. The words carry the meaning; the border style only supports them. */
export function AuthNotice({ tone, children }: { tone: 'info' | 'error'; children: ReactNode }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-control border p-3 text-center text-meta',
        tone === 'error' ? 'border-danger text-danger' : 'border-line-strong bg-surface-2 text-fg'
      )}
    >
      {children}
    </div>
  );
}
