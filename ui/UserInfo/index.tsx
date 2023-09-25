import Image from 'next/image';
import Button from '../Button';
import Link from 'next/link';

const BASE_URL = 'https://z2devil-bucket.oss-cn-beijing.aliyuncs.com/';

const DEFAULT_USER_AVATAR_PATH =
  'blog/image/e24544c9-ef56-45e6-8719-de70144dab0d.png';

interface UserInfoProps {
  info?: {
    avatarPath: string;
    nickname: string;
    roleName: string;
  };
}

const UserInfo = (props: UserInfoProps) => {
  const { info } = props;

  return (
    <div className='flex items-center gap-[0.63rem]'>
      <Image
        className=' h-[3.75rem] w-[3.75rem] rounded-full border-2 border-black-250'
        src={
          BASE_URL +
          (info ? info.avatarPath : DEFAULT_USER_AVATAR_PATH) +
          '?x-oss-process=image/resize,s_128'
        }
        alt='avatar'
        width={60}
        height={60}
      />
      {info ? (
        <div className='flex flex-col gap-[0.3rem]'>
          <span className='text-xl text-black-900'>{info.nickname}</span>
          <span className='text-black-250'>{info.roleName}</span>
        </div>
      ) : (
        <Link
          className='group flex h-8 items-center justify-center gap-1 rounded-3xl pl-3 pr-2 hover:bg-blue-600'
          href='/login'>
          <span className='font-medium transition-colors duration-100 group-hover:text-white'>
            登录
          </span>
          <i className='iconfont icon-arrow-right text-lg transition-colors duration-100 group-hover:text-white' />
        </Link>
      )}
    </div>
  );
};

export default UserInfo;
