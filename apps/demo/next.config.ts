import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@squaredr/paykit',
    '@squaredr/paykit-stripe',
    '@squaredr/paykit-razorpay',
    '@squaredr/paykit-js',
    '@squaredr/paykit-react',
  ],
};

export default nextConfig;
