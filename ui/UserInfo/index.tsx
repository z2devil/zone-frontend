'use client';

import { UserInfo, getUserInfoAPI } from '@/lib/api/auth';
import auth, { getUserRoleName } from '@/lib/utils/auth';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

const BASE_URL = 'https://z2devil-bucket.oss-cn-beijing.aliyuncs.com/';

const UserInfo = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const userRoleName = useMemo(() => {
    if (userInfo) {
      return getUserRoleName(userInfo.lv);
    }
    return '';
  }, [userInfo]);

  const init = useCallback(async () => {
    const storageUserInfo = auth.getUserInfo();
    if (storageUserInfo) {
      setUserInfo(storageUserInfo);
    } else {
      const { info: requestUserInfo } = await getUserInfoAPI();
      setUserInfo(requestUserInfo);
      auth.setUserInfo(requestUserInfo);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <>
      {userInfo && (
        <div className='flex items-center gap-[0.63rem]'>
          <Image
            className=' h-[3.75rem] w-[3.75rem] rounded-full border-2 border-black-400'
            src={
              BASE_URL +
              userInfo.avatarPath +
              '?x-oss-process=image/resize,s_128'
            }
            alt='avatar'
            width={60}
            height={60}
          />
          <div className='flex flex-col gap-[0.3rem]'>
            <span className='text-xl text-black-900'>{userInfo.nickname}</span>
            <span className='text-black-400'>{userRoleName}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default UserInfo;
