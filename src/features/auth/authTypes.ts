import { AppRoleType } from '../../constants/roles';

export interface AuthUser {
  id: number;
  name: string;
  mobile: string;
  email?: string;
  role?: string;
}

export interface AppProfile {
  id: number;
  agent_code?: string;
  name: string;
  mobile: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  joining_date?: string | null;
  photo?: string | null;
  notes?: string;
  status?: string;
}

export interface AuthState {
  loading: boolean;
  error: string | null;
  user: AuthUser | null;
  profile: AppProfile | null;
  role: AppRoleType | null;
  token: string | null;
}
