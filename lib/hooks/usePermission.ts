import { useEffect, useState } from 'react';
import { UserRole } from '../api/auth';
import { useRecoilValue } from 'recoil';
import { userInfoState } from '../recoil/auth';

const usePermission = (roles: UserRole[]) => {
  const userInfo = useRecoilValue(userInfoState);

  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setHasPermission(roles.includes(userInfo.lv));
    } else {
      setHasPermission(false);
    }
  }, [roles, userInfo]);

  return hasPermission;
};

export default usePermission;
