const isDev = process.env.NODE_ENV === 'development';

const originOf = url => {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
};

// 后端 API 与 OSS 由浏览器直连
const apiOrigin = originOf(process.env.BASE_URL);
const ossOrigin = originOf(
  `https://${process.env.OSS_BUCKET}.${process.env.OSS_ENDPOINT}`
);
// Steam 视频块的 hls.js 直接拉取 steamstatic CDN
const steamCdn = 'https://*.steamstatic.com';

const contentSecurityPolicy = [
  "default-src 'self'",
  // Next 注入内联脚本；开发模式的 React Refresh 需要 eval
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  // Tailwind、Mermaid SVG、Excalidraw 依赖内联样式
  "style-src 'self' 'unsafe-inline'",
  // 笔记中可能保留历史外链图片，只限制为 https
  "img-src 'self' data: blob: https:",
  // Excalidraw 0.17 默认从 unpkg 加载手写字体
  "font-src 'self' data: https://unpkg.com",
  `media-src 'self' blob: ${steamCdn}`,
  `connect-src 'self' ${apiOrigin} ${ossOrigin} ${steamCdn}${isDev ? ' ws:' : ''}`,
  // hls.js 使用 blob Worker
  "worker-src 'self' blob:",
  // 视频块允许嵌入任意 https 播放器，Steam 小组件来自 store.steampowered.com
  "frame-src 'self' https:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

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
    OSS_MAX_IMAGE_SIZE: process.env.OSS_MAX_IMAGE_SIZE,
    ABOUT_NOTE_ID: process.env.ABOUT_NOTE_ID,
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
      {
        protocol: 'https',
        hostname: 'shared.akamai.steamstatic.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
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
