import '@/styles/globals.css';
import RootProvider from '@/ui/RootProvider';
import clsx from 'clsx';
import jetBrainsMono from 'config/font/jetBrainsMono';
import Image from 'next/image';
import GonganLogoImg from '../public/gongan-logo.png';

export const metadata = {
  title: '黑山羊日志',
  description: '黑山羊日志',
};

interface RootLayoutProps {
  children: React.ReactNode;
  layer: React.ReactNode;
}

const RootLayout = (props: RootLayoutProps) => {
  const { children, layer } = props;

  return (
    <html className={jetBrainsMono.className} lang='zh-CN'>
      <head>
        <link
          href='/icon?<generated>'
          rel='icon'
          sizes='<generated>'
          type='image/<generated>'
        />
      </head>
      <body className={clsx('bg-gray-50')}>
        <RootProvider>
          {children}
          {layer}
        </RootProvider>
        <div className='flex h-9 w-full items-center justify-center gap-4'>
          <a
            className='flex items-center gap-1 text-xs text-black-600'
            href='http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=11010502054444'
            rel='noopener noreferrer'
            target='_blank'>
            <Image alt='' height='20' src={GonganLogoImg} width='20' />
            京公网安备11010502054444号
          </a>
          <a
            className='text-xs text-black-600'
            href='https://beian.miit.gov.cn/'
            rel='noreferrer'
            target='_blank'>
            豫ICP备2021001737号
          </a>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
