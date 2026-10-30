'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Settings as SettingsIcon, ChevronRight } from 'lucide-react';

const tabs = [
  { label: 'Users', href: '/admin/users', icon: Users, planned: false },
  { label: 'Configuration', href: '/admin/configuration', icon: SettingsIcon, planned: true },
];

/**
 * Admin area heading, following the Library pattern (app/library/LibraryTabs.tsx):
 * list pages get a title and pill tabs, detail pages a breadcrumb.
 */
export default function AdminHeader() {
  const pathname = usePathname();
  const parentTab = tabs.find((t) => pathname?.startsWith(t.href + '/'));

  if (parentTab) {
    return (
      <nav aria-label="Breadcrumb" className="mb-8">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Link href="/admin/users" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            Administration
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link href={parentTab.href} className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            {parentTab.label}
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <>
      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-gray-900 dark:text-white">
          Administration
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage users, view contributions, and monitor community activity.
        </p>
      </header>
      <nav aria-label="Admin navigation" className="relative mb-8">
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 md:mx-0 md:px-0">
          {tabs.map(({ label, href, icon: Icon, planned }) => {
            const isActive = pathname === href;
            if (planned) {
              return (
                <span
                  key={href}
                  aria-disabled="true"
                  title="Planned"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap shrink-0 bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600 border border-gray-200/50 dark:border-gray-800/50 cursor-not-allowed"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  <span className="text-[9px] uppercase tracking-wider">· Planned</span>
                </span>
              );
            }
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-950'
                    : 'bg-gray-200/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white border border-gray-300/50 dark:border-gray-700/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
