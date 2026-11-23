'use client';

import React from 'react';
import { Tag, Check } from 'lucide-react';
import { tagPillClasses } from '@/lib/design/tagStyles';
import { BasePill } from './BasePill';

export interface TagPillProps {
  label: string;
  variant?: 'badge' | 'filter' | 'selectable';
  selected?: boolean;
  count?: number;
  onClick?: () => void;
  href?: string;
  title?: string;
  className?: string;
}

/**
 * Category tag (Story 6.1.35, #485): one neutral style for every category. A selected `filter` or `selectable`
 * tag shows inverted greys; a selected `selectable` tag also shows a check, and toggles announce `aria-pressed`.
 * No emoji: tag names are plain text (owner decision Nov 24, 2026).
 */
export function TagPill({
  label,
  variant = 'badge',
  selected = false,
  count,
  onClick,
  href,
  title,
  className = '',
}: TagPillProps) {
  const isInteractive = Boolean(href || onClick);
  const isToggle = variant !== 'badge';
  const variantStyles = tagPillClasses({ selected: isToggle && selected, interactive: isInteractive });

  const icon = (
    <>
      {variant === 'selectable' && selected && (
        <Check aria-hidden="true" className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
      )}
      {variant === 'badge' && <Tag aria-hidden="true" className="w-3 h-3 shrink-0 opacity-80" />}
    </>
  );

  return (
    <BasePill
      label={label}
      icon={icon}
      count={count}
      href={href}
      onClick={onClick}
      title={title}
      pressed={isToggle && onClick ? selected : undefined}
      variantStyles={variantStyles}
      className={className}
    />
  );
}
