import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ObservationsSource } from '@/app/source';

export const fetchObservations = createAsyncThunk(
  'observations/fetchAll',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try { return await ObservationsSource.fetchObservationsRequest(params); }
    catch (e: any) { return rejectWithValue(e?.message || 'Failed'); }
  },
);
export const createObservation = createAsyncThunk(
  'observations/create',
  async (data: unknown, { rejectWithValue }) => {
    try { return await ObservationsSource.createObservationRequest(data); }
    catch (e: any) { return rejectWithValue(e?.message || 'Failed'); }
  },
);
export const updateObservation = createAsyncThunk(
  'observations/update',
  async ({ id, data }: { id: string; data: unknown }, { rejectWithValue }) => {
    try { return await ObservationsSource.updateObservationRequest(id, data); }
    catch (e: any) { return rejectWithValue(e?.message || 'Failed'); }
  },
);
export const deleteObservation = createAsyncThunk(
  'observations/delete',
  async (id: string, { rejectWithValue }) => {
    try { await ObservationsSource.deleteObservationRequest(id); return id; }
    catch (e: any) { return rejectWithValue(e?.message || 'Failed'); }
  },
);

const slice = createSlice({
  name: 'observations',
  initialState: { list: [] as any[], totalNumItems: 0, isLoading: false, error: null as string | null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchObservations.pending, (s) => { s.isLoading = true; })
     .addCase(fetchObservations.fulfilled, (s, { payload }) => { s.isLoading = false; s.list = payload?.items || []; s.totalNumItems = payload?.totalNumItems || 0; })
     .addCase(fetchObservations.rejected, (s, a) => { s.isLoading = false; s.error = (a.payload as string) ?? null; })
     .addCase(createObservation.fulfilled, (s) => { s.isLoading = false; })
     .addCase(updateObservation.fulfilled, (s) => { s.isLoading = false; })
     .addCase(deleteObservation.fulfilled, (s) => { s.isLoading = false; });
  },
});
export default slice.reducer;
