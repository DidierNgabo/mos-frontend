import { createAsyncThunk } from '@reduxjs/toolkit';
import { QueueEntriesSource } from '@/app/source';

export const fetchQueueEntries = createAsyncThunk(
  'queueEntries/fetchAll',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await QueueEntriesSource.fetchQueueEntriesRequest(params);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Request failed');
    }
  },
);

export const fetchMyQueue = createAsyncThunk(
  'queueEntries/fetchMyQueue',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await QueueEntriesSource.fetchMyQueueRequest(params);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Request failed');
    }
  },
);

export const createQueueEntry = createAsyncThunk(
  'queueEntries/create',
  async (data: unknown, { rejectWithValue }) => {
    try {
      return await QueueEntriesSource.createQueueEntryRequest(data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Create failed');
    }
  },
);

export const moveQueueEntry = createAsyncThunk(
  'queueEntries/move',
  async ({ id, data }: { id: string; data: unknown }, { rejectWithValue }) => {
    try {
      return await QueueEntriesSource.moveQueueEntryRequest(id, data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Move failed');
    }
  },
);

export const updateQueueStatus = createAsyncThunk(
  'queueEntries/updateStatus',
  async ({ id, data }: { id: string; data: unknown }, { rejectWithValue }) => {
    try {
      return await QueueEntriesSource.updateQueueStatusRequest(id, data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Status update failed');
    }
  },
);

export const fetchPatientChart = createAsyncThunk(
  'queueEntries/fetchChart',
  async (entryId: string, { rejectWithValue }) => {
    try {
      return await QueueEntriesSource.fetchPatientChartRequest(entryId);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to load patient chart');
    }
  },
);

export const deleteQueueEntry = createAsyncThunk(
  'queueEntries/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await QueueEntriesSource.deleteQueueEntryRequest(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Delete failed');
    }
  },
);
