'use client';

import { useActivePath } from '@/hooks/useActivePath';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/hooks/useAuth';
import { NAV_SECTIONS } from '@/lib/navigation';
import { useLocale } from '@/context/LocaleContext';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/common/navigation/LanguageSwitcher';
import packageJson from '@/package.json';

export default function Sidebar() {
    const { t } = useLocale();
    const { isActive } = useActivePath();
    const { isOpen, setIsOpen } = useSidebar();
    const { user } = useAuth();

    return (
        <nav
            aria-label={t('nav.mainNavigation')}
            className={`
                fixed lg:sticky top-[var(--navbar-height)] left-0 z-40
                h-[calc(100dvh-var(--navbar-height))]
                w-0 lg:w-64 overflow-y-auto overflow-x-hidden
                pt-8 bg-bg transition-all duration-200
                ${isOpen ? 'w-64 shadow-2xl border-r border-line' : ''}
            `}
            onClick={(e) => {
                // Close on mobile when clicking a link
                if (isOpen && (e.target as HTMLElement).closest('a')) {
                    setIsOpen(false);
                }
            }}
        >
            <div className="pe-6 flex flex-col gap-1 min-h-full justify-between pb-6">
                <div className="flex flex-col gap-1">
                    {NAV_SECTIONS.map((section, sIdx) => {
                        const sectionLabel = section.labelKey ? t(section.labelKey) : section.label;
                        return (
                            <div key={sIdx}>
                                {/* Section header */}
                                {sectionLabel && (
                                    <p className="text-meta font-semibold text-fg-muted ps-7 pt-5 pb-2">
                                        {sectionLabel}
                                    </p>
                                )}

                                {/* Nav items */}
                                {section.items.map((item) => {
                                    const active = isActive(item.href, {
                                        exact: 'exact' in item ? item.exact : false,
                                        exclude: 'exclude' in item ? item.exclude : [],
                                    });
                                    const Icon = item.icon;
                                    const itemLabel = item.labelKey ? t(item.labelKey) : item.label;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`
                                                flex items-center gap-4 ps-7 pe-4 py-2.5 me-2 rounded-control
                                                text-meta font-medium transition-colors
                                                ${active
                                                    ? 'bg-surface-2 text-fg font-semibold'
                                                    : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
                                                }
                                            `}
                                        >
                                            <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-accent' : ''}`} />
                                            <span>{itemLabel}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        );
                    })}

                    {/* Admin Section */}
                    {user?.role === 'admin' && (
                        <div>
                            <p className="text-meta font-semibold text-fg-muted ps-7 pt-5 pb-2">
                                {t('nav.administration')}
                            </p>
                            <Link
                                href="/admin/users"
                                className={`
                                    flex items-center gap-4 ps-7 pe-4 py-2.5 me-2 rounded-control
                                    text-meta font-medium transition-colors
                                    ${isActive('/admin/users')
                                        ? 'bg-surface-2 text-fg font-semibold'
                                        : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
                                    }
                                `}
                            >
                                <ShieldCheck className={`w-5 h-5 shrink-0 ${isActive('/admin/users') ? 'text-accent' : ''}`} />
                                <span>{t('nav.adminUsers')}</span>
                            </Link>
                        </div>
                    )}
                </div>

                <div className="ps-7 pe-4 pt-6 border-t border-line mt-auto flex flex-col gap-3">
                    {/* Language switcher — also reachable for guests */}
                    <LanguageSwitcher variant="full" className="-ms-2.5" />

                    {/* Application SemVer Version Tag */}
                    <div>
                        <span className="inline-flex items-center gap-1.5 text-caption font-medium text-fg-muted hover:text-fg transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-fg-muted" />
                            {process.env.NEXT_PUBLIC_APP_VERSION ? (
                                <span>
                                    {process.env.NEXT_PUBLIC_APP_VERSION.replace(/-([a-f0-9]{40})$/, (match, p1) => `-${p1.substring(0, 7)}`)}
                                </span>
                            ) : (
                                <span>v{packageJson.version}</span>
                            )}
                        </span>
                    </div>
                </div>
            </div>
        </nav>
    );
}
