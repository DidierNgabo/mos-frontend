import { createAsyncThunk } from '@reduxjs/toolkit';
import { PatientsSource } from '@/app/source';

export const fetchPatients = createAsyncThunk(
  'patients/fetchAll',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await PatientsSource.fetchPatientsRequest(params);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Request failed');
    }
  },
);

export const createPatient = createAsyncThunk(
  'patients/create',
  async (data: unknown, { rejectWithValue }) => {
    try {
      return await PatientsSource.createPatientRequest(data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Create failed');
    }
  },
);

export const updatePatient = createAsyncThunk(
  'patients/update',
  async ({ id, data }: { id: string; data: unknown }, { rejectWithValue }) => {
    try {
      return await PatientsSource.updatePatientRequest(id, data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Update failed');
    }
  },
);

export const deletePatient = createAsyncThunk(
  'patients/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await PatientsSource.deletePatientRequest(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Delete failed');
    }
  },
);
