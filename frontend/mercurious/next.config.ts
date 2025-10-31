import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for optimized Docker builds
  output: 'standalone',
  eslint: {
    // Don't fail build on linting errors (warnings will still be shown)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't fail build on type errors (already handled by tsc)
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
