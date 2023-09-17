const LoginPage = () => {
  return (
    <div className=' flex items-center justify-center overflow-hidden'>
      <div className='flex w-96 flex-col items-center justify-center gap-32'>
        <div className='flex flex-col items-center justify-center gap-16'>
          <div className='flex flex-col items-center justify-center gap-7'>
            <i className='iconfont icon-logo text-[72px] text-[#FFC445]'></i>
            <span className='text-3xl font-medium text-black-900'>
              邮箱登录/注册
            </span>
            <input
              className='h-[3.25rem] w-[17.5rem] rounded-full text-center text-lg font-medium text-black-900 placeholder:text-center placeholder:text-lg placeholder:text-black-400'
              placeholder='邮箱'
            />
          </div>
        </div>
        {/* button */}
        <button className='flex h-12 items-center justify-center gap-2.5 rounded-3xl bg-blue-600 py-3.5 pl-7 pr-5'>
          <span className='text-lg font-medium text-white'>获取验证码</span>
          <i className='iconfont icon-arrow-right text-lg' />
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
