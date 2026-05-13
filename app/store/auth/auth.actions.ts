import { createAsyncThunk } from '@reduxjs/toolkit';
import { ILogin } from '.';
import { AuthSource } from '@/app/source';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload: ILogin, { rejectWithValue }) => {
    try {
      const response = await AuthSource.login(payload);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Login failed',
      );
    }
  },
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await AuthSource.logout();
});
