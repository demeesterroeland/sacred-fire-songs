import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '',
  // @ts-ignore - Valid in Next.js 16 to suppress local IP cross-origin warnings
  allowedDevOrigins: ['192.168.86.99:3000'],
};

export default nextConfig;
