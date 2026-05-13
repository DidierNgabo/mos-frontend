import { createSlice } from '@reduxjs/toolkit';
import { fetchPHQ9Screenings, createPHQ9Screening, updatePHQ9Screening } from './phq9-screenings.actions';
import { PHQ9ScreeningState } from './phq9-screenings.types';

const initialState: PHQ9ScreeningState = {
  list: [],
  totalNumItems: 0,
  isLoading: false,
  error: null,
};

const phq9ScreeningsSlice = createSlice({
  name: 'phq9Screenings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPHQ9Screenings.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchPHQ9Screenings.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.list = payload?.items || [];
        state.totalNumItems = payload?.paginationInfo?.totalNumItems || 0;
      })
      .addCase(fetchPHQ9Screenings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? action.error.message ?? null;
      })
      .addCase(createPHQ9Screening.pending, (state) => { state.error = null; })
      .addCase(createPHQ9Screening.rejected, (state, action) => {
        state.error = (action.payload as string) ?? null;
      })
      .addCase(updatePHQ9Screening.pending, (state) => { state.error = null; })
      .addCase(updatePHQ9Screening.rejected, (state, action) => {
        state.error = (action.payload as string) ?? null;
      });
  },
});

export default phq9ScreeningsSlice.reducer;
