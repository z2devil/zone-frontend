import '@/styles/globals.css';
import RootProvider from '@/ui/RootProvider';
import clsx from 'clsx';

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
    <html lang='en'>
      <body className={clsx('bg-gray-50')}>
        <RootProvider>
          {children}
          {layer}
        </RootProvider>
      </body>
    </html>
  );
};

export default RootLayout;
