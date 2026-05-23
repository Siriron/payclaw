/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@circle-fin/app-kit', '@circle-fin/adapter-ethers-v6'],
  webpack: (config) => {
    // Fix for ethers.js and App Kit ESM compatibility
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, net: false, tls: false };
    return config;
  },
};
module.exports = nextConfig;
