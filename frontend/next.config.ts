import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for ASP.NET hosting (no Node.js server required)
  output: 'export',
  distDir: 'dist',
  trailingSlash: true,
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
