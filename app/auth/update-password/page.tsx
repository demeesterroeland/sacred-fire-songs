'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Lock, ShieldCheck, ArrowRight } from "lucide-react";
import Link from 'next/link';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AuthCard, AuthHeader, AuthNotice, AuthPage, authFooterClass, authIconClass, authInputClass, authLabelClass, authLinkClass } from '@/components/auth/AuthShell';

import { useLocale } from '@/context/LocaleContext';
import { errorMessage } from '@/lib/errors/errorCode';
function UpdatePasswordContent() {
    const { t } = useLocale();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const message = searchParams.get('message');

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError(t('settings.security.mismatch'));
            return;
        }

        const supabase = createClient();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;

            // Notify other components like Sidebar to refresh auth state
            window.dispatchEvent(new Event("auth-role-change"));

            router.push("/?message=Password updated successfully");
        } catch (error: unknown) {
            setError(errorMessage(error, t, 'common.errorOccurred'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthPage>
            <AuthCard>
                <AuthHeader
                    icon={<ShieldCheck />}
                    title={t('field.newPassword')}
                    description={t('auth.updatePassword.pageDescription')}
                />

                {message && (
                    <div className="mb-6">
                        <AuthNotice tone="error">{message}</AuthNotice>
                    </div>
                )}

                <form className="space-y-4 md:space-y-6" onSubmit={handleUpdatePassword}>
                    <div className="space-y-2">
                        <Label htmlFor="password" className={authLabelClass}>{t('field.newPassword')}</Label>
                        <div className="group relative">
                            <div className={authIconClass}>
                                <Lock className="size-5" />
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={authInputClass}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className={authLabelClass}>{t('field.confirmPasswordShort')}</Label>
                        <div className="group relative">
                            <div className={authIconClass}>
                                <ShieldCheck className="size-5" />
                            </div>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={authInputClass}
                            />
                        </div>
                    </div>

                    {error && <AuthNotice tone="error">{error}</AuthNotice>}

                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? t('settings.security.updating') : t('settings.security.updatePassword')}
                        <ArrowRight />
                    </Button>
                </form>

                <div className={authFooterClass}>
                    <p>
                        {t('auth.updatePassword.backTo')}
                        <Link href="/auth/login" className={`${authLinkClass} ml-1`}>
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

export default function UpdatePassword() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <UpdatePasswordContent />
        </Suspense>
    );
}
