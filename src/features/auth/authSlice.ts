import { createSlice } from '@reduxjs/toolkit';
import { AuthState } from './authTypes';
import { loginThunk, loadStoredAuth, logoutThunk, fetchProfileThunk } from './authThunks';
import { setActiveRole } from '../../theme/activeRole';

const initialState: AuthState = {
  loading: false,
  error: null,
  user: null,
  profile: null,
  role: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.token = null;
      state.user = null;
      state.profile = null;
      state.role = null;
      state.error = null;
    },
    clearLoginError: (state) => {
      state.error = null;
    }
  },
  extraReducers: builder => {
    builder
      // Login
      .addCase(loginThunk.pending, state => { state.loading = true; state.error = null; })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.role = action.payload.role;
        setActiveRole(action.payload.role);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Load Stored Auth
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.role = action.payload.role;
        setActiveRole(action.payload.role);
      })
      .addCase(loadStoredAuth.rejected, state => {
        state.token = null;
        state.user = null;
        state.role = null;
      })
      
      // Logout
      .addCase(logoutThunk.fulfilled, state => {
        state.token = null;
        state.user = null;
        state.profile = null;
        state.role = null;
      })

      // Fetch Profile
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        // The API returns { user: {...}, profile: {...}, role: "agent" }
        // We can store `profile` which has agent/partner specific details
        state.profile = action.payload?.profile || null;
      });
  },
});

export const { clearAuth, clearLoginError } = authSlice.actions;
export default authSlice.reducer;
