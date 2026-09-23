import dns from 'dns';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJsonPath = path.resolve(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const appVersion = packageJson.version || '1.0.0';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

// Robust zero-dependency env loader to fix Next.js 14 ES module top-level evaluation bug
const isProduction = process.env.NODE_ENV === 'production';
const candidateEnvPaths = [
  path.resolve(__dirname, '.env.production'),
  path.resolve(__dirname, '.env'),
  ...(isProduction ? [] : [path.resolve(__dirname, '../.env')]),
];

for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = (match[2] || '').trim();
        value = value.replace(/^['"]|['"]$/g, '').trim();
        if (!process.env[key]) process.env[key] = value;
      }
    });
  }
}

const backendUrl = 'http://127.0.0.1:7052';

if (!process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error('NEXT_PUBLIC_APP_URL is not defined in the environment variables. SEO features require a valid domain.');
}
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  compress: true,
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
    outputFileTracingRoot: path.resolve(__dirname, '..'),
  },
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2592000, // 30 days — safe because S3 URLs include timestamp (unique per upload)
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '7052' },
      { protocol: 'http', hostname: '127.0.0.1', port: '7052' },
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
      { protocol: 'https', hostname: 'www.maxglow.in' },
      { protocol: 'https', hostname: 'maxglow.in' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/shop-details',
        has: [
          {
            type: 'query',
            key: 'id',
            value: '(?<id>.*)',
          },
        ],
        destination: '/product/:id',
        permanent: true,
      },
      {
        source: '/shop-details',
        has: [
          {
            type: 'query',
            key: 'name',
            value: '(?<name>.*)',
          },
        ],
        destination: '/shop', // Fallback for name-based query
        permanent: true,
      }
    ];
  },
};

export default nextConfig;