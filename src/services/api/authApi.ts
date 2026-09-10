import apiClient from '../apiClient';

export interface LoginPayload {
  mobile: string;
  otp: string;
}

export interface SendOtpPayload {
  mobile: string;
}

export interface LoginResponse {
  token: string;
  access_token?: string;
  user: {
    id: number;
    name: string;
    mobile: string;
    email?: string;
    role?: string;
  };
}

export interface ProfileUpdatePayload {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await apiClient.post<{ data: LoginResponse } | LoginResponse>(
    '/login',
    payload
  );
  // Handle both { data: ... } and flat response shapes
  const body = response.data as any;
  const data = body.data ?? body;
  
  if (data.access_token && !data.token) {
    data.token = data.access_token;
  }
  
  return data;
};

export const sendOtp = async (payload: SendOtpPayload) => {
  const response = await apiClient.post('/send-otp', payload);
  const body = response.data as any;
  return body.data ?? body;
};


export const logoutApi = async (): Promise<void> => {
  await apiClient.post('/logout');
};


export const getProfile = async () => {
  const response = await apiClient.get('/profile');
  const body = response.data as any;
  return body.data ?? body;
};

export const updateProfile = async (payload: ProfileUpdatePayload) => {
  const response = await apiClient.put('/profile', payload);
  const body = response.data as any;
  return body.data ?? body;
};
