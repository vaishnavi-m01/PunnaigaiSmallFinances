import { AppRoleType } from '../../constants/roles';

export interface AuthUser {
  id: number;
  name: string;
  mobile: string;
  email?: string;
  role?: string;
}

export interface AuthState {
  loading: boolean;
  error: string | null;
  user: AuthUser | null;
  role: AppRoleType | null;
  token: string | null;
}
