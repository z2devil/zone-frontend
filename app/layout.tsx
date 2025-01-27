import '@/styles/globals.css';
import RootProvider from '@/ui/RootProvider';
import clsx from 'clsx';

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
    <html lang='zh-CN'>
      <head>
        <link
          href='/icon?<generated>'
          rel='icon'
          sizes='<generated>'
          type='image/<generated>'
        />
      </head>
      <body className={clsx('bg-gray-100')}>
        <RootProvider>
          {children}
          {layer}
        </RootProvider>
      </body>
    </html>
  );
};

export default RootLayout;
