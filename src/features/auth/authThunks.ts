import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from './authService';
import { StorageService } from '../../services/StorageService';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { AppRoleType } from '../../constants/roles';
import { parseApiError } from '../../utils/apiError';
import { clearAuth } from '../../features/auth/authSlice';


export const loginThunk = createAsyncThunk(
  'auth/login',
  async (
    { mobile, password }: { mobile: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await authService.login(mobile.replace(/\s+/g, ''), password);
      
      const userObj = data.user;
      const userRole = (userObj.role as AppRoleType) || 'CUSTOMER';

      await StorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
      await StorageService.setItem(STORAGE_KEYS.USER_DATA, userObj);
      await StorageService.setItem(STORAGE_KEYS.USER_ROLE, userRole);

      return {
        token: data.token,
        user: userObj,
        role: userRole,
      };
    } catch (error: any) {
      console.error('API Error:', error);
      const errorMsg = parseApiError(error);
      return rejectWithValue(errorMsg);
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStoredAuth',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const token = await StorageService.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
      const user = await StorageService.getItem<any>(STORAGE_KEYS.USER_DATA);
      const role = await StorageService.getItem<AppRoleType>(STORAGE_KEYS.USER_ROLE);

      if (token && user && role) {
        return { token, user, role };
      }

      await StorageService.clearAuth();
      dispatch(clearAuth());
      return rejectWithValue('Invalid or missing stored auth');
    } catch (error: any) {
      console.error('API Error:', error);
      await StorageService.clearAuth();
      dispatch(clearAuth());
      return rejectWithValue('Failed to load auth');
    }
  }
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await authService.logout();
    } catch {
      console.warn('Server logout skipped/failed');
    } finally {
      await StorageService.clearAuth();
      dispatch(clearAuth());
    }
  }
);
