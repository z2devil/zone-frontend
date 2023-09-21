import { UserRole } from '../api/auth';
import auth from '../utils/auth';

const usePermission = (roles: UserRole[]) => {
  const userInfo = auth.getUserInfo();

  if (!userInfo) {
    return false;
  }

  return roles.includes(userInfo.lv);
};

export default usePermission;
