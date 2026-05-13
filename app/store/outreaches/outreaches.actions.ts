import { createAsyncThunk } from '@reduxjs/toolkit';
import { OutreachesSource } from '@/app/source';

export const fetchOutreaches = createAsyncThunk(
  'outreaches/fetchAll',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await OutreachesSource.fetchOutreachesRequest(params);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Request failed');
    }
  },
);

export const createOutreach = createAsyncThunk(
  'outreaches/create',
  async (data: unknown, { rejectWithValue }) => {
    try {
      return await OutreachesSource.createOutreachRequest(data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Create failed');
    }
  },
);

export const updateOutreach = createAsyncThunk(
  'outreaches/update',
  async ({ id, data }: { id: string; data: unknown }, { rejectWithValue }) => {
    try {
      return await OutreachesSource.updateOutreachRequest(id, data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Update failed');
    }
  },
);

export const deleteOutreach = createAsyncThunk(
  'outreaches/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await OutreachesSource.deleteOutreachRequest(id);
      return id; // Return id to remove from list
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Delete failed');
    }
  },
);

export const addOutreachMember = createAsyncThunk(
  'outreaches/addMember',
  async (
    { outreachId, userIds }: { outreachId: string; userIds: string[] },
    { rejectWithValue },
  ) => {
    try {
      return await OutreachesSource.addMembersRequest(outreachId, userIds);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to add member');
    }
  },
);
