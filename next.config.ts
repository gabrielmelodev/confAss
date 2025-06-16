import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    middlewarePrefetch: "strict",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  devIndicators: false,
};

export default nextConfig;
