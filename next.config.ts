import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    middlewarePrefetch: "strict" // se quiser controlar manualmente o pré-carregamento do middleware
  },
  eslint: {
    ignoreDuringBuilds: true, // <- desativa ESLint na build
  },
  devIndicators: false
};


export default nextConfig;