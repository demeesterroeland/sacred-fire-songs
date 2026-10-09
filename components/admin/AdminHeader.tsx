'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Users, Settings as SettingsIcon } from 'lucide-react';

export default function AdminHeader() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Users',
      href: '/admin/users',
      icon: Users,
      active: pathname.startsWith('/admin/users'),
    },
    {
      label: 'Configuration & Settings',
      href: '/admin/configuration',
      icon: SettingsIcon,
      active: pathname.startsWith('/admin/configuration'),
      badge: 'Planned',
    },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur sticky top-[var(--navbar-height)] z-30">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  Administration
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/50">
                  Admin Portal
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage users, view contributions, and monitor community health.
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0" aria-label="Admin Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.badge ? '#' : item.href}
                  className={`
                    flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all whitespace-nowrap
                    ${item.active
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-900/20'
                      : item.badge
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed hover:bg-transparent'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                  onClick={(e) => {
                    if (item.badge) {
                      e.preventDefault();
                    }
                  }}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
