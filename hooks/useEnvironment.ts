'use client';

import { useState, useEffect } from 'react';

export type Environment = 'development' | 'preview' | null;

export function useEnvironment() {
  const [env] = useState<Environment>(() => {
    if (typeof window === 'undefined') return null;
    
    const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;
    const isLocal = process.env.NODE_ENV === "development";

    if (vercelEnv === "preview") return "preview";
    if (isLocal) return "development";
    return null;
  });

  return env;
}
