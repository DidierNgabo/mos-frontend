import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { CommunicableDiseasesSource } from '@/app/source';

export const fetchCommunicableDiseases = createAsyncThunk(
  'communicableDiseases/fetchAll',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try { return await CommunicableDiseasesSource.fetchCommunicableDiseasesRequest(params); }
    catch (e: any) { return rejectWithValue(e?.message || 'Failed'); }
  },
);
export const createCommunicableDisease = createAsyncThunk(
  'communicableDiseases/create',
  async (data: unknown, { rejectWithValue }) => {
    try { return await CommunicableDiseasesSource.createCommunicableDiseaseRequest(data); }
    catch (e: any) { return rejectWithValue(e?.message || 'Failed'); }
  },
);
export const updateCommunicableDisease = createAsyncThunk(
  'communicableDiseases/update',
  async ({ id, data }: { id: string; data: unknown }, { rejectWithValue }) => {
    try { return await CommunicableDiseasesSource.updateCommunicableDiseaseRequest(id, data); }
    catch (e: any) { return rejectWithValue(e?.message || 'Failed'); }
  },
);

const slice = createSlice({
  name: 'communicableDiseases',
  initialState: { list: [] as any[], totalNumItems: 0, isLoading: false, error: null as string | null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchCommunicableDiseases.pending, (s) => { s.isLoading = true; })
     .addCase(fetchCommunicableDiseases.fulfilled, (s, { payload }) => { s.isLoading = false; s.list = payload?.items || []; s.totalNumItems = payload?.totalNumItems || 0; })
     .addCase(fetchCommunicableDiseases.rejected, (s, a) => { s.isLoading = false; s.error = (a.payload as string) ?? null; })
     .addCase(createCommunicableDisease.fulfilled, (s) => { s.isLoading = false; })
     .addCase(updateCommunicableDisease.fulfilled, (s) => { s.isLoading = false; });
  },
});
export default slice.reducer;
