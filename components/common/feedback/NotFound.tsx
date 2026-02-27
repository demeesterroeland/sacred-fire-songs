'use client';

import Link from 'next/link';
import { Home, Music2 } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-900 h-full min-h-[60vh]">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
        <Music2 className="w-24 h-24 text-red-500 relative z-10" />
      </div>

      <h1 className="text-3xl font-bold text-white mb-4">Song Not Found</h1>
      <p className="text-gray-400 max-w-[280px] mb-12 leading-relaxed">
        The medicine you&apos;re looking for seems to have wandered into the forest.
      </p>

      <Link
        href="/"
        className="flex items-center gap-3 px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-xl shadow-red-500/20 group"
      >
        <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        Back to the Hearth
      </Link>
    </div>
  );
}
