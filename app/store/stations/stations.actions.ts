import { createAsyncThunk } from '@reduxjs/toolkit';
import { StationsSource } from '@/app/source';

export const fetchStations = createAsyncThunk(
  'stations/fetchAll',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await StationsSource.fetchStationsRequest(params);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Request failed');
    }
  },
);

export const createStation = createAsyncThunk(
  'stations/create',
  async (data: unknown, { rejectWithValue }) => {
    try {
      return await StationsSource.createStationRequest(data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Create failed');
    }
  },
);

export const updateStation = createAsyncThunk(
  'stations/update',
  async ({ id, data }: { id: string; data: unknown }, { rejectWithValue }) => {
    try {
      return await StationsSource.updateStationRequest(id, data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Update failed');
    }
  },
);

export const deleteStation = createAsyncThunk(
  'stations/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await StationsSource.deleteStationRequest(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Delete failed');
    }
  },
);
