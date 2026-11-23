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
        ? `px-4 py-3 rounded-control ${active ? 'bg-surface-2 text-fg font-bold' : 'text-fg-muted hover:text-fg hover:bg-surface-2'}`
        : `px-3 py-2 rounded-control ${active ? 'bg-surface-2 text-fg font-medium' : 'text-fg-muted hover:text-fg hover:bg-surface-2'}`
        }`}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-accent' : ''}`} />
      {showText && label}
    </Link>
  );
};
