'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { libraryTabs } from '@/lib/navigation';
import { useLocale } from '@/context/LocaleContext';

export default function LibraryTabs() {
    const { t } = useLocale();
    const pathname = usePathname();

    // Story 6.1.23 (#407): only working tabs; Albums is hidden (UXD-4).
    const tabs = libraryTabs().map((tab) => ({ ...tab, label: t(tab.labelKey) }));

    // Detail page = a tab's href + at least one more path segment
    const parentTab = tabs.find(t => pathname?.startsWith(t.href + '/'));

    if (parentTab) {
        // Breadcrumb only — no heading, no tabs
        return (
            <nav aria-label={t('nav.library')} className="mb-8">
                <div className="flex items-center gap-1.5 text-meta text-fg-muted">
                    <Link href={parentTab.href} className="inline-flex min-h-tap items-center hover:text-fg transition-colors">
                        {t('nav.library')}
                    </Link>
                    <ChevronRight className="size-3.5 shrink-0" aria-hidden />
                    <Link href={parentTab.href} className="inline-flex min-h-tap items-center hover:text-fg transition-colors">
                        {parentTab.label}
                    </Link>
                </div>
            </nav>
        );
    }

    // List page — full heading + tabs
    return (
        <>
            <header className="hidden md:block mb-12">
                <h1 className="text-display font-semibold tracking-tight mb-2 text-fg">{t('library.heading')}</h1>
                <p className="text-body text-fg-muted">{t('library.subtitle')}</p>
            </header>
            <nav aria-label={t('nav.library')} className="relative mb-8">
                <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
                    {tabs.map(({ label, href, icon: Icon }) => {
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                aria-current={isActive ? 'page' : undefined}
                                className={`inline-flex min-h-tap items-center gap-1.5 px-4 rounded-pill text-meta font-semibold whitespace-nowrap shrink-0 transition-colors ${
                                    isActive
                                        ? 'bg-chip-active text-on-chip-active'
                                        : 'bg-chip text-on-chip hover:bg-line'
                                }`}
                            >
                                <Icon className="size-4" aria-hidden />
                                {label}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
