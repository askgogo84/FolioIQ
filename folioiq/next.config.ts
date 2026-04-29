import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  // Allow fetching from AMFI and MFAPI
  async rewrites() {
    return [
      {
        source: "/api/mf/:path*",
        destination: "https://api.mfapi.in/:path*",
      },
    ];
  },
  // Enable experimental features for Next.js 16
  experimental: {
    dynamicIO: true,
  },
};

export default nextConfig;
