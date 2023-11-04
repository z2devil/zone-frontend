import { UserRole } from '../api/auth';
import useAuth from './useAuth';

const usePermission = (roles: UserRole[]) => {
  const auth = useAuth();

  const userInfo = auth?.getUserInfo();

  if (!userInfo) {
    return false;
  }

  return roles.includes(userInfo.lv);
};

export default usePermission;
