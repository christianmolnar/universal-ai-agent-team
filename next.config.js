/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Disable webpack cache to avoid tslib resolution warning
  // This is a known issue with Next.js 14 and @swc/helpers
  webpack: (config, { isServer }) => {
    // Disable filesystem caching to prevent the tslib warning
    config.cache = false;
    
    return config;
  },
}

module.exports = nextConfig
