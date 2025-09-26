/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    TITLE: process.env.TITLE,
    DESCRIPTION: process.env.DESCRIPTION,
    AUTHOR: process.env.AUTHOR,
    BASE_URL: process.env.BASE_URL,
    OSS_ENDPOINT: process.env.OSS_ENDPOINT,
    OSS_BUCKET: process.env.OSS_BUCKET,
    OSS_ROOT: process.env.OSS_ROOT,
    OSS_ACCESSID: process.env.OSS_ACCESSID,
    OSS_MAX_IMAGE_SIZE: process.env.OSS_MAX_IMAGE_SIZE,
    AI_BASE_URL: process.env.AI_BASE_URL,
    AI_API_KEY: process.env.AI_API_KEY,
    ABOUT_NOTE_ID: process.env.ABOUT_NOTE_ID,
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
        hostname: `${process.env.OSS_BUCKET}.${process.env.OSS_ENDPOINT}`,
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
