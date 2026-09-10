import { APP_ROLES } from '../constants/roles';
import { colors } from './colors';

export interface RoleColorTheme {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  soft: string;
  gradient: [string, string];
  badgeBg: string;
  badgeText: string;
  roleName: string;
}

export const roleColors: Record<string, RoleColorTheme> = {
  [APP_ROLES.CUSTOMER]: {
    primary: colors.primary,
    primaryLight: colors.primaryLight,
    primaryDark: colors.primaryDark,
    soft: colors.primarySoft,
    gradient: [colors.buttonGradient[0], colors.buttonGradient[1]],
    badgeBg: colors.primarySoft,
    badgeText: colors.primary,
    roleName: 'Customer',
  },
  [APP_ROLES.AGENT]: {
    primary: colors.primary,
    primaryLight: colors.primaryLight,
    primaryDark: colors.primaryDark,
    soft: colors.primarySoft,
    gradient: [colors.buttonGradient[0], colors.buttonGradient[1]],
    badgeBg: colors.primarySoft,
    badgeText: colors.primary,
    roleName: 'Field Agent',
  },
  [APP_ROLES.INVESTOR]: {
    primary: colors.primary,
    primaryLight: colors.primaryLight,
    primaryDark: colors.primaryDark,
    soft: colors.primarySoft,
    gradient: [colors.buttonGradient[0], colors.buttonGradient[1]],
    badgeBg: colors.primarySoft,
    badgeText: colors.primary,
    roleName: 'Investor',
  },
  [APP_ROLES.PARTNERSHIP]: {
    primary: colors.primary,
    primaryLight: colors.primaryLight,
    primaryDark: colors.primaryDark,
    soft: colors.primarySoft,
    gradient: [colors.buttonGradient[0], colors.buttonGradient[1]],
    badgeBg: colors.primarySoft,
    badgeText: colors.primary,
    roleName: 'Partner',
  },
};
