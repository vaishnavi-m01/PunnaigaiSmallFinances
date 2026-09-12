export enum APP_ROLES {
  CUSTOMER = 'customer',
  AGENT = 'agent',
  INVESTOR = 'investor',
  PARTNERSHIP = 'partner',
}

export type AppRoleType = `${APP_ROLES}`;

export const isValidAppRole = (role: unknown): role is AppRoleType => {
  return typeof role === 'string' && (Object.values(APP_ROLES) as string[]).includes(role);
};

export const ROLE_LABELS: Record<AppRoleType, string> = {
  [APP_ROLES.CUSTOMER]: 'Customer',
  [APP_ROLES.AGENT]: 'Agent',
  [APP_ROLES.INVESTOR]: 'Investor',
  [APP_ROLES.PARTNERSHIP]: 'Partner',
};