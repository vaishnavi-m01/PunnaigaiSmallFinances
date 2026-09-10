import { APP_ROLES, AppRoleType } from '../constants/roles';

let currentActiveRole: AppRoleType = APP_ROLES.CUSTOMER;

export const setActiveRole = (role: AppRoleType): void => {
  currentActiveRole = role;
};

export const getActiveRole = (): AppRoleType => {
  return currentActiveRole;
};
