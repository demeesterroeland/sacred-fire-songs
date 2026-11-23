import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '',
  // Extra origins (e.g. "<lan-ip>:3000") allowed to reach the dev server.
  allowedDevOrigins: (process.env.ALLOWED_DEV_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  // #574: Explore was replaced by the bottom bar (UXA-020); old links open the song list. Permanent (308);
  // Next.js passes the query string through (/explore?category=x → /songs?category=x).
  async redirects() {
    return [{ source: '/explore', destination: '/songs', permanent: true }];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

export default nextConfig;
