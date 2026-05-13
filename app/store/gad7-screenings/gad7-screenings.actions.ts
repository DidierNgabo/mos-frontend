import { createAsyncThunk } from '@reduxjs/toolkit';
import { GAD7ScreeningsSource } from '@/app/source';

export const fetchGAD7Screenings = createAsyncThunk(
  'gad7Screenings/fetchAll',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await GAD7ScreeningsSource.fetchGAD7ScreeningsRequest(params);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Request failed');
    }
  },
);

export const createGAD7Screening = createAsyncThunk(
  'gad7Screenings/create',
  async (data: unknown, { rejectWithValue }) => {
    try {
      return await GAD7ScreeningsSource.createGAD7ScreeningRequest(data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Create failed');
    }
  },
);

export const updateGAD7Screening = createAsyncThunk(
  'gad7Screenings/update',
  async ({ id, data }: { id: string; data: unknown }, { rejectWithValue }) => {
    try {
      return await GAD7ScreeningsSource.updateGAD7ScreeningRequest(id, data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Update failed');
    }
  },
);
