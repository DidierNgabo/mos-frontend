import { createAsyncThunk } from '@reduxjs/toolkit';
import { RolesSource } from '@/app/source';

export const fetchRoles = createAsyncThunk(
  'roles/fetchAll',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await RolesSource.fetchRolesRequest(params);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Request failed');
    }
  },
);

export const createRole = createAsyncThunk(
  'roles/create',
  async (data: unknown, { rejectWithValue }) => {
    try {
      return await RolesSource.createRoleRequest(data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Create failed');
    }
  },
);

export const updateRole = createAsyncThunk(
  'roles/update',
  async ({ id, data }: { id: string; data: unknown }, { rejectWithValue }) => {
    try {
      return await RolesSource.updateRoleRequest(id, data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Update failed');
    }
  },
);

export const deleteRole = createAsyncThunk(
  'roles/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await RolesSource.deleteRoleRequest(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Delete failed');
    }
  },
);
