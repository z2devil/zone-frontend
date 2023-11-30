import localFont from 'next/font/local';

const jetBrainsMono = localFont({
  src: [
    {
      path: '../../public/font/jetBrainsMono/JetBrainsMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/font/jetBrainsMono/JetBrainsMono-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/font/jetBrainsMono/JetBrainsMono-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/font/jetBrainsMono/JetBrainsMono-Bold-Italic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
});

export default jetBrainsMono;
