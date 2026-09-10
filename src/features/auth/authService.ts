import apiClient from '../../services/apiClient';
import { ENDPOINTS } from '../../services/endpoints';

export const authService = {
  
  login: async (mobile: string, password: string) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { mobile, password });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },
 
  getProfile: async () => {
    const response = await apiClient.get(ENDPOINTS.AUTH.PROFILE);
    const body = response.data as any;
    return body.data ?? body;
  },

  updateProfile: async (payload: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }) => {
    const response = await apiClient.put(ENDPOINTS.AUTH.PROFILE_UPDATE, payload);
    const body = response.data as any;
    return body.data ?? body;
  },
};
