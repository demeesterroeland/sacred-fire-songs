// app/loading.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Ember {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
}

export default function Loading() {
  const [embers, setEmbers] = useState<Ember[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEmbers((prev) => [
        ...prev.slice(-40),
        {
          id: Date.now() + Math.random(),
          left: Math.random() * 100,
          size: Math.random() * 4 + 2,
          duration: Math.random() * 3 + 2,
          delay: Math.random() * 2,
        },
      ]);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-[#080000] flex flex-col items-center justify-center z-50">
      {/* Rising embers */}
      <div className="fixed inset-0 pointer-events-none hidden dark:block">
        {embers.map((ember) => (
          <div
            key={ember.id}
            className="loading-ember"
            style={{
              left: `${ember.left}%`,
              width: `${ember.size}px`,
              height: `${ember.size}px`,
              animationDuration: `${ember.duration}s`,
              animationDelay: `${ember.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Centred brand */}
      <div className="relative z-10 flex flex-col items-center gap-5">
        <Image
          src="/icons/icon-192.png"
          alt="Sacred Fire Songs"
          width={96}
          height={96}
          className="rounded-2xl shadow-[0_0_40px_rgba(220,60,0,0.2)] dark:shadow-[0_0_40px_rgba(220,60,0,0.4)]"
          priority
        />
        <h1 className="text-2xl font-semibold tracking-wide text-amber-900 dark:text-amber-100">
          Sacred Fire Songs
        </h1>
        <p className="text-sm text-amber-700/80 dark:text-amber-900/80 tracking-widest uppercase">
          Medicine Music
        </p>
      </div>

      {/* Keyframe styles — inline so this file is self-contained */}
      <style>{`
        @keyframes loading-ember-rise {
          0%   { transform: translateY(0)      scale(1)   rotate(0deg);   opacity: 0; }
          20%  { opacity: 0.8; }
          80%  { opacity: 0.4; }
          100% { transform: translateY(-100vh) scale(0.3) rotate(360deg); opacity: 0; }
        }
        .loading-ember {
          position: absolute;
          bottom: -10px;
          background: #f45d1a;
          border-radius: 50%;
          box-shadow: 0 0 10px #d9481e, 0 0 20px #f45d1a;
          pointer-events: none;
          animation: loading-ember-rise linear forwards;
        }
      `}</style>
    </div>
  );
}
