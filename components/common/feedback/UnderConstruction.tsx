'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Home, Sparkles } from 'lucide-react';

interface UnderConstructionProps {
  title?: string;
  description?: string;
}

export default function UnderConstruction({
  title = "Under Construction",
  description = "This corner of the sanctuary is still being woven. The spirits are at work."
}: UnderConstructionProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-gray-950 min-h-[70vh] relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 via-transparent to-gray-500/20 blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto">
        <div className="relative mb-12 group">
          {/* Ethereal Glow */}
          <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-150 animate-pulse transition-opacity duration-1000"></div>

          <div className="relative w-64 h-64 lg:w-80 lg:h-80 mx-auto rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000 cursor-default ring-1 ring-gray-900/10 dark:ring-white/20">
            <Image
              src="/images/feedback/spiritual_mist_landscape.png"
              alt="Spiritual Landscape"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
          {title}
        </h1>

        <p className="text-gray-500 dark:text-gray-400 text-lg mb-12 leading-relaxed max-w-md mx-auto">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gray-100 hover:bg-white text-gray-950 rounded-2xl font-bold transition-all active:scale-95 shadow-xl shadow-white/5 group"
          >
            <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            Back to the Hearth
          </Link>

          <Link
            href="/explore?category=spiritual-concepts"
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl font-bold transition-all active:scale-95 group"
          >
            <Sparkles className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
            Spiritual Inquiry
          </Link>
        </div>
      </div>

      {/* Subtle bottom text or link as requested */}
      <div className="mt-16 text-gray-600 text-sm tracking-widest font-light uppercase z-10">
        Connected to the Sacred Source
      </div>
    </div>
  );
}
