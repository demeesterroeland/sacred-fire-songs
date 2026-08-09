'use client';

import React from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';

export interface AuthorPillProps {
  author: string;
  variant?: 'badge' | 'filter';
  selected?: boolean;
  count?: number;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function AuthorPill({
  author,
  variant = 'badge',
  selected = false,
  count,
  onClick,
  href,
  className = '',
}: AuthorPillProps) {
  const displayAuthor = author?.trim() || 'Traditional';
  const targetHref = href || `/songs?artist=${encodeURIComponent(displayAuthor)}`;

  const baseStyles =
    'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 select-none border cursor-pointer active:scale-95';

  let variantStyles = '';
  if (variant === 'badge') {
    variantStyles =
      'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20 dark:hover:bg-indigo-500/30 shadow-xs';
  } else if (selected) {
    variantStyles =
      'bg-indigo-600 text-white border-indigo-600 shadow-md ring-1 ring-indigo-500/50';
  } else {
    variantStyles =
      'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700';
  }

  const content = (
    <>
      <User className="w-3 h-3 shrink-0 opacity-80" />
      <span>{displayAuthor}</span>
      {typeof count === 'number' && (
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
            selected
              ? 'bg-white/20 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
        >
          {count}
        </span>
      )}
    </>
  );

  if (targetHref && !onClick) {
    return (
      <Link href={targetHref} className={`${baseStyles} ${variantStyles} ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {content}
    </button>
  );
}
