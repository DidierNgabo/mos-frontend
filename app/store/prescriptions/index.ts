import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { PrescriptionsSource } from '@/app/source';

export const fetchPrescriptions = createAsyncThunk(
  'prescriptions/fetchAll',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try { return await PrescriptionsSource.fetchPrescriptionsRequest(params); }
    catch (e: any) { return rejectWithValue(e?.message || 'Failed'); }
  },
);

export const createPrescription = createAsyncThunk(
  'prescriptions/create',
  async (data: unknown, { rejectWithValue }) => {
    try { return await PrescriptionsSource.createPrescriptionRequest(data); }
    catch (e: any) { return rejectWithValue(e?.message || 'Failed'); }
  },
);

export const dispensePrescription = createAsyncThunk(
  'prescriptions/dispense',
  async (id: string, { rejectWithValue }) => {
    try { return await PrescriptionsSource.dispensePrescriptionRequest(id); }
    catch (e: any) { return rejectWithValue(e?.message || 'Failed'); }
  },
);

export const cancelPrescription = createAsyncThunk(
  'prescriptions/cancel',
  async (id: string, { rejectWithValue }) => {
    try { return await PrescriptionsSource.cancelPrescriptionRequest(id); }
    catch (e: any) { return rejectWithValue(e?.message || 'Failed'); }
  },
);

const slice = createSlice({
  name: 'prescriptions',
  initialState: { list: [] as any[], totalNumItems: 0, isLoading: false, error: null as string | null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchPrescriptions.pending, (s) => { s.isLoading = true; })
     .addCase(fetchPrescriptions.fulfilled, (s, { payload }) => { s.isLoading = false; s.list = payload?.items || []; s.totalNumItems = payload?.totalNumItems || 0; })
     .addCase(fetchPrescriptions.rejected, (s, a) => { s.isLoading = false; s.error = (a.payload as string) ?? null; })
     .addCase(createPrescription.fulfilled, (s) => { s.isLoading = false; })
     .addCase(dispensePrescription.fulfilled, (s) => { s.isLoading = false; })
     .addCase(cancelPrescription.fulfilled, (s) => { s.isLoading = false; });
  },
});

export default slice.reducer;
