import { APP_ROLES, AppRoleType } from './roles';
import { UserProfile } from '../types/models';

export interface RoleCredential {
  role: AppRoleType;
  roleName: string;
  phone: string;
  formattedPhone: string;
  password: string;
  user: UserProfile;
}

/**
 * Punnaigai Small Finances - Central 4-Role Static Credentials
 * 
 * 1. Customer:    Phone: 9876543210 | Password: customer123 | Name: Raji Kumar
 * 2. Field Agent: Phone: 9845011223 | Password: agent123    | Name: Karthik
 * 3. Investor:    Phone: 9811223344 | Password: investor123 | Name: Ravi Chandran
 * 4. Partner:     Phone: 9789055443 | Password: partner123  | Name: Arun & Kumar
 */
export const staticCredentials: Record<AppRoleType, RoleCredential> = {
  [APP_ROLES.CUSTOMER]: {
    role: APP_ROLES.CUSTOMER,
    roleName: 'Customer',
    phone: '9876543210',
    formattedPhone: '+91 98765 43210',
    password: 'customer123',
    user: {
      id: 'USR_001',
      name: 'Raji Kumar',
      phone: '+91 98765 43210',
      email: 'raji.kumar@example.com',
      role: APP_ROLES.CUSTOMER,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  },
  [APP_ROLES.AGENT]: {
    role: APP_ROLES.AGENT,
    roleName: 'Field Agent',
    phone: '9845011223',
    formattedPhone: '+91 98450 11223',
    password: 'agent123',
    user: {
      id: 'USR_002',
      name: 'Karthik',
      phone: '+91 98450 11223',
      email: 'karthik.agent@punnaigai.com',
      role: APP_ROLES.AGENT,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  },
  [APP_ROLES.INVESTOR]: {
    role: APP_ROLES.INVESTOR,
    roleName: 'Investor',
    phone: '9811223344',
    formattedPhone: '+91 98112 23344',
    password: 'investor123',
    user: {
      id: 'USR_003',
      name: 'Ravi Chandran',
      phone: '+91 98112 23344',
      email: 'ravi.investor@punnaigai.com',
      role: APP_ROLES.INVESTOR,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  },
  [APP_ROLES.PARTNERSHIP]: {
    role: APP_ROLES.PARTNERSHIP,
    roleName: 'Partner',
    phone: '9789055443',
    formattedPhone: '+91 97890 55443',
    password: 'partner123',
    user: {
      id: 'USR_004',
      name: 'Arun & Kumar',
      phone: '+91 97890 55443',
      email: 'arun.partner@punnaigai.com',
      role: APP_ROLES.PARTNERSHIP,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  },
};

export const findUserByCredentials = (phoneInput: string, _passwordInput?: string): RoleCredential | null => {
  const cleanPhone = phoneInput.replace(/[^0-9]/g, '');
  if (!cleanPhone) return null;

  for (const cred of Object.values(staticCredentials)) {
    const credClean = cred.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.endsWith(credClean) || credClean.endsWith(cleanPhone)) {
      return cred;
    }
  }
  return null;
};
