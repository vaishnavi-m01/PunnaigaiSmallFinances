import { colors } from './colors';
import { roleColors, RoleColorTheme } from './roleColors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';
import { layout } from './layout';
import { getActiveRole } from './activeRole';
import { AppRoleType, APP_ROLES } from '../constants/roles';

export interface AppTheme {
  colors: typeof colors;
  roleTheme: RoleColorTheme;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  layout: typeof layout;
  activeRole: AppRoleType;
}

export const getAppTheme = (role?: AppRoleType): AppTheme => {
  const effectiveRole = role || getActiveRole() || APP_ROLES.CUSTOMER;
  const roleTheme = roleColors[effectiveRole] || roleColors[APP_ROLES.CUSTOMER];

  return {
    colors: {
      ...colors,
      primary: roleTheme.primary,
      primaryLight: roleTheme.primaryLight,
      primaryDark: roleTheme.primaryDark,
      primarySoft: roleTheme.soft,
      soft: roleTheme.soft,
      gradientStart: roleTheme.gradient[0],
      gradientMiddle: roleTheme.primary,
      gradientEnd: roleTheme.gradient[1],
      buttonGradient: roleTheme.gradient,
      heroCardStart: roleTheme.gradient[0],
      heroCardEnd: roleTheme.gradient[1],
    },
    roleTheme,
    typography,
    spacing,
    radius,
    shadows,
    layout,
    activeRole: effectiveRole,
  };
};

export const appTheme = getAppTheme();
