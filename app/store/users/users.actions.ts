import { createAsyncThunk } from '@reduxjs/toolkit';
import { UsersSource } from '@/app/source';

function extractErrorMsg(error: any, fallback: string): string {
  const data = error?.response?.data;
  if (data) {
    if (Array.isArray(data.message)) return data.message.join('; ');
    if (typeof data.message === 'string') return data.message;
  }
  return error?.message || fallback;
}

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await UsersSource.fetchUsersRequest(params);
    } catch (error: any) {
      return rejectWithValue(extractErrorMsg(error, 'Request failed'));
    }
  },
);

export const createUser = createAsyncThunk(
  'users/create',
  async (data: unknown, { rejectWithValue }) => {
    try {
      return await UsersSource.createUserRequest(data);
    } catch (error: any) {
      return rejectWithValue(extractErrorMsg(error, 'Failed to create user'));
    }
  },
);

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, data }: { id: string; data: unknown }, { rejectWithValue }) => {
    try {
      return await UsersSource.updateUserRequest(id, data);
    } catch (error: any) {
      return rejectWithValue(extractErrorMsg(error, 'Failed to update user'));
    }
  },
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await UsersSource.deleteUserRequest(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(extractErrorMsg(error, 'Failed to delete user'));
    }
  },
);
