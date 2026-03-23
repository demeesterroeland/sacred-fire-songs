'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { useActivePath } from '@/hooks/useActivePath';

interface NavLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  exclude?: readonly string[];
  onClick?: () => void;
  layout?: 'sidebar' | 'mobile';
  showText?: boolean;
}

export const NavLink = ({
  href,
  label,
  icon: Icon,
  exact,
  exclude,
  onClick,
  layout = 'sidebar',
  showText = true,
}: NavLinkProps) => {
  const { isActive } = useActivePath();
  const active = isActive(href, { exact, exclude });

  const isMobile = layout === 'mobile';

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 transition-colors ${isMobile
        ? `px-4 py-3 rounded-xl ${active ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-800/50'}`
        : `px-3 py-2 rounded-lg ${active ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-800/50'}`
        }`}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-red-500' : ''}`} />
      {showText && label}
    </Link>
  );
};
