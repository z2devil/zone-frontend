import Image from 'next/image';

const LogoNav = () => {
  const handleClick = () => {
    window.location.href = '/';
  };

  return (
    <div className='inline-flex flex-col items-start justify-start gap-2.5'>
      <div className='inline-flex items-center justify-start gap-2.5'>
        <Image
          src='/icon/logo.svg'
          alt='logo'
          onClick={handleClick}
          className='h-[3.625rem] w-[3.625rem] cursor-pointer'
          width={58}
          height={58}
        />
        <div className='inline-flex flex-col items-start justify-start gap-[0.1rem]'>
          <div className='text-[1.5rem] font-semibold text-black text-opacity-60'>
            中二Devil
          </div>
          <div className='text-[0.9rem] font-normal text-black text-opacity-40'>
            的个人博客
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoNav;
