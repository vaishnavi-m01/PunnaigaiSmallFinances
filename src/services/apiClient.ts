import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { StorageService } from './StorageService';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { API_BASE_URL } from '@env';
import * as NavigationService from '../navigation/navigationService';
import { ROUTES } from '../constants/routes';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipGlobalErrorHandler?: boolean;
    skipToastError?: boolean;
    retryCount?: number;
    skipAuth?: boolean;
  }
}

const BASE_URL = API_BASE_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// ─── REQUEST INTERCEPTOR ────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await StorageService.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);

      if (token && config.headers && !config.skipAuth) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (config.data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
      } else if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }

      // ── Console log every outgoing request ──
      console.log(
        `\n🚀 [API REQUEST]\n  Method : ${(config.method ?? 'GET').toUpperCase()}\n  URL    : ${BASE_URL}${config.url}\n  Headers: ${JSON.stringify({ Authorization: config.headers.Authorization ? 'Bearer ***' : 'none' })}\n  Body   : ${config.data ? JSON.stringify(config.data) : 'none'}\n`
      );
    } catch (error) {
      console.error('[API Request] Token fetch error:', error);
    }
    return config;
  },
  error => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ───────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(
      `\n✅ [API RESPONSE]\n  URL    : ${response.config.url}\n  Status : ${response.status}\n  Data   : ${JSON.stringify(response.data)}\n`
    );
    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;

    console.error(
      `\n❌ [API ERROR]\n  URL    : ${url}\n  Status : ${status ?? 'Network Error'}\n  Message: ${JSON.stringify(error.response?.data)}\n`
    );

    const responseData = error.response?.data as any;
    const errorMessage = responseData?.message;

    // Auto-logout on 401 Unauthorized or if the partner profile is deleted/inactive
    if (status === 401 || (status === 404 && errorMessage === 'No active partner profile is available.')) {
      console.warn('[API] Unauthorized or No Active Profile — clearing auth token');
      await StorageService.clearAuth();
      NavigationService.reset(ROUTES.LOGIN);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
