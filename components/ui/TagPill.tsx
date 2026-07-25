'use client';

import React from 'react';
import Link from 'next/link';
import { Tag, Check } from 'lucide-react';
import { getCategoryColor, getCategoryStyles } from '@/lib/uiUtils';

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
  categorySlug,
  variant = 'badge',
  selected = false,
  count,
  onClick,
  href,
  className = '',
}: TagPillProps) {
  const baseStyles =
    'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 select-none border';

  const colorKey = categorySlug ? getCategoryColor(categorySlug) : 'gray';
  const categoryStyles = getCategoryStyles(colorKey);

  let variantStyles = '';

  if (variant === 'badge') {
    variantStyles = `${categoryStyles.pill} hover:opacity-80 cursor-pointer active:scale-95`;
  } else if (variant === 'filter') {
    if (selected) {
      variantStyles = `${categoryStyles.active} shadow-md cursor-pointer active:scale-95`;
    } else {
      variantStyles = `${categoryStyles.inactive} cursor-pointer active:scale-95`;
    }
  } else if (variant === 'selectable') {
    if (selected) {
      variantStyles = `${categoryStyles.active} shadow-md ring-1 ring-white/20 cursor-pointer active:scale-95`;
    } else {
      variantStyles = `${categoryStyles.inactive} hover:brightness-110 cursor-pointer active:scale-95`;
    }
  }

  const content = (
    <>
      {variant === 'selectable' && selected && (
        <Check className="w-3.5 h-3.5 shrink-0 opacity-95 stroke-[2.5]" />
      )}
      {variant === 'badge' && (
        <Tag className="w-3 h-3 shrink-0 opacity-80" />
      )}
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
            selected
              ? 'bg-white/20 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
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
