import Image from 'next/image';
import GonganLogoImg from '../../public/gongan-logo.png';

const SiteRecord = () => {
  return (
    <div className='mt-32 flex h-9 w-full items-center justify-center gap-4'>
      <a
        className='flex items-center gap-1 text-xs text-black-600'
        href='http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=11010502054444'
        rel='noopener noreferrer'
        target='_blank'>
        <Image alt='' height={20} src={GonganLogoImg} width={20} />
        京公网安备11010502054444号
      </a>
      <a
        className='text-xs text-black-600'
        href='https://beian.miit.gov.cn/'
        rel='noreferrer'
        target='_blank'>
        豫ICP备2021001737号
      </a>
    </div>
  );
};

export default SiteRecord;
