import { createAsyncThunk } from '@reduxjs/toolkit';
import { VitalSignsSource } from '@/app/source';

export const fetchVitalSigns = createAsyncThunk(
  'vitalSigns/fetchAll',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await VitalSignsSource.fetchVitalSignsRequest(params);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Request failed');
    }
  },
);

export const createVitalSign = createAsyncThunk(
  'vitalSigns/create',
  async (data: unknown, { rejectWithValue }) => {
    try {
      return await VitalSignsSource.createVitalSignRequest(data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Create failed');
    }
  },
);

export const updateVitalSign = createAsyncThunk(
  'vitalSigns/update',
  async ({ id, data }: { id: string; data: unknown }, { rejectWithValue }) => {
    try {
      return await VitalSignsSource.updateVitalSignRequest(id, data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Update failed');
    }
  },
);

export const deleteVitalSign = createAsyncThunk(
  'vitalSigns/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await VitalSignsSource.deleteVitalSignRequest(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Delete failed');
    }
  },
);
