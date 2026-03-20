/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@merror/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;
