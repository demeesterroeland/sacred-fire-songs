'use client';

import React from 'react';
import { Tag, Check } from 'lucide-react';
import { getCategoryColor, getCategoryStyles } from '@/lib/uiUtils';
import { BasePill } from './BasePill';

export interface TagPillProps {
  label: string;
  categorySlug?: string;
  emoji?: string;
  variant?: 'badge' | 'filter' | 'selectable';
  selected?: boolean;
  count?: number;
  onClick?: () => void;
  href?: string;
  title?: string;
  className?: string;
}

export function TagPill({
  label,
  categorySlug,
  emoji,
  variant = 'badge',
  selected = false,
  count,
  onClick,
  href,
  title,
  className = '',
}: TagPillProps) {
  const colorKey = categorySlug ? getCategoryColor(categorySlug) : 'gray';
  const categoryStyles = getCategoryStyles(colorKey);

  let variantStyles = '';

  if (variant === 'badge') {
    variantStyles = `${categoryStyles.pill} hover:opacity-80`;
  } else if (variant === 'filter') {
    variantStyles = selected ? `${categoryStyles.active} shadow-md` : `${categoryStyles.inactive}`;
  } else if (variant === 'selectable') {
    variantStyles = selected
      ? `${categoryStyles.active} shadow-md ring-1 ring-white/20`
      : `${categoryStyles.inactive} hover:brightness-110`;
  }

  const icon = (
    <>
      {variant === 'selectable' && selected && (
        <Check className="w-3.5 h-3.5 shrink-0 opacity-95 stroke-[2.5]" />
      )}
      {emoji ? (
        <span className="text-xs shrink-0 leading-none">{emoji}</span>
      ) : variant === 'badge' ? (
        <Tag className="w-3 h-3 shrink-0 opacity-80" />
      ) : null}
    </>
  );

  const isInteractive = Boolean(href || onClick);
  const computedTitle = title ?? (isInteractive ? `Filter songs tagged with "${label}"` : undefined);

  return (
    <BasePill
      label={label}
      icon={icon}
      count={count}
      href={href}
      onClick={onClick}
      title={computedTitle}
      variantStyles={variantStyles}
      className={className}
    />
  );
}
