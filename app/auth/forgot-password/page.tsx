'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, Suspense } from 'react';
import { Mail, Key, Sparkles, Flame, X, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function ForgotPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const message = searchParams.get('message');
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
            setSuccessMessage("Check your email for the reset link");
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4">
            <div className="relative w-full max-w-[420px] bg-white dark:bg-[#1c222d] md:border md:border-gray-200 dark:md:border-[#2d3545] md:rounded-3xl p-6 md:p-8 md:shadow-2xl transition-all duration-300">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-4 top-4 md:left-8 md:top-8 text-[#5a657a] hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2 group p-0 bg-transparent hover:bg-transparent"
                    onClick={() => router.push('/auth/login')}
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back</span>
                </Button>

                {/* Header */}
                <div className="flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-0 mb-8 md:mb-10 mt-12 md:mt-8">
                    <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#d9481e] to-[#f45d1a] flex items-center justify-center shadow-[0_0_20px_rgba(217,72,30,0.3)] md:mb-6 flex-shrink-0">
                        <Key className="text-white w-6 h-6 md:w-10 md:h-10" />
                    </div>
                    <div className="text-left md:text-center">
                        <h1 className="text-gray-900 dark:text-white text-xl md:text-3xl font-bold md:mb-2 leading-tight">Reset Password</h1>
                        <p className="text-[#8e99aa] text-xs md:text-sm">Enter your email to receive a reset link.</p>
                    </div>
                </div>

                {(message || successMessage || error) && (
                    <div className={`mb-6 p-3 rounded-xl text-sm text-center ${error || (message && message.includes('Could not'))
                        ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                        : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        }`}>
                        {error || successMessage || message}
                    </div>
                )}

                <form className="space-y-4 md:space-y-6" onSubmit={handleResetPassword}>
                    <div className="space-y-2">
                        <Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white ml-1 tracking-wide uppercase opacity-70">Email address</Label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a657a] group-focus-within:text-[#d9481e] transition-colors pointer-events-none">
                                <Mail className="w-5 h-5" />
                            </div>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent border-gray-200 dark:border-[#2d3545] rounded-xl py-3.5 md:py-4 pl-12 pr-4 text-gray-900 dark:text-white placeholder-[#5a657a] focus:outline-none focus:border-[#d9481e] transition-all text-[14px] md:text-[15px] h-auto"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-auto bg-gradient-to-r from-[#d9481e] to-[#f45d1a] hover:brightness-110 active:scale-[0.98] text-white font-bold py-3.5 md:py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(217,72,30,0.4)]"
                    >
                        {isLoading ? "Sending..." : "Send Reset Link"}
                        <Sparkles className="w-5 h-5" />
                    </Button>
                </form>

                <div className="mt-12 text-center border-t border-gray-200 dark:border-[#2d3545] pt-6">
                    <p className="text-[#8e99aa] text-sm">
                        Remember your password?
                        <Link
                            href="/auth/login"
                            className="text-[#d9481e] hover:text-[#f45d1a] underline font-medium transition-colors ml-1"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function ForgotPassword() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ForgotPasswordContent />
        </Suspense>
    );
}
