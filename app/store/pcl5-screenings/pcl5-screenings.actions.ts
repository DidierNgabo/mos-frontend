import { createAsyncThunk } from '@reduxjs/toolkit';
import { PCL5ScreeningsSource } from '@/app/source';

export const fetchPCL5Screenings = createAsyncThunk(
  'pcl5Screenings/fetchAll',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await PCL5ScreeningsSource.fetchPCL5ScreeningsRequest(params);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Request failed');
    }
  },
);

export const createPCL5Screening = createAsyncThunk(
  'pcl5Screenings/create',
  async (data: unknown, { rejectWithValue }) => {
    try {
      return await PCL5ScreeningsSource.createPCL5ScreeningRequest(data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Create failed');
    }
  },
);

export const updatePCL5Screening = createAsyncThunk(
  'pcl5Screenings/update',
  async ({ id, data }: { id: string; data: unknown }, { rejectWithValue }) => {
    try {
      return await PCL5ScreeningsSource.updatePCL5ScreeningRequest(id, data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Update failed');
    }
  },
);
