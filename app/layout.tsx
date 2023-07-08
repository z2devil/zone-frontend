import '@/styles/globals.css';
import Sidebar from '@/ui/sidebar/Sidebar';
import clsx from 'clsx';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ZONE',
  description: '中二Devil的个人博客',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={clsx(inter.className, ' relative, h-screen')}>
        <Sidebar />
        {children}
      </body>
    </html>
  );
}
