'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, KeyRound, ArrowRight, Loader2 } from 'lucide-react';

function SignUpSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Email not found. Please sign up again.');
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
            setError(error.message);
        } else {
            router.push('/auth/finish-registration');
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <div className="w-full max-w-md bg-[#1c222d] border border-[#2d3545] rounded-3xl p-8 shadow-2xl flex flex-col items-center">

                {/* Icon */}
                <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center mb-6 text-emerald-400">
                    <Mail className="w-8 h-8" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
                <p className="text-[#8e99aa] text-sm mb-2">
                    We sent a confirmation link and a 6-digit code to
                </p>
                {email && (
                    <p className="text-white font-semibold text-sm mb-6 truncate max-w-full">{email}</p>
                )}

                {/* Divider */}
                <div className="w-full flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-[#2d3545]" />
                    <span className="text-[10px] font-bold text-[#5a657a] uppercase tracking-widest">or enter code</span>
                    <div className="flex-1 h-px bg-[#2d3545]" />
                </div>

                {/* OTP Form */}
                <form onSubmit={handleVerify} className="w-full space-y-4">
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a657a] group-focus-within:text-[#d9481e] transition-colors pointer-events-none">
                            <KeyRound className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            placeholder="6-digit code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full bg-transparent border border-[#2d3545] rounded-xl py-4 pl-12 pr-4 text-white text-center text-xl tracking-[0.5em] placeholder:text-[#5a657a] placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:border-[#d9481e] transition-all"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isVerifying || code.length !== 6}
                        className="w-full bg-gradient-to-r from-[#d9481e] to-[#f45d1a] hover:brightness-110 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(217,72,30,0.4)] active:scale-[0.98]"
                    >
                        {isVerifying ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>Verify & Continue <ArrowRight className="w-5 h-5" /></>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-[#2d3545] w-full text-center">
                    <Link
                        href="/auth/login"
                        className="text-[#8e99aa] hover:text-white text-sm transition-colors"
                    >
                        Return to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function SignupSuccess() {
    return (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>}>
            <SignUpSuccessContent />
        </Suspense>
    );
}
