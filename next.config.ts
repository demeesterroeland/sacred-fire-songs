import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  basePath: '',
  // @ts-ignore - Valid in Next.js 16 to suppress local IP cross-origin warnings
  allowedDevOrigins: ['192.168.86.99:3000'],
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
};

export default nextConfig;
