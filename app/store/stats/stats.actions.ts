import { createAsyncThunk } from '@reduxjs/toolkit';
import { StatsSource } from '@/app/source';

export const fetchAdminStats = createAsyncThunk(
  'stats/fetchAdmin',
  async (outreachId: string, { rejectWithValue }) => {
    try {
      return await StatsSource.fetchAdminStatsRequest(outreachId);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Request failed';
      return rejectWithValue(msg);
    }
  },
);

export const fetchMyStats = createAsyncThunk(
  'stats/fetchMe',
  async (outreachId: string, { rejectWithValue }) => {
    try {
      return await StatsSource.fetchMyStatsRequest(outreachId);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Request failed';
      return rejectWithValue(msg);
    }
  },
);
