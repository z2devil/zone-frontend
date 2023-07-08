/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'z2devil-bucket.oss-cn-beijing.aliyuncs.com',
        port: '',
        pathname: '/blog/image/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/note',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
