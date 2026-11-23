'use client';

import Link from 'next/link';
import { ArrowLeft, Flame } from 'lucide-react';
import { useState } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { Button } from '@/components/ui/button';

export default function AccessDenied() {
    const { t } = useLocale();
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
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-bg">

            {/* Ambient glowing embers background */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                {embers.map((ember) => (
                    <div
                        key={ember.id}
                        className="absolute w-0.5 h-0.5 bg-line-strong rounded-full opacity-0 animate-[rise_infinite_linear]"
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
                        <Flame className="size-4 text-fg-muted" />
                        <span className="text-meta text-fg-muted font-semibold">{t('app.name')}</span>
                    </div>
                </div>

                {/* Central Icon */}
                <div className="mb-8 relative inline-block">
                    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="size-20 text-danger"
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
                <h1 className="text-display font-bold text-fg mb-4">
                    <>{t('feedback.accessDenied.title')}</>
                </h1>

                <p className="text-fg-muted text-body mb-10">
                    {t('feedback.accessDenied.description')}
                </p>

                {/* Action Button */}
                <Button asChild>
                    <Link href="/">
                        <ArrowLeft />
                        <span>{t('feedback.accessDenied.returnToCircle')}</span>
                    </Link>
                </Button>

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
