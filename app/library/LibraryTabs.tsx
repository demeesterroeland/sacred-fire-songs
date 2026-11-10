'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { libraryTabs } from '@/lib/navigation';
import { useLocale } from '@/context/LocaleContext';
import LibraryCreateButton from './LibraryCreateButton';
import { SharedWithMeLink } from '@/components/library/SharedWithMeLink';

export default function LibraryTabs() {
    const { t } = useLocale();
    const pathname = usePathname();
    const activeRef = useRef<HTMLAnchorElement>(null);

    // Validation 4: five tabs are wider than a phone, so the row scrolls; keep the open tab in view.
    useEffect(() => {
        activeRef.current?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    }, [pathname]);

    // Story 6.1.23 (#407): only working tabs; Albums is hidden (UXD-4).
    const tabs = libraryTabs().map((tab) => ({ ...tab, label: t(tab.labelKey) }));

    // Detail page = a tab's href + at least one more path segment
    const parentTab = tabs.find(t => pathname?.startsWith(t.href + '/'));

    // Story 6.1.19 (#403): "Shared with me" is entered from a row under the tabs, not a tab of its own.
    if (pathname === '/library/shared') {
        return (
            <nav aria-label={t('nav.library')} className="mb-8">
                <div className="flex items-center gap-1.5 text-meta text-fg-muted">
                    <Link href="/library" className="inline-flex min-h-tap items-center hover:text-fg transition-colors">
                        {t('nav.library')}
                    </Link>
                    <ChevronRight className="size-3.5 shrink-0" aria-hidden />
                    <span aria-current="page" className="inline-flex min-h-tap items-center text-fg">
                        {t('sharedWithMe.title')}
                    </span>
                </div>
            </nav>
        );
    }

    if (parentTab) {
        // Breadcrumb only — no heading, no tabs
        return (
            <nav aria-label={t('nav.library')} className="mb-8">
                <div className="flex items-center gap-1.5 text-meta text-fg-muted">
                    <Link href="/library" className="inline-flex min-h-tap items-center hover:text-fg transition-colors">
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
            <div className="mb-2 md:hidden">
                <h1 className="text-title font-semibold tracking-tight text-fg">{t('library.heading')}</h1>
            </div>
            <header className="mb-12 hidden md:block">
                <h1 className="text-display font-semibold tracking-tight mb-2 text-fg">{t('library.heading')}</h1>
                <p className="text-body text-fg-muted">{t('library.subtitle')}</p>
            </header>
            {/* One floating "+" (phones and tablets); from lg the header's Create menu does the same. */}
            <LibraryCreateButton />
            <nav aria-label={t('nav.library')} className="relative mb-8">
                <div className="flex gap-2 overflow-x-auto scrollbar-none scroll-px-4 -mx-4 px-4 md:mx-0 md:px-0 md:scroll-px-0">
                    {tabs.map(({ label, href, icon: Icon }) => {
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={href}
                                ref={isActive ? activeRef : undefined}
                                href={href}
                                aria-current={isActive ? 'page' : undefined}
                                className={`inline-flex min-h-tap items-center gap-1.5 px-3.5 rounded-pill text-meta font-semibold whitespace-nowrap shrink-0 transition-colors ${
                                    isActive
                                        ? 'bg-chip-active text-on-chip-active'
                                        : 'bg-chip text-on-chip hover:bg-line'
                                }`}
                            >
                                <Icon className="hidden sm:block size-4" aria-hidden />
                                {label}
                            </Link>
                        );
                    })}
                </div>
                {/* Edge fade: hints that the row scrolls if a locale's labels are wider than the phone. */}
                <div aria-hidden className="pointer-events-none absolute inset-y-0 -right-4 w-6 bg-gradient-to-l from-bg to-transparent md:hidden" />
            </nav>
            <SharedWithMeLink />
        </>
    );
}
