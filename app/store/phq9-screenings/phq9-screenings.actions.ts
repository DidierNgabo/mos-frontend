import { createAsyncThunk } from '@reduxjs/toolkit';
import { PHQ9ScreeningsSource } from '@/app/source';

export const fetchPHQ9Screenings = createAsyncThunk(
  'phq9Screenings/fetchAll',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await PHQ9ScreeningsSource.fetchPHQ9ScreeningsRequest(params);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Request failed');
    }
  },
);

export const createPHQ9Screening = createAsyncThunk(
  'phq9Screenings/create',
  async (data: unknown, { rejectWithValue }) => {
    try {
      return await PHQ9ScreeningsSource.createPHQ9ScreeningRequest(data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Create failed');
    }
  },
);

export const updatePHQ9Screening = createAsyncThunk(
  'phq9Screenings/update',
  async ({ id, data }: { id: string; data: unknown }, { rejectWithValue }) => {
    try {
      return await PHQ9ScreeningsSource.updatePHQ9ScreeningRequest(id, data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Update failed');
    }
  },
);
