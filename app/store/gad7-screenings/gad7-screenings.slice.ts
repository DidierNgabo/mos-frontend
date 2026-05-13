import { createSlice } from '@reduxjs/toolkit';
import { fetchGAD7Screenings, createGAD7Screening, updateGAD7Screening } from './gad7-screenings.actions';
import { GAD7ScreeningState } from './gad7-screenings.types';

const initialState: GAD7ScreeningState = {
  list: [],
  totalNumItems: 0,
  isLoading: false,
  error: null,
};

const gad7ScreeningsSlice = createSlice({
  name: 'gad7Screenings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGAD7Screenings.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchGAD7Screenings.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.list = payload?.items || [];
        state.totalNumItems = payload?.paginationInfo?.totalNumItems || 0;
      })
      .addCase(fetchGAD7Screenings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? action.error.message ?? null;
      })
      .addCase(createGAD7Screening.pending, (state) => { state.error = null; })
      .addCase(createGAD7Screening.rejected, (state, action) => {
        state.error = (action.payload as string) ?? null;
      })
      .addCase(updateGAD7Screening.pending, (state) => { state.error = null; })
      .addCase(updateGAD7Screening.rejected, (state, action) => {
        state.error = (action.payload as string) ?? null;
      });
  },
});

export default gad7ScreeningsSlice.reducer;
