import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '',
  allowedDevOrigins: ['192.168.86.99:3000'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  async rewrites() {
    const isDev = process.env.NODE_ENV === "development";
    const supabaseUrl = (isDev 
      ? process.env.NEXT_PUBLIC_SUPABASE_URL_DEV 
      : process.env.NEXT_PUBLIC_SUPABASE_URL) || "https://placeholder-supabase.co";
    return [
      {
        source: '/supabase-api/:path*',
        destination: `${supabaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
