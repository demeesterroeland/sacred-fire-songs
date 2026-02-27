// components/common/GuestBanner.tsx
'use client';

import { useState } from 'react';
import { Flame, X } from 'lucide-react';
import Link from 'next/link';

interface GuestBannerProps {
  message: string;
  linkText?: string;
  linkHref?: string;
}

export function GuestBanner({ message, linkText, linkHref }: GuestBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm mb-6">
      <Flame className="w-4 h-4 text-amber-400 shrink-0" />
      <p className="text-gray-300 flex-1">
        {message}
        {linkText && linkHref && (
          <>
            {' '}
            <Link href={linkHref} className="text-amber-400 hover:text-amber-300 underline underline-offset-2 font-bold">
              {linkText}
            </Link>
          </>
        )}
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="text-gray-500 hover:text-gray-400 shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
