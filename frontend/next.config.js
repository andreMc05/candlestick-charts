/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 15 recommended settings
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Your existing config
  reactStrictMode: true,
  rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 