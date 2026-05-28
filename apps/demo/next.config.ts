import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@squaredr/paykit',
    '@squaredr/paykit-js',
    '@squaredr/paykit-react',
  ],
};

export default nextConfig;
