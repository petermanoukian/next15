//next.config.ts
console.log("✅ Using next.config.ts");

import type { NextConfig } from "next";

const nextConfig: NextConfig = {


 

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'corporatehappinessaward.com',
        pathname: '/next15-laravel-public/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'corporatehappinessaward.com',
        pathname: '/next15-laravel-public/img/**',
      },
    ],
  },

  // ✅ Skip lint and TS checks during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
