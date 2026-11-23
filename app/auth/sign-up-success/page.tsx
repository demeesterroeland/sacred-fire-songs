'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, KeyRound, ArrowRight, Loader2 } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { safeEmailParam } from '@/lib/auth/notice';
import { errorMessage } from '@/lib/errors/errorCode';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AuthCard, AuthHeader, AuthNotice, authFooterClass, authIconClass } from '@/components/auth/AuthShell';

function SignUpSuccessContent() {
    const { t } = useLocale();
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = safeEmailParam(searchParams.get('email'));
    const next = searchParams.get('next');

    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError(t('errors.auth.signUpAgain'));
            return;
        }
        setIsVerifying(true);
        setError(null);
        const supabase = createClient();
        const { error } = await supabase.auth.verifyOtp({
            email,
            token: code.trim(),
            type: 'signup',
        });
        setIsVerifying(false);
        if (error) {
            setError(errorMessage(error, t, 'common.errorOccurred'));
        } else {
            router.push(`/auth/finish-registration${next ? `?next=${encodeURIComponent(next)}` : ""}`);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <AuthCard className="flex flex-col items-center">
                <AuthHeader
                    icon={<Mail />}
                    title={t('auth.signUpSuccess.title')}
                    description={t('auth.signUpSuccess.description')}
                />
                {email && (
                    <p className="mb-6 max-w-full truncate text-meta font-semibold text-fg">{email}</p>
                )}

                {/* Divider */}
                <div className="mb-6 flex w-full items-center gap-3">
                    <div className="h-px flex-1 bg-line" />
                    <span className="text-caption font-semibold text-fg-muted">{t('auth.signUpSuccess.orEnterCode')}</span>
                    <div className="h-px flex-1 bg-line" />
                </div>

                {/* OTP Form */}
                <form onSubmit={handleVerify} className="w-full space-y-4">
                    <div className="group relative">
                        <div className={authIconClass}>
                            <KeyRound className="size-5" />
                        </div>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            placeholder="6-digit code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="min-h-tap w-full rounded-control border border-line-strong bg-transparent py-4 pl-12 pr-4 text-center text-title tracking-[0.5em] text-fg placeholder:text-meta placeholder:tracking-normal placeholder:text-fg-muted"
                            required
                        />
                    </div>

                    {error && <AuthNotice tone="error">{error}</AuthNotice>}

                    <Button type="submit" className="w-full" disabled={isVerifying || code.length !== 6}>
                        {isVerifying ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>{t('auth.signUpSuccess.verify')} <ArrowRight /></>
                        )}
                    </Button>
                </form>

                <div className={cn(authFooterClass, 'w-full')}>
                    <Link
                        href={`/auth/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
                        className="text-fg-muted underline underline-offset-4 hover:text-fg"
                    >
                        {t('auth.signUpSuccess.returnToLogin')}
                    </Link>
                </div>
            </AuthCard>
        </div>
    );
}

export default function SignupSuccess() {
    return (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-fg-muted" /></div>}>
            <SignUpSuccessContent />
        </Suspense>
    );
}
