import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { StorageService } from './StorageService';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { API_BASE_URL } from '@env';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipGlobalErrorHandler?: boolean;
    skipToastError?: boolean;
    retryCount?: number;
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

      if (token && config.headers) {
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

    // Auto-logout on 401 Unauthorized
    if (status === 401) {
      console.warn('[API] 401 Unauthorized — clearing auth token');
      await StorageService.clearAuth();
    }

    return Promise.reject(error);
  }
);

export default apiClient;
