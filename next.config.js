/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: config => {
    // camel-case style names from css modules
    config.module.rules
      .find(({ oneOf }) => !!oneOf)
      .oneOf.filter(({ use }) => JSON.stringify(use)?.includes('css-loader'))
      .reduce((acc, { use }) => acc.concat(use), [])
      .forEach(({ options }) => {
        if (options?.modules) {
          options.modules.exportLocalsConvention = 'camelCase';
        }
      });

    return config;
  },
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
