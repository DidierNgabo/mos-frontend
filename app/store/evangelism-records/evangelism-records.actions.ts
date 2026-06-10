import { createAsyncThunk } from '@reduxjs/toolkit';
import { EvangelismRecordsSource } from '@/app/source';

export const fetchEvangelismRecords = createAsyncThunk(
  'evangelismRecords/fetchAll',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await EvangelismRecordsSource.fetchEvangelismRecordsRequest(params);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Request failed');
    }
  },
);

export const createEvangelismRecord = createAsyncThunk(
  'evangelismRecords/create',
  async (data: unknown, { rejectWithValue }) => {
    try {
      return await EvangelismRecordsSource.createEvangelismRecordRequest(data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Create failed');
    }
  },
);

export const updateEvangelismRecord = createAsyncThunk(
  'evangelismRecords/update',
  async ({ id, data }: { id: string; data: unknown }, { rejectWithValue }) => {
    try {
      return await EvangelismRecordsSource.updateEvangelismRecordRequest(id, data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Update failed');
    }
  },
);

export const deleteEvangelismRecord = createAsyncThunk(
  'evangelismRecords/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await EvangelismRecordsSource.deleteEvangelismRecordRequest(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Delete failed');
    }
  },
);
