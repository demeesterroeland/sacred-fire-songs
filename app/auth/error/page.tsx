'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error') || 'We encountered an error during authentication. Please try again.';

    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <div className="w-full max-w-md bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6 text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Something went wrong</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 whitespace-pre-wrap">
                    {error}
                </p>
                <Link
                    href="/auth/login"
                    className="text-gray-900 dark:text-white bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 px-6 py-2 rounded-lg transition-colors"
                >
                    Back to Login
                </Link>
            </div>
        </div>
    );
}

export default function Error() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ErrorContent />
        </Suspense>
    );
}
