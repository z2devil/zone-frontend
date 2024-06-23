import Button from '@/ui/Button';
import Image from 'next/image';
import noneNetworkImg from '../public/tip/none_network.png';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='mx-auto flex flex-col items-center gap-6'>
      <Image alt='404' height={256} src={noneNetworkImg} width={256} />
      <div className='flex flex-col items-center gap-8'>
        <h1 className='text-19 font-bold text-black-900'>
          肥肠抱歉，您访问的页面不见了
        </h1>
        <Link href='/'>
          <Button className='relative flex h-12 items-center justify-center gap-2.5 rounded-3xl bg-primary-50 px-5 py-3.5 text-white transition-colors duration-100 hover:bg-primary-100'>
            回到首页
          </Button>
        </Link>
      </div>
    </div>
  );
}
