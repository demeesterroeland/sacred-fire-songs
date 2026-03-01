// app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sacred Fire Songs',
    short_name: 'Sacred Fire',
    description: 'A digital songbook for medicine music ceremonies.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#080000',
    theme_color: '#1a0505',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
