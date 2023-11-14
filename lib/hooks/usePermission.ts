import { useEffect, useState } from 'react';
import { UserRole } from '../api/auth';
import { useAuthStore } from '../stores';

const usePermission = (roles: UserRole[]) => {
  const userInfo = useAuthStore(state => state.userInfo);

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
