import { createSlice } from '@reduxjs/toolkit';
import { fetchAdminStats, fetchMyStats } from './stats.actions';
import { StatsState } from './stats.types';

const initialState: StatsState = {
  adminStats: null,
  myStats: null,
  isLoading: false,
  error: null,
};

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    clearStats(state) {
      state.adminStats = null;
      state.myStats = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.adminStats = payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? action.error.message ?? null;
      })
      .addCase(fetchMyStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyStats.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.myStats = payload;
      })
      .addCase(fetchMyStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? action.error.message ?? null;
      });
  },
});

export const { clearStats } = statsSlice.actions;
export default statsSlice.reducer;
