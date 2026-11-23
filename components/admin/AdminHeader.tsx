'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, FilePenLine, Settings as SettingsIcon, ChevronRight } from 'lucide-react';

import { useLocale } from '@/context/LocaleContext';
import type { TranslationKey } from '@/lib/i18n';
const tabs: { labelKey: TranslationKey; href: string; icon: typeof Users; planned: boolean }[] = [
  { labelKey: 'admin.tab.users', href: '/admin/users', icon: Users, planned: false },
  { labelKey: 'admin.tab.catalogEdits', href: '/admin/catalog-edits', icon: FilePenLine, planned: false },
  { labelKey: 'admin.tab.configuration', href: '/admin/configuration', icon: SettingsIcon, planned: true },
];

/**
 * Admin area heading, following the Library pattern (app/library/LibraryTabs.tsx):
 * list pages get a title and pill tabs, detail pages a breadcrumb.
 */
export default function AdminHeader() {
  const { t } = useLocale();
  const pathname = usePathname();
  const parentTab = tabs.find((t) => pathname?.startsWith(t.href + '/'));

  if (parentTab) {
    return (
      <nav aria-label={t('admin.breadcrumb')} className="mb-8">
        <div className="flex items-center gap-1.5 text-meta text-fg-muted">
          <Link href="/admin/users" className="hover:text-fg transition-colors">
            {t('admin.title')}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link href={parentTab.href} className="hover:text-fg transition-colors">
            {t(parentTab.labelKey)}
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <>
      <header className="mb-8 md:mb-12">
        <h1 className="text-title font-bold mb-2 text-fg">
          {t('admin.title')}
        </h1>
        <p className="text-fg-muted">
          {t('admin.subtitle')}
        </p>
      </header>
      <nav aria-label={t('admin.nav.label')} className="relative mb-8">
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 md:mx-0 md:px-0">
          {tabs.map(({ labelKey, href, icon: Icon, planned }) => {
            const isActive = pathname === href;
            if (planned) {
              return (
                <span
                  key={href}
                  aria-disabled="true"
                  title={t('admin.planned')}
                  className="flex min-h-tap items-center gap-1.5 px-4 py-1.5 rounded-pill text-meta font-bold whitespace-nowrap shrink-0 bg-surface text-fg-subtle border border-line cursor-not-allowed"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t(labelKey)}
                  <span className="text-caption">· {t('admin.planned')}</span>
                </span>
              );
            }
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-tap items-center gap-1.5 px-4 py-1.5 rounded-pill text-meta font-bold transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-chip-active text-on-chip-active'
                    : 'bg-chip text-on-chip hover:bg-line border border-line'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t(labelKey)}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
