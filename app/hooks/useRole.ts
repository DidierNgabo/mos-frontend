import { useAppSelector } from './redux';
import { hasRequiredRole, RoleType } from '../utils/roleUtils';

export const useRole = () => {
  const user = useAppSelector((state) => state.auth.user);

  const checkRole = (allowedRoles: RoleType[]) => {
    return hasRequiredRole(user?.roles, allowedRoles);
  };

  const isSuperAdmin = checkRole(['SUPER_ADMIN']);

  return {
    userRoles: user?.roles || [],
    hasRole: checkRole,
    isSuperAdmin,
    user,
  };
};
