import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '../types/models';
import { APP_ROLES, AppRoleType } from '../constants/roles';
import { setActiveRole } from '../theme/activeRole';
import { StorageService } from '../services/StorageService';
import { STORAGE_KEYS } from '../constants/storageKeys';
import * as authApi from '../services/api/authApi';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  token: string | null;
  rememberMe: boolean;
  savedPhone: string;
  loginError: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  token: null,
  rememberMe: true,
  savedPhone: '',
  loginError: null,
};

// ─── ASYNC THUNKS ────────────────────────────────────────────────────────────

/**
 * Login: POST /login
 * Authenticates user, saves token to secure storage.
 */
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: { mobile?: string; otp?: string; email?: string; password?: string }, { rejectWithValue }) => {
    try {
      const result = await authApi.login({
        ...(payload.mobile ? { mobile: payload.mobile.replace(/\s+/g, '') } : {}),
        otp: payload.otp,
        email: payload.email,
        password: payload.password,
      });

      // Persist token securely
      await StorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, result.token);

      // Map API user → app UserProfile
      const userProfile: UserProfile = {
        id: String(result.user.id),
        name: result.user.name,
        phone: result.user.mobile,
        email: result.user.email,
        role: (result.user.role as AppRoleType) ?? APP_ROLES.CUSTOMER,
      };

      await StorageService.setItem(STORAGE_KEYS.USER_DATA, userProfile);
      await StorageService.setItem(STORAGE_KEYS.USER_ROLE, userProfile.role);

      return { user: userProfile, token: result.token };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        'Login failed. Please check your credentials.';
      return rejectWithValue(message);
    }
  }
);

/**
 * Logout: POST /logout
 * Revokes token and clears all stored auth data.
 */
export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logoutApi();
  } catch {
    // Even if API call fails, clear local auth
    console.warn('[Auth] Logout API failed — clearing local auth anyway');
  } finally {
    await StorageService.clearAuth();
  }
});

/**
 * Fetch Profile: GET /profile
 */
export const fetchProfileThunk = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await authApi.getProfile();
      return profile;
    } catch {
      return rejectWithValue('Failed to fetch profile');
    }
  }
);

// ─── SLICE ───────────────────────────────────────────────────────────────────

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: UserProfile; token: string }>) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loginError = null;
      setActiveRole(action.payload.user.role);
    },
    switchRole: (state, action: PayloadAction<AppRoleType>) => {
      const targetRole = action.payload;
      if (state.user) {
        state.user = { ...state.user, role: targetRole };
      }
      state.isAuthenticated = true;
      setActiveRole(targetRole);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setRememberMe: (state, action: PayloadAction<boolean>) => {
      state.rememberMe = action.payload;
    },
    setSavedPhone: (state, action: PayloadAction<string>) => {
      state.savedPhone = action.payload;
    },
    clearLoginError: state => {
      state.loginError = null;
    },
    logout: state => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.loginError = null;
      setActiveRole(APP_ROLES.CUSTOMER);
    },
  },
  extraReducers: builder => {
    // ── loginThunk ──
    builder.addCase(loginThunk.pending, state => {
      state.isLoading = true;
      state.loginError = null;
    });
    builder.addCase(loginThunk.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loginError = null;
      setActiveRole(action.payload.user.role);
    });
    builder.addCase(loginThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.loginError = action.payload as string;
    });

    // ── logoutThunk ──
    builder.addCase(logoutThunk.fulfilled, state => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.loginError = null;
      setActiveRole(APP_ROLES.CUSTOMER);
    });

    // ── fetchProfileThunk ──
    builder.addCase(fetchProfileThunk.fulfilled, (state, action) => {
      if (state.user && action.payload) {
        state.user = {
          ...state.user,
          name: action.payload.name ?? state.user.name,
          email: action.payload.email ?? state.user.email,
        };
      }
    });
  },
});

export const {
  loginSuccess,
  switchRole,
  setLoading,
  setRememberMe,
  setSavedPhone,
  clearLoginError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
