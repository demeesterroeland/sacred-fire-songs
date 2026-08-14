'use client';

import React from 'react';
import Link from 'next/link';

export interface BasePillProps {
  label: string;
  icon?: React.ReactNode;
  count?: number;
  href?: string;
  onClick?: () => void;
  title?: string;
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
  variantStyles = '',
  className = '',
  children,
}: BasePillProps) {
  const baseStyles =
    'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 select-none border';

  const isInteractive = Boolean(href || onClick);
  const cursorStyle = isInteractive ? 'cursor-pointer active:scale-95' : '';
  const computedTitle = title ?? (isInteractive ? `Filter songs by ${label}` : undefined);

  const combinedClassName = `${baseStyles} ${cursorStyle} ${variantStyles} ${className}`.trim();

  const content = (
    <>
      {icon}
      <span>{label}</span>
      {typeof count === 'number' && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 dark:bg-gray-700/50">
          {count}
        </span>
      )}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClassName} title={computedTitle}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={combinedClassName} title={computedTitle}>
        {content}
      </button>
    );
  }

  return (
    <span className={combinedClassName} title={computedTitle}>
      {content}
    </span>
  );
}
