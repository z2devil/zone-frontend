'use client';

import Button from '@/ui/Button';
import Image from 'next/image';
import tooManyRequestsImg from '../../public/tip/too_many_requests.png';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const navigation = useRouter();

  const handleBack = () => {
    navigation.back();
  };

  return (
    <div className='mx-auto flex flex-col items-center gap-6'>
      <Image alt='404' height={256} src={tooManyRequestsImg} width={256} />
      <div className='flex flex-col items-center gap-8'>
        <h1 className='text-19 font-bold text-black-900'>
          您的请求太频繁了，休息一下吧
        </h1>
        <Button
          className='relative flex h-12 items-center justify-center gap-2.5 rounded-3xl bg-primary-50 px-5 py-3.5 text-white transition-colors duration-100 hover:bg-primary-100'
          onClick={handleBack}>
          返回上一页
        </Button>
      </div>
    </div>
  );
}
