import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { LabResultsSource } from '@/app/source';

export const fetchLabResults = createAsyncThunk(
  'labResults/fetchAll',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try { return await LabResultsSource.fetchLabResultsRequest(params); }
    catch (e: any) { return rejectWithValue(e?.message || 'Failed'); }
  },
);
export const createLabResult = createAsyncThunk(
  'labResults/create',
  async (data: unknown, { rejectWithValue }) => {
    try { return await LabResultsSource.createLabResultRequest(data); }
    catch (e: any) { return rejectWithValue(e?.message || 'Failed'); }
  },
);
export const updateLabResult = createAsyncThunk(
  'labResults/update',
  async ({ id, data }: { id: string; data: unknown }, { rejectWithValue }) => {
    try { return await LabResultsSource.updateLabResultRequest(id, data); }
    catch (e: any) { return rejectWithValue(e?.message || 'Failed'); }
  },
);
export const deleteLabResult = createAsyncThunk(
  'labResults/delete',
  async (id: string, { rejectWithValue }) => {
    try { await LabResultsSource.deleteLabResultRequest(id); return id; }
    catch (e: any) { return rejectWithValue(e?.message || 'Failed'); }
  },
);

const slice = createSlice({
  name: 'labResults',
  initialState: { list: [] as any[], totalNumItems: 0, isLoading: false, error: null as string | null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchLabResults.pending, (s) => { s.isLoading = true; })
     .addCase(fetchLabResults.fulfilled, (s, { payload }) => { s.isLoading = false; s.list = payload?.items || []; s.totalNumItems = payload?.totalNumItems || 0; })
     .addCase(fetchLabResults.rejected, (s, a) => { s.isLoading = false; s.error = (a.payload as string) ?? null; })
     .addCase(createLabResult.fulfilled, (s) => { s.isLoading = false; })
     .addCase(updateLabResult.fulfilled, (s) => { s.isLoading = false; })
     .addCase(deleteLabResult.fulfilled, (s) => { s.isLoading = false; });
  },
});
export default slice.reducer;
