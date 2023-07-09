import { IUser } from '@/lib/user';
import Image from 'next/image';
import { useMemo } from 'react';

interface UserProps {
  user: IUser;
}

const userRoleMap = ['普通用户', '管理员', '博主'];

const User = (props: UserProps) => {
  const { user } = props;

  const userRole = useMemo(() => {
    return userRoleMap[user.lv];
  }, [user.lv]);

  return (
    <div className='flex h-16 flex-1 items-center justify-start gap-2.5 py-0.5 pr-[1.38rem]'>
      <Image
        className='border-black h-[3.75rem] w-[3.75rem] rounded-full border border-opacity-40'
        src={user.avatarUrl}
        width={120}
        height={120}
        alt='avatar'
      />
      <div className='flex flex-1 flex-col items-start justify-start gap-[5px]'>
        <span className='text-[1.25rem] font-semibold text-black-600'>
          {user.name}
        </span>
        <span className='text-[16px] font-normal text-black-400'>
          {userRole}
        </span>
      </div>
    </div>
  );
};

export default User;
