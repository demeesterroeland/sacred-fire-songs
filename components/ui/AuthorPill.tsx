'use client';

import React from 'react';
import { User, X } from 'lucide-react';
import { BasePill } from './BasePill';

export interface AuthorPillProps {
  author: string;
  variant?: 'badge' | 'filter';
  selected?: boolean;
  count?: number;
  onClick?: () => void;
  onRemove?: () => void;
  href?: string;
  title?: string;
  className?: string;
}

export function AuthorPill({
  author,
  variant = 'badge',
  selected = false,
  count,
  onClick,
  onRemove,
  href,
  title,
  className = '',
}: AuthorPillProps) {
  const displayAuthor = author?.trim() || 'Traditional';

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

  const removeButton = onRemove ? (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.stopPropagation();
          onRemove();
        }
      }}
      className="ml-0.5 -mr-1 p-0.5 rounded-full hover:bg-indigo-500/20 dark:hover:bg-indigo-400/30 text-indigo-600 dark:text-indigo-300 transition-colors"
      title={`Remove ${displayAuthor}`}
    >
      <X className="w-3 h-3" />
    </span>
  ) : undefined;

  const isInteractive = Boolean(href || onClick);
  const computedTitle =
    title ?? (isInteractive ? `Filter songs by artist "${displayAuthor}"` : undefined);

  return (
    <BasePill
      label={displayAuthor}
      icon={<User className="w-3 h-3 shrink-0 opacity-80" />}
      count={count}
      href={href}
      onClick={onClick}
      title={computedTitle}
      variantStyles={variantStyles}
      className={className}
    >
      {removeButton}
    </BasePill>
  );
}
