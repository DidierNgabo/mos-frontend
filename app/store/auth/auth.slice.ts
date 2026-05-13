import { createSlice } from '@reduxjs/toolkit';
import { loginUser, logoutUser } from './auth.actions';
import { AuthUser } from './auth.types';

interface IInitialAuthSliceState {
  isAuthenticated: boolean;
  isRegisteringUser: boolean;
  isLoggingInUser: boolean;
  authError: string | null;
  user: AuthUser | null;
}

const getStoredUser = (): AuthUser | null => {
  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
  }
  return null;
};

const getStoredAuthStatus = (): boolean => {
  if (typeof window !== 'undefined') {
    return !!(localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken'));
  }
  return false;
};

const initialState: IInitialAuthSliceState = {
  isAuthenticated: getStoredAuthStatus(),
  isRegisteringUser: false,
  isLoggingInUser: false,
  authError: null,
  user: getStoredUser(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthState(state) {
      state.isAuthenticated = false;
      state.isRegisteringUser = false;
      state.authError = null;
      state.user = null;
    },
    clearMustChangePassword(state) {
      if (state.user) {
        state.user.mustChangePassword = false;
      }
    },
  },
  extraReducers: (builder) => {
    // Handle loginUser actions
    builder.addCase(loginUser.pending, (state) => {
      state.isLoggingInUser = true;
      state.authError = null;
    });
    builder.addCase(loginUser.fulfilled, (state, { payload }) => {
      state.isLoggingInUser = false;
      state.isAuthenticated = true;
      state.authError = null;
      if (payload && payload.user) {
        state.user = {
          ...payload.user,
          mustChangePassword: payload.mustChangePassword ?? false,
          isActive: payload.user.isActive ?? true,
        };
      }
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoggingInUser = false;
      state.authError = action.error.message || 'Login failed';
    });

    builder.addCase(logoutUser.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.authError = null;
      state.user = null;
    });
    builder.addCase(logoutUser.rejected, (state) => {
      state.isAuthenticated = false;
      state.user = null;
    });
  },
});

export const { resetAuthState, clearMustChangePassword } = authSlice.actions;

export default authSlice.reducer;
