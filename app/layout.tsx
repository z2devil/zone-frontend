import ModalUtilsProvider from '@/lib/recoil/modal';
import NotificationUtilsProvider from '@/lib/recoil/notification';
import '@/styles/globals.css';
import RecoilRootProvider from '@/ui/RecoilRootProvider';
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
        <RecoilRootProvider>
          <NotificationUtilsProvider />
          <ModalUtilsProvider />
          {children}
          {layer}
        </RecoilRootProvider>
      </body>
    </html>
  );
};

export default RootLayout;
