'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, Suspense } from 'react';
import { Mail, Key, Sparkles } from "lucide-react";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/common/BackButton';
import { AuthCard, AuthHeader, AuthNotice, AuthPage, authFooterClass, authIconClass, authInputClass, authLabelClass, authLinkClass } from '@/components/auth/AuthShell';
import { authPageHref } from '@/lib/auth/authBack';
import { safeNextPath } from '@/lib/auth/safeNext';

import { useLocale } from '@/context/LocaleContext';
import { authNoticeKey } from '@/lib/auth/notice';
import { errorMessage } from '@/lib/errors/errorCode';
function ForgotPasswordContent() {
    const { t } = useLocale();
    const searchParams = useSearchParams();
    const messageKey = authNoticeKey(searchParams.get('message'));
    const rawNext = searchParams.get('next');
    // Back goes to the sign-in page, which keeps the way back to where the guest came from.
    const safeNext = rawNext ? safeNextPath(rawNext) : null;
    const loginHref = authPageHref('login', { next: safeNext && safeNext !== '/' ? safeNext : null });
    const [email, setEmail] = useState(searchParams.get('email') || "");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
            });
            if (error) throw error;
            setSuccessMessage(t('auth.forgotPassword.checkEmail'));
        } catch (error: unknown) {
            setError(errorMessage(error, t, 'common.errorOccurred'));
        } finally {
            setIsLoading(false);
        }
    };

    const notice = error || successMessage || (messageKey ? t(messageKey) : null);

    return (
        <AuthPage back={<BackButton href={loginHref} testId="auth-back" />}>
            <AuthCard>
                <AuthHeader
                    icon={<Key />}
                    title={t('auth.forgotPassword.pageTitle')}
                    description={t('auth.forgotPassword.pageDescription')}
                />

                {notice && (
                    <div className="mb-6">
                        <AuthNotice tone={error ? 'error' : 'info'}>{notice}</AuthNotice>
                    </div>
                )}

                <form className="space-y-4 md:space-y-6" onSubmit={handleResetPassword}>
                    <div className="space-y-2">
                        <Label htmlFor="email" className={authLabelClass}>{t('field.email.label')}</Label>
                        <div className="group relative">
                            <div className={authIconClass}>
                                <Mail className="size-5" />
                            </div>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t('field.email.placeholder')}
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={authInputClass}
                            />
                        </div>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? t('auth.forgotPassword.submitting') : t('auth.forgotPassword.submit')}
                        <Sparkles />
                    </Button>
                </form>

                <div className={authFooterClass}>
                    <p>
                        {t('auth.forgotPassword.rememberPassword')}
                        <Link href={loginHref} className={`${authLinkClass} ml-1`}>
                            {t('auth.signInLink')}
                        </Link>
                    </p>
                </div>
            </AuthCard>
        </AuthPage>
    );
}

function LoadingFallback() {
    const { t } = useLocale();
    return <div>{t('common.loading')}</div>;
}

export default function ForgotPassword() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <ForgotPasswordContent />
        </Suspense>
    );
}
