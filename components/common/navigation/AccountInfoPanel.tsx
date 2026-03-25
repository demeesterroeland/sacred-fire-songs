'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, Settings, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import QuickLogin from '@/components/dev/QuickLogin';

export function AccountInfoPanel() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close on Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    if (!user) {
        return (
            <Link
                href={`/auth/login?next=${encodeURIComponent(pathname)}`}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium text-sm transition-colors"
            >
                Sign In
            </Link>
        );
    }

    const displayName = user.full_name || user.email?.split('@')[0] || 'Member';
    const initials = displayName.substring(0, 1).toUpperCase();
    const isAdmin = user.role === 'admin';

    return (
        <div className="relative" ref={panelRef}>
            {/* Avatar trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex ps-2"
                title={`${displayName} (${user.email})`}
            >
                <div className={`
                    w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                    overflow-hidden relative shadow-md transition-colors
                    ${isOpen
                        ? 'ring-2 ring-red-500 dark:ring-red-400'
                        : 'ring-2 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600'
                    }
                    bg-gradient-to-br from-green-500 to-green-600 text-white
                `}>
                    {user.avatar_url ? (
                        <Image
                            src={user.avatar_url}
                            alt={displayName}
                            fill
                            className="object-cover"
                            sizes="36px"
                        />
                    ) : (
                        initials
                    )}
                </div>
            </button>

            {/* Dropdown panel */}
            {isOpen && (
                <div className="absolute z-50 end-0 top-14 w-[min(360px,calc(100vw-40px))] rounded-3xl bg-gray-100 dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User identity card */}
                    <div className="mx-4 mt-4 flex flex-col items-center justify-center gap-3 rounded-t-3xl bg-white dark:bg-gray-800/60 p-6">
                        {/* Large avatar */}
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg overflow-hidden relative">
                                {user.avatar_url ? (
                                    <Image
                                        src={user.avatar_url}
                                        alt={displayName}
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                    />
                                ) : (
                                    initials
                                )}
                            </div>
                        </div>

                        {/* Name + email */}
                        <div className="text-center">
                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                                {displayName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                            </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-1.5 w-full max-w-[220px]">
                            <Link
                                href="/account/settings"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                                Account Settings
                            </Link>
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <Shield className="w-4 h-4" />
                                    Administration
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Sign out */}
                    <div className="mx-4 mb-4 flex flex-col">
                        <button
                            onClick={async () => {
                                await logout();
                                setIsOpen(false);
                                router.refresh();
                            }}
                            className="flex items-center justify-center gap-2 rounded-b-3xl bg-white dark:bg-gray-800/60 p-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>

                    {/* Dev tools */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="px-6 pb-4 border-t border-gray-200/50 dark:border-gray-800/50 pt-3">
                            <QuickLogin />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
