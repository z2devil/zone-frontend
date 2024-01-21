/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BASE_URL: process.env.BASE_URL,
    OSS_ENDPOINT: process.env.OSS_ENDPOINT,
    OSS_BUCKET: process.env.OSS_BUCKET,
    OSS_ROOT: process.env.OSS_ROOT,
  },
  experimental: {
    appDir: true,
  },
  images: {
    // loader: 'custom',
    // loaderFile: './config/image/loader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'z2devil-bucket.oss-cn-beijing.aliyuncs.com',
        port: '',
        pathname: '/*/*/**',
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
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
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
};

module.exports = nextConfig;
