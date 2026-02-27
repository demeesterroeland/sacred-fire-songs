'use client';

import Link from 'next/link';
import { ArrowLeft, Flame, Hand } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AccessDenied() {
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

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[radial-gradient(circle_at_center,_#111827_0%,_#030712_100%)]">

            {/* Ambient glowing embers background */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                {embers.map((ember) => (
                    <div
                        key={ember.id}
                        className="absolute w-0.5 h-0.5 bg-red-500 rounded-full opacity-0 animate-[rise_infinite_linear]"
                        style={{
                            left: `${ember.left}%`,
                            bottom: '-10px',
                            animationDuration: `${ember.duration}s`,
                            animationDelay: `${ember.delay}s`,
                            animationName: 'rise'
                        }}
                    />
                ))}
            </div>

            {/* Main Card */}
            <div className="relative z-10 max-w-md w-full text-center p-8">

                {/* Header Logo (Small) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-24 opacity-50">
                    <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-red-500" />
                        <span className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold">Sacred Fire Songs</span>
                    </div>
                </div>

                {/* Central Icon */}
                <div className="mb-8 relative inline-block">
                    {/* Background glow circle */}
                    <div className="absolute inset-0 bg-red-600/10 blur-3xl rounded-full"></div>

                    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="w-20 h-20 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a.9.9 0 0 1 0-1.27l2.49-2.48a.9.9 0 0 1 1.28 0l1.72 1.72h.1" />
                            <circle cx="12" cy="14" r="1.5" fill="currentColor" className="opacity-80" />
                            <path d="M10 14c0-1.1.9-2 2-2s2 .9 2 2" strokeWidth="1" />
                            <path d="M10 14c0 1.1.9 2 2 2s2-.9 2-2" strokeWidth="1" />
                        </svg>
                    </div>
                </div>

                {/* Text Content */}
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 mb-4">
                    This Medicine is <br /> Not Yours to Edit
                </h1>

                <p className="text-gray-500 text-lg mb-10 font-light">
                    Only the song keeper may change its form.
                </p>

                {/* Action Button */}
                <Link href="/" className="group relative inline-flex items-center justify-center px-8 py-3.5 font-bold text-white transition-all duration-200 bg-gradient-to-r from-red-700 to-orange-600 rounded-xl hover:from-red-600 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 focus:ring-offset-gray-900 overflow-hidden">
                    {/* Button inner glow/shine */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span>Return to the Circle</span>
                </Link>

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
