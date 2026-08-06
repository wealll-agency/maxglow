import dns from 'dns';
import path from 'path';
import fs from 'fs';

const packageJsonPath = path.resolve(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const appVersion = packageJson.version || '1.0.0';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

const backendUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '') : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['192.168.1.3'],
  generateBuildId: async () => {
    return appVersion;
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons', 'bootstrap'],
  },
  outputFileTracingRoot: path.resolve(process.cwd(), '..'),
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'api.qrserver.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: 'maxglow-assets-74641.s3.ap-south-1.amazonaws.com' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
      { protocol: 'https', hostname: 'maxglow.in' },
      { protocol: 'https', hostname: 'www.maxglow.in' },
      { protocol: 'https', hostname: 'www.maxglowon.com' },
      { protocol: 'https', hostname: 'maxglowon.com' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
