import '@/styles/globals.css';
import Sidebar from '@/ui/Sidebar';
import clsx from 'clsx';
import { Inter } from 'next/font/google';

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
      <body
        className={clsx(
          inter.className,
          'relative flex h-screen bg-gray-50 max-sm:flex-col'
        )}>
        {/* <Sidebar /> */}
        <div className='flex-1 overflow-y-auto pr-5'>{children}</div>
      </body>
    </html>
  );
};

export default RootLayout;
