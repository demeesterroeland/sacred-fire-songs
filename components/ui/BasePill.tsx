'use client';

import React from 'react';
import Link from 'next/link';
import { formatCount } from '@/lib/format/count';

export interface BasePillProps {
  label: string;
  icon?: React.ReactNode;
  count?: number;
  href?: string;
  onClick?: () => void;
  title?: string;
  /** Toggle pills (a selectable tag): announced as pressed / not pressed. */
  pressed?: boolean;
  variantStyles?: string;
  className?: string;
  children?: React.ReactNode;
}

export function BasePill({
  label,
  icon,
  count,
  href,
  onClick,
  title,
  pressed,
  variantStyles = '',
  className = '',
  children,
}: BasePillProps) {
  const baseStyles =
    'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-pill transition-colors duration-200 select-none border';

  const isInteractive = Boolean(href || onClick);
  const cursorStyle = isInteractive ? 'cursor-pointer active:scale-95' : '';
  const combinedClassName = `${baseStyles} ${cursorStyle} ${variantStyles} ${className}`.trim();

  const content = (
    <>
      {icon}
      <span>{label}</span>
      {typeof count === 'number' && (
        <span className="text-caption tabular-nums">{formatCount(count)}</span>
      )}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClassName} title={title}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-pressed={pressed} className={combinedClassName} title={title}>
        {content}
      </button>
    );
  }

  return (
    <span className={combinedClassName} title={title}>
      {content}
    </span>
  );
}
