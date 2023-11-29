import Image from 'next/image';
import Link from 'next/link';

const DEFAULT_USER_AVATAR_PATH =
  'blog/image/e24544c9-ef56-45e6-8719-de70144dab0d.png';

interface UserInfoProps {
  avatarPath?: string;
  nickname?: string;
  roleName?: string;
}

const UserInfo = (props: UserInfoProps) => {
  const { avatarPath, nickname, roleName } = props;

  return (
    <div className='flex items-center gap-[0.63rem]'>
      <Image
        className=' h-[3.75rem] w-[3.75rem] rounded-full border-2 border-black-250'
        src={avatarPath ? avatarPath : DEFAULT_USER_AVATAR_PATH}
        alt='avatar'
        width={60}
        height={60}
      />
      {nickname && roleName ? (
        <div className='flex flex-col gap-[0.3rem]'>
          <span className='text-xl text-black-900'>{nickname}</span>
          <span className='text-black-250'>{roleName}</span>
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
