'use client';

import Link from 'next/link';
import { useLocale } from '@/context/LocaleContext';

interface BackButtonProps {
    /** Where "Back" leads. On auth pages: `authBackHref(next)` (the page the guest came from, else Home). */
    href: string;
    label?: string;
    /** Test hook; auth pages pass `auth-back`. */
    testId?: string;
}

export function BackButton({ href, label, testId = 'back-link' }: BackButtonProps) {
    const { t } = useLocale();
    return (
        <Link
            href={href}
            data-testid={testId}
            className="group -ml-2 inline-flex min-h-tap items-center gap-2 rounded-control px-2 text-body text-fg-muted no-underline transition-colors hover:bg-surface-2 hover:text-fg"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="size-4 motion-safe:transition-transform motion-safe:group-hover:-translate-x-1"
            >
                <polyline points="15 18 9 12 15 6" />
            </svg>
            {label ?? t('common.back')}
        </Link>
    );
}
