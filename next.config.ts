import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Allow the index.html payroll page to be served as a static file
  async rewrites() {
    return [];
  },
};

export default nextConfig;
