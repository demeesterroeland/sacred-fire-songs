'use client';

import { useActivePath } from '@/hooks/useActivePath';
import { useSidebar } from '@/context/SidebarContext';
import { NAV_SECTIONS } from '@/lib/navigation';
import Link from 'next/link';

export default function Sidebar() {
    const { isActive } = useActivePath();
    const { isOpen, setIsOpen } = useSidebar();

    return (
        <nav
            aria-label="Main navigation"
            className={`
                fixed lg:sticky top-[var(--navbar-height)] left-0 z-40
                h-[calc(100dvh-var(--navbar-height))]
                w-0 lg:w-64 overflow-y-auto overflow-x-hidden
                pt-8 bg-white dark:bg-gray-950 transition-all duration-200
                ${isOpen ? 'w-64 shadow-2xl border-r border-gray-200 dark:border-gray-800' : ''}
            `}
            onClick={(e) => {
                // Close on mobile when clicking a link
                if (isOpen && (e.target as HTMLElement).closest('a')) {
                    setIsOpen(false);
                }
            }}
        >
            <div className="pe-6 flex flex-col gap-1 min-h-full">
                {NAV_SECTIONS.map((section, sIdx) => (
                    <div key={sIdx}>
                        {/* Section header */}
                        {section.label && (
                            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 ps-7 pt-5 pb-2">
                                {section.label}
                            </p>
                        )}

                        {/* Nav items */}
                        {section.items.map((item) => {
                            const active = isActive(item.href, {
                                exact: 'exact' in item ? item.exact : false,
                                exclude: 'exclude' in item ? item.exclude : [],
                            });
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        flex items-center gap-4 ps-7 pe-4 py-2.5 me-2 rounded-e-full
                                        text-sm font-medium transition-colors
                                        ${active
                                            ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white'
                                        }
                                    `}
                                >
                                    <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-red-600 dark:text-red-400' : ''}`} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                ))}

            </div>
        </nav>
    );
}
