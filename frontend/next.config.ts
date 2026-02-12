import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Uncomment for static export deployment (e.g., MonsterASP.NET static hosting)
  output: 'export',
  images: {
    unoptimized: true
  },

  // Use rewrites only in development (not compatible with static export)
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:5009/api/:path*',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
