/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
    ],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3001/api',
  },
};

module.exports = nextConfig;
