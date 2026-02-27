'use client';

import Link from 'next/link';
import { ArrowLeft, Flame, Hand, LogIn, UserPlus } from 'lucide-react';
import { useState } from 'react';

interface AccessDeniedProps {
    variant?: 'wrong-owner' | 'guest';
}

export default function AccessDenied({ variant = 'wrong-owner' }: AccessDeniedProps) {
    // Client-side visual effects (embers)
    const [embers] = useState<{ id: number; left: number; duration: number; delay: number }[]>(() => {
        if (typeof window === 'undefined') return [];

        const emberCount = 30;
        return Array.from({ length: emberCount }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            duration: Math.random() * 5 + 5,
            delay: Math.random() * 5,
        }));
    });

    const isGuest = variant === 'guest';

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-900 h-full min-h-[60vh] relative overflow-hidden">
            {/* Ambient Ember Background */}
            <div className="absolute inset-0 pointer-events-none">
                {embers.map((ember) => (
                    <div
                        key={ember.id}
                        className="absolute bottom-0 w-1 h-1 bg-orange-500 rounded-full blur-[1px] animate-rise"
                        style={{
                            left: `${ember.left}%`,
                            animationDuration: `${ember.duration}s`,
                            animationDelay: `${ember.delay}s`,
                            opacity: 0.4
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 max-w-md w-full">
                {/* Icon Circle */}
                <div className="relative mb-8 flex justify-center">
                    <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                    <div className="w-24 h-24 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center shadow-2xl relative">
                        {isGuest ? (
                            <Hand className="w-10 h-10 text-amber-500" strokeWidth={1.5} />
                        ) : (
                            <Flame className="w-10 h-10 text-red-500" strokeWidth={1.5} />
                        )}
                    </div>
                </div>

                {/* Text Content */}
                <h1 className="text-3xl font-black text-white mb-4 tracking-tight uppercase italic">
                    {isGuest ? 'This Song Has a Keeper' : 'This Medicine is Not Yours to Edit'}
                </h1>
                <p className="text-gray-400 mb-12 leading-relaxed">
                    {isGuest
                        ? 'This song is tended by its keeper. Join the circle to tend your own songs.'
                        : "Only the song's original keeper or an elder of the circle may edit this medicine."}
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {isGuest ? (
                        <>
                            <Link
                                href="/auth/sign-up"
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-gray-950 rounded-2xl font-bold transition-all active:scale-95 shadow-xl shadow-amber-500/20 group"
                            >
                                <UserPlus className="w-5 h-5" />
                                Join the Circle
                            </Link>
                            <Link
                                href="/auth/login"
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white border border-white/10 rounded-2xl font-bold transition-all active:scale-95 group"
                            >
                                <LogIn className="w-5 h-5" />
                                Log In
                            </Link>
                        </>
                    ) : (
                        <Link
                            href="/"
                            className="flex items-center justify-center gap-3 px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-xl shadow-red-500/20 group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            Back to the Hearth
                        </Link>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes rise {
                    0% { transform: translateY(0) translateX(0); opacity: 0; }
                    10% { opacity: 0.8; }
                    80% { opacity: 0.4; }
                    100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
