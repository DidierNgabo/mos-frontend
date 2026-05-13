import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TransfersSource } from '@/app/source';

export const fetchTransfers = createAsyncThunk(
  'transfers/fetchAll',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try { return await TransfersSource.fetchTransfersRequest(params); }
    catch (e: any) { return rejectWithValue(e?.message || 'Failed'); }
  },
);
export const createTransfer = createAsyncThunk(
  'transfers/create',
  async (data: unknown, { rejectWithValue }) => {
    try { return await TransfersSource.createTransferRequest(data); }
    catch (e: any) { return rejectWithValue(e?.message || 'Failed'); }
  },
);
export const updateTransfer = createAsyncThunk(
  'transfers/update',
  async ({ id, data }: { id: string; data: unknown }, { rejectWithValue }) => {
    try { return await TransfersSource.updateTransferRequest(id, data); }
    catch (e: any) { return rejectWithValue(e?.message || 'Failed'); }
  },
);

const slice = createSlice({
  name: 'transfers',
  initialState: { list: [] as any[], totalNumItems: 0, isLoading: false, error: null as string | null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchTransfers.pending, (s) => { s.isLoading = true; })
     .addCase(fetchTransfers.fulfilled, (s, { payload }) => { s.isLoading = false; s.list = payload?.items || []; s.totalNumItems = payload?.totalNumItems || 0; })
     .addCase(fetchTransfers.rejected, (s, a) => { s.isLoading = false; s.error = (a.payload as string) ?? null; })
     .addCase(createTransfer.fulfilled, (s) => { s.isLoading = false; })
     .addCase(updateTransfer.fulfilled, (s) => { s.isLoading = false; });
  },
});
export default slice.reducer;
