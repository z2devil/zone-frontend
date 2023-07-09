const LogoNav = () => {
  const handleClick = () => {
    window.location.href = '/';
  };

  return (
    <div className='inline-flex flex-col items-start justify-start gap-2.5'>
      <div className='inline-flex items-center justify-start gap-3'>
        <i
          className='iconfont icon-logo cursor-pointer text-[3.625rem] leading-[3.625rem] text-logo-color'
          onClick={handleClick}
        />
        <div className='inline-flex flex-col items-start justify-start gap-[0.1rem]'>
          <div className='text-[1.5rem] font-semibold text-black-600'>
            中二Devil
          </div>
          <div className='text-[0.9rem] font-normal text-black-400'>
            的个人博客
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoNav;
