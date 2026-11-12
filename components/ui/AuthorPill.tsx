'use client';

import React from 'react';
import { User, X } from 'lucide-react';
import { tagPillClasses } from '@/lib/design/tagStyles';
import { BasePill } from './BasePill';

export interface AuthorPillProps {
  author: string;
  variant?: 'badge' | 'filter';
  selected?: boolean;
  count?: number;
  onClick?: () => void;
  onRemove?: () => void;
  /** Accessible name of the remove control, e.g. t('songForm.artists.remove', { name }). Required with onRemove. */
  removeLabel?: string;
  href?: string;
  title?: string;
  className?: string;
}

/** Author pill (Story 6.1.35, #485): the same neutral style as a tag pill. */
export function AuthorPill({
  author,
  variant = 'badge',
  selected = false,
  count,
  onClick,
  onRemove,
  removeLabel,
  href,
  title,
  className = '',
}: AuthorPillProps) {
  const displayAuthor = author?.trim() ?? '';
  if (!displayAuthor) return null;
  const isInteractive = Boolean(href || onClick);
  const isToggle = variant === 'filter';
  const variantStyles = tagPillClasses({ selected: isToggle && selected, interactive: isInteractive });

  const removeButton = onRemove ? (
    <span
      role="button"
      tabIndex={0}
      aria-label={removeLabel}
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }
      }}
      className="ml-0.5 -mr-1 p-0.5 rounded-pill text-fg-muted hover:bg-line hover:text-fg transition-colors"
      title={removeLabel}
    >
      <X aria-hidden="true" className="w-3 h-3" />
    </span>
  ) : undefined;

  return (
    <BasePill
      label={displayAuthor}
      icon={<User aria-hidden="true" className="w-3 h-3 shrink-0 opacity-80" />}
      count={count}
      href={href}
      onClick={onClick}
      title={title}
      pressed={isToggle && onClick ? selected : undefined}
      variantStyles={variantStyles}
      className={className}
    >
      {removeButton}
    </BasePill>
  );
}
