/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*',
      },
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      process: false,
    };
    return config;
  },
};

module.exports = nextConfig;
