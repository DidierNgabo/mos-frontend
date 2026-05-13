import { createAsyncThunk } from '@reduxjs/toolkit';
import { UsersSource } from '@/app/source';

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await UsersSource.fetchUsersRequest(params);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Request failed');
    }
  },
);

export const createUser = createAsyncThunk(
  'users/create',
  async (data: unknown, { rejectWithValue }) => {
    try {
      return await UsersSource.createUserRequest(data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Create failed');
    }
  },
);

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, data }: { id: string; data: unknown }, { rejectWithValue }) => {
    try {
      return await UsersSource.updateUserRequest(id, data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Update failed');
    }
  },
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await UsersSource.deleteUserRequest(id);
      return id; // Return id to remove from list
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Delete failed');
    }
  },
);
