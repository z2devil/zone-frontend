import '@/styles/globals.css';
import RootProvider from '@/ui/RootProvider';
import clsx from 'clsx';
import jetBrainsMono from 'config/font/jetBrainsMono';

export const metadata = {
  title: 'ZONE',
  description: '中二Devil的个人博客',
};

interface RootLayoutProps {
  children: React.ReactNode;
  layer: React.ReactNode;
}

const RootLayout = (props: RootLayoutProps) => {
  const { children, layer } = props;

  return (
    <html lang='zh-CN' className={jetBrainsMono.className}>
      <head>
        <link
          rel='icon'
          href='/icon?<generated>'
          type='image/<generated>'
          sizes='<generated>'
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
          target='_blank'
          rel='noreferrer'>
          豫ICP备2021001737号
        </a>
      </body>
    </html>
  );
};

export default RootLayout;
