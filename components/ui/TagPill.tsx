'use client';

import React from 'react';
import Link from 'next/link';
import { Tag, Check } from 'lucide-react';

export interface TagPillProps {
  label: string;
  categorySlug?: string;
  variant?: 'badge' | 'filter' | 'selectable';
  selected?: boolean;
  count?: number;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function TagPill({
  label,
  variant = 'badge',
  selected = false,
  count,
  onClick,
  href,
  className = '',
}: TagPillProps) {
  const baseStyles =
    'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 select-none';

  let variantStyles = '';

  if (variant === 'badge') {
    variantStyles =
      'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/60 cursor-pointer active:scale-95';
  } else if (variant === 'filter') {
    if (selected) {
      variantStyles =
        'bg-red-600 text-white shadow-md shadow-red-600/20 hover:bg-red-700 cursor-pointer active:scale-95';
    } else {
      variantStyles =
        'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-750 cursor-pointer active:scale-95';
    }
  } else if (variant === 'selectable') {
    if (selected) {
      variantStyles =
        'bg-red-500/10 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-500/50 shadow-sm cursor-pointer';
    } else {
      variantStyles =
        'bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 border border-gray-200/80 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 cursor-pointer';
    }
  }

  const content = (
    <>
      {variant === 'selectable' && selected && (
        <Check className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
      )}
      {variant === 'badge' && (
        <Tag className="w-3 h-3 text-red-500/80 dark:text-red-400/80 shrink-0" />
      )}
      <span>{label}</span>
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

  if (href) {
    return (
      <Link href={href} className={`${baseStyles} ${variantStyles} ${className}`}>
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
