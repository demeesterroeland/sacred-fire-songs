'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Lock, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import Link from 'next/link';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

function UpdatePasswordContent() {
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
            setError("Passwords do not match");
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
            setError(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4">
            <div className="relative w-full max-w-[420px] bg-white dark:bg-[#1c222d] md:border md:border-gray-200 dark:md:border-[#2d3545] md:rounded-3xl p-6 md:p-8 md:shadow-2xl transition-all duration-300">

                {/* Header */}
                <div className="flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-0 mb-8 md:mb-10 mt-4 md:mt-0">
                    <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#d9481e] to-[#f45d1a] flex items-center justify-center shadow-[0_0_20px_rgba(217,72,30,0.3)] md:mb-6 flex-shrink-0">
                        <ShieldCheck className="text-white w-6 h-6 md:w-10 md:h-10" />
                    </div>
                    <div className="text-left md:text-center">
                        <h1 className="text-gray-900 dark:text-white text-xl md:text-3xl font-bold md:mb-2 leading-tight">New Password</h1>
                        <p className="text-[#8e99aa] text-xs md:text-sm">Please enter and confirm your new password.</p>
                    </div>
                </div>

                {message && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-sm text-center">
                        {message}
                    </div>
                )}

                <form className="space-y-4 md:space-y-6" onSubmit={handleUpdatePassword}>
                    <div className="space-y-2">
                        <Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white ml-1 tracking-wide uppercase opacity-70">New Password</Label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a657a] group-focus-within:text-[#d9481e] transition-colors pointer-events-none">
                                <Lock className="w-5 h-5" />
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-transparent border-gray-200 dark:border-[#2d3545] rounded-xl py-3.5 md:py-4 pl-12 pr-4 text-gray-900 dark:text-white placeholder-[#5a657a] focus:outline-none focus:border-[#d9481e] transition-all text-[14px] md:text-[15px] h-auto"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white ml-1 tracking-wide uppercase opacity-70">Confirm Password</Label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a657a] group-focus-within:text-[#d9481e] transition-colors pointer-events-none">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-transparent border-gray-200 dark:border-[#2d3545] rounded-xl py-3.5 md:py-4 pl-12 pr-4 text-gray-900 dark:text-white placeholder-[#5a657a] focus:outline-none focus:border-[#d9481e] transition-all text-[14px] md:text-[15px] h-auto"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 text-center bg-red-500/10 border border-red-500/20 p-2 rounded-xl">
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-auto bg-gradient-to-r from-[#d9481e] to-[#f45d1a] hover:brightness-110 active:scale-[0.98] text-white font-bold py-3.5 md:py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(217,72,30,0.4)]"
                    >
                        {isLoading ? "Updating..." : "Update Password"}
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                </form>

                <div className="mt-12 text-center border-t border-gray-200 dark:border-[#2d3545] pt-6">
                    <p className="text-[#8e99aa] text-sm">
                        Back to
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

export default function UpdatePassword() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UpdatePasswordContent />
        </Suspense>
    );
}
