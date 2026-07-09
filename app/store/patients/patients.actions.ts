import { createAsyncThunk } from '@reduxjs/toolkit';
import { PatientsSource } from '@/app/source';

function extractErrorMsg(error: any, fallback: string): string {
  const data = error?.response?.data;
  if (data) {
    if (Array.isArray(data.message)) return data.message.join('; ');
    if (typeof data.message === 'string') return data.message;
  }
  return error?.message || fallback;
}

export const fetchPatients = createAsyncThunk(
  'patients/fetchAll',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await PatientsSource.fetchPatientsRequest(params);
    } catch (error: any) {
      return rejectWithValue(extractErrorMsg(error, 'Request failed'));
    }
  },
);

export const createPatient = createAsyncThunk(
  'patients/create',
  async (data: unknown, { rejectWithValue }) => {
    try {
      return await PatientsSource.createPatientRequest(data);
    } catch (error: any) {
      return rejectWithValue(extractErrorMsg(error, 'Failed to register patient'));
    }
  },
);

export const updatePatient = createAsyncThunk(
  'patients/update',
  async ({ id, data }: { id: string; data: unknown }, { rejectWithValue }) => {
    try {
      return await PatientsSource.updatePatientRequest(id, data);
    } catch (error: any) {
      return rejectWithValue(extractErrorMsg(error, 'Failed to update patient'));
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
      return rejectWithValue(extractErrorMsg(error, 'Failed to delete patient'));
    }
  },
);
