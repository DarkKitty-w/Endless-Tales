import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Remove the deprecated eslint option
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.ko-fi.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Allow dev origins for Turbopack HMR
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
};

export default nextConfig;