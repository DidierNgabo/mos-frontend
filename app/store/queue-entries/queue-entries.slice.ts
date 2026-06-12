import { createSlice } from '@reduxjs/toolkit';
import {
  fetchQueueEntries,
  fetchMyQueue,
  createQueueEntry,
  moveQueueEntry,
  updateQueueStatus,
  deleteQueueEntry,
  fetchPatientChart,
} from './queue-entries.actions';
import { QueueEntriesState } from './queue-entries.types';

const initialState: QueueEntriesState = {
  list: [],
  totalNumItems: 0,
  isLoadingQueue: false,
  isCreatingEntry: false,
  isUpdatingEntry: false,
  isDeletingEntry: false,
  queueError: null,
  chart: null,
  isLoadingChart: false,
  queueScope: null,
};

const queueEntriesSlice = createSlice({
  name: 'queueEntries',
  initialState,
  reducers: {
    resetQueueError(state) {
      state.queueError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQueueEntries.pending, (state) => { state.isLoadingQueue = true; state.queueError = null; })
      .addCase(fetchQueueEntries.fulfilled, (state, { payload }) => {
        state.isLoadingQueue = false;
        state.list = payload?.items || [];
        state.totalNumItems = payload?.paginationInfo?.totalNumItems || 0;
        state.queueScope = payload?.queueScope ?? null;
      })
      .addCase(fetchQueueEntries.rejected, (state, action) => {
        state.isLoadingQueue = false;
        state.queueError = (action.payload as string) ?? action.error.message ?? null;
      })
      .addCase(fetchMyQueue.pending, (state) => { state.isLoadingQueue = true; state.queueError = null; })
      .addCase(fetchMyQueue.fulfilled, (state, { payload }) => {
        state.isLoadingQueue = false;
        state.list = payload?.items || [];
        state.totalNumItems = payload?.paginationInfo?.totalNumItems || 0;
        state.queueScope = payload?.queueScope ?? null;
      })
      .addCase(fetchMyQueue.rejected, (state, action) => {
        state.isLoadingQueue = false;
        state.queueError = (action.payload as string) ?? action.error.message ?? null;
      })
      .addCase(createQueueEntry.pending, (state) => { state.isCreatingEntry = true; })
      .addCase(createQueueEntry.fulfilled, (state) => { state.isCreatingEntry = false; })
      .addCase(createQueueEntry.rejected, (state, action) => {
        state.isCreatingEntry = false;
        state.queueError = (action.payload as string) ?? null;
      })
      .addCase(moveQueueEntry.pending, (state) => { state.isUpdatingEntry = true; })
      .addCase(moveQueueEntry.fulfilled, (state) => { state.isUpdatingEntry = false; })
      .addCase(moveQueueEntry.rejected, (state, action) => {
        state.isUpdatingEntry = false;
        state.queueError = (action.payload as string) ?? null;
      })
      .addCase(updateQueueStatus.pending, (state) => { state.isUpdatingEntry = true; })
      .addCase(updateQueueStatus.fulfilled, (state) => { state.isUpdatingEntry = false; })
      .addCase(updateQueueStatus.rejected, (state, action) => {
        state.isUpdatingEntry = false;
        state.queueError = (action.payload as string) ?? null;
      })
      .addCase(deleteQueueEntry.pending, (state) => { state.isDeletingEntry = true; })
      .addCase(deleteQueueEntry.fulfilled, (state) => { state.isDeletingEntry = false; })
      .addCase(deleteQueueEntry.rejected, (state, action) => {
        state.isDeletingEntry = false;
        state.queueError = (action.payload as string) ?? null;
      })
      .addCase(fetchPatientChart.pending, (state) => { state.isLoadingChart = true; state.chart = null; })
      .addCase(fetchPatientChart.fulfilled, (state, { payload }) => {
        state.isLoadingChart = false;
        state.chart = payload;
      })
      .addCase(fetchPatientChart.rejected, (state) => { state.isLoadingChart = false; });
  },
});

export const { resetQueueError } = queueEntriesSlice.actions;
export default queueEntriesSlice.reducer;
