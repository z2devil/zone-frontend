import '@/styles/globals.css';
import RootProvider from '@/ui/RootProvider';
import clsx from 'clsx';
import jetBrainsMono from 'config/font/jetBrainsMono';

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
        <a
          className='fixed bottom-2 left-1/2 -translate-x-1/2 text-xs text-black-100 duration-100 hover:text-black-300'
          href='https://beian.miit.gov.cn/'
          rel='noreferrer'
          target='_blank'>
          豫ICP备2021001737号
        </a>
      </body>
    </html>
  );
};

export default RootLayout;
