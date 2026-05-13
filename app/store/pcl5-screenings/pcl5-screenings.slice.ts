import { createSlice } from '@reduxjs/toolkit';
import { fetchPCL5Screenings, createPCL5Screening, updatePCL5Screening } from './pcl5-screenings.actions';
import { PCL5ScreeningState } from './pcl5-screenings.types';

const initialState: PCL5ScreeningState = {
  list: [],
  totalNumItems: 0,
  isLoading: false,
  error: null,
};

const pcl5ScreeningsSlice = createSlice({
  name: 'pcl5Screenings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPCL5Screenings.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchPCL5Screenings.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.list = payload?.items || [];
        state.totalNumItems = payload?.paginationInfo?.totalNumItems || 0;
      })
      .addCase(fetchPCL5Screenings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? action.error.message ?? null;
      })
      .addCase(createPCL5Screening.pending, (state) => { state.error = null; })
      .addCase(createPCL5Screening.rejected, (state, action) => {
        state.error = (action.payload as string) ?? null;
      })
      .addCase(updatePCL5Screening.pending, (state) => { state.error = null; })
      .addCase(updatePCL5Screening.rejected, (state, action) => {
        state.error = (action.payload as string) ?? null;
      });
  },
});

export default pcl5ScreeningsSlice.reducer;
