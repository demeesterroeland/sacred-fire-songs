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
    <div className="fixed inset-0 bg-bg flex flex-col items-center justify-center z-50">
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
          className="rounded-panel"
          priority
        />
        <h1 className="text-title font-semibold tracking-wide text-fg">
          Sacred Fire Songs
        </h1>
        <p className="text-meta text-fg-muted tracking-widest uppercase">
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
          background: var(--accent);
          border-radius: 50%;
          pointer-events: none;
          animation: loading-ember-rise linear forwards;
        }
      `}</style>
    </div>
  );
}
