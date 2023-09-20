import '@/styles/globals.css';
import RecoilRootProvider from '@/ui/RecoilRootProvider';
import Sidebar from '@/ui/Sidebar';
import clsx from 'clsx';
import { Inter } from 'next/font/google';
import { RecoilRoot } from 'recoil';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ZONE',
  description: '中二Devil的个人博客',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = (props: RootLayoutProps) => {
  const { children } = props;

  return (
    <html lang='en'>
      <body className={clsx(inter.className, 'bg-gray-50')}>
        {/* <Sidebar /> */}
        <RecoilRootProvider>
          <div className='flex-1'>{children}</div>
        </RecoilRootProvider>
      </body>
    </html>
  );
};

export default RootLayout;
