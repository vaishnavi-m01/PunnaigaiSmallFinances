import { useSelector } from 'react-redux';
import { getAppTheme, AppTheme } from './appTheme';
import { APP_ROLES, AppRoleType } from '../constants/roles';

export const useAppTheme = (): AppTheme => {
  // Try getting from redux auth slice if available, fallback to activeRole
  let activeRole: AppRoleType = APP_ROLES.CUSTOMER;
  try {
    const roleFromState = useSelector((state: any) => state?.auth?.user?.role);
    if (roleFromState) {
      activeRole = roleFromState as AppRoleType;
    }
  } catch {
    // useSelector may be called outside provider during hot reload
  }

  return getAppTheme(activeRole);
};
