'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { errorKeyForCode } from '@/lib/auth/notice';

function ErrorContent() {
    const { t } = useLocale();
    const searchParams = useSearchParams();
    // A code from the redirect, never text: unknown values give the default sentence.
    const text = t(errorKeyForCode(searchParams.get('code')));

    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <div className="w-full max-w-md bg-surface border border-line rounded-panel p-8 flex flex-col items-center">
                <div className="size-16 border-2 border-danger rounded-pill flex items-center justify-center mb-6 text-danger">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                </div>
                <h1 className="text-title font-bold text-fg mb-4">{t('auth.error.title')}</h1>
                <p className="text-fg-muted mb-8 whitespace-pre-wrap">
                    {text}
                </p>
                <Link
                    href="/auth/login"
                    className="inline-flex min-h-tap items-center justify-center rounded-control border border-line-strong px-6 py-2 text-fg transition-colors hover:bg-surface-2"
                >
                    {t('auth.error.backToLogin')}
                </Link>
            </div>
        </div>
    );
}

export default function Error() {
    const { t } = useLocale();
    return (
        <Suspense fallback={<div>{t('common.loading')}</div>}>
            <ErrorContent />
        </Suspense>
    );
}
