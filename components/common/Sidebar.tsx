'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Flame, IndentDecrease } from 'lucide-react';
import DevTools from '@/components/dev/DevTools';
import LibrarySidebar from '../library/LibrarySidebar';
import { useEnvironment } from '@/hooks/useEnvironment';
import { useActivePath } from '@/hooks/useActivePath';
import { UserProfile } from './navigation/UserProfile';
import { NavLink } from './navigation/NavLink';
import { NAV_ITEMS } from '@/lib/navigation';
import { useSidebar } from '@/context/SidebarContext';
import { getSiteTitle } from '@/lib/env';

export default function Sidebar() {
    const env = useEnvironment();
    const { pathname } = useActivePath();
    const { isOpen, setIsOpen } = useSidebar();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`
                    fixed lg:sticky top-0 left-0 h-screen z-50
                    flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    w-[260px]
                `}
            >
                {/* Header: Logo & Branding */}
                <div className="p-4 flex items-center border-b border-gray-800/50 bg-gray-900/50 h-[72px] justify-between">
                    <Link href="/" className="flex items-center gap-3 group/logo shrink-0" onClick={() => setIsOpen(false)}>
                        <div className="w-10 h-10 bg-gradient-to-br from-red-700 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-red-900/30 ring-1 ring-white/10 group-hover/logo:scale-110 transition-transform">
                            <Flame className="text-white w-6 h-6 fill-current" />
                        </div>
                        {/* Title: Only on Desktop. Hide on Mobile Drawer as requested. */}
                        <div className="hidden lg:flex flex-col">
                            <span className="font-bold text-lg leading-tight text-white tracking-tight group-hover/logo:text-red-500 transition-colors">
                                {getSiteTitle()}
                            </span>
                        </div>
                    </Link>

                    {/* Mobile Close Toggle - Positioned at Top Right of Sidebar */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden flex items-center gap-2 text-gray-400 hover:text-white transition-colors p-1.5 pr-3 rounded-xl hover:bg-gray-800 group border border-transparent hover:border-gray-700"
                        title="Close Menu"
                    >
                        <IndentDecrease className="w-6 h-6" />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Close</span>
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-6">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.href}
                            href={item.href}
                            label={item.label}
                            icon={item.icon}
                            exact={'exact' in item ? item.exact : false}
                            exclude={'exclude' in item ? item.exclude : []}
                            layout="sidebar"
                            showText={true}
                            onClick={() => setIsOpen(false)}
                        />
                    ))}

                    {/* Filters (Dynamic Taxonomy) */}
                    {pathname === '/songs' && (
                        <div className="mt-6 pt-6 border-t border-gray-800/50">
                            <Suspense fallback={<div className="text-gray-500 text-xs px-4">Loading filters...</div>}>
                                <LibrarySidebar />
                            </Suspense>
                        </div>
                    )}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800/30 bg-gray-950/20">
                    <p className="text-[9px] text-center font-mono uppercase tracking-[0.2em] opacity-20 mt-2">
                        Sacred Fire v1.0
                    </p>
                </div>
            </aside>
        </>
    );
}
